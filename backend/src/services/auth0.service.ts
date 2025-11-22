import 'dotenv/config';
import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * Custom error for Auth0 Management API operations
 */
export class Auth0Error extends Error {
  public readonly statusCode?: number;
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly requestId?: string;
  public readonly isAxiosError?: boolean;

  constructor(message: string, statusCode?: number, code?: string, details?: unknown, requestId?: string, isAxiosError?: boolean) {
    super(message);
    this.name = 'Auth0Error';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    this.isAxiosError = isAxiosError;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Basic Auth0 user shape (subset of fields)
 */
export interface Auth0User {
  user_id: string;
  email?: string;
  email_verified?: boolean;
  username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  picture?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  last_ip?: string;
  logins_count?: number;
  blocked?: boolean;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  identities?: Array<{
    provider: string;
    user_id: string;
    connection?: string;
    isSocial?: boolean;
  }>;
}

/**
 * DTO for creating a user in Auth0
 * Note: "connection" is required for database connections.
 */
export interface CreateUserDto {
  connection: string; // e.g., 'Username-Password-Authentication'
  email?: string;
  username?: string;
  password?: string;
  phone_number?: string;
  user_id?: string; // only for non-database connections
  email_verified?: boolean;
  verify_email?: boolean;
  phone_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  picture?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  blocked?: boolean;
}

/**
 * DTO for updating a user in Auth0
 */
export interface UpdateUserDto {
  email?: string;
  username?: string;
  password?: string; // only for database connections
  phone_number?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  picture?: string;
  blocked?: boolean;
  email_verified?: boolean;
  verify_email?: boolean;
  phone_verified?: boolean;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

/**
 * Role shape returned by Auth0
 */
export interface Auth0Role {
  id: string;
  name: string;
  description?: string;
}

/**
 * Response shape for paginated users
 */
export interface GetUsersResponse {
  users: Auth0User[];
  start: number;
  length: number;
  total: number;
}

/**
 * Auth0 Management API Service
 * - Framework-agnostic
 * - Uses Axios
 * - Caches management token in memory
 */
export class Auth0Service {
  private readonly domain: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly audience: string; // Typically https://${domain}/api/v2/
  private readonly axiosInstance: AxiosInstance;
  private readonly tokenAxios: AxiosInstance;

  // In-memory token cache
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0; // epoch ms
  private tokenPromise: Promise<string> | null = null;
  private readonly tokenSkewMs = 60_000; // refresh 60s before expiry

  constructor(config?: {
    domain?: string;
    clientId?: string;
    clientSecret?: string;
    audience?: string;
    timeoutMs?: number;
  }) {
    this.domain = (config?.domain || process.env.AUTH0_DOMAIN || '').toString();
    this.clientId = (config?.clientId || process.env.AUTH0_M2M_CLIENT_ID || '').toString();
    this.clientSecret = (config?.clientSecret || process.env.AUTH0_M2M_CLIENT_SECRET || '').toString();
    this.audience = (
      config?.audience ||
      process.env.AUTH0_MANAGEMENT_API ||
      `https://${this.domain}/api/v2/`
    ).toString();

    this.assertConfig();

    const timeoutMs = config?.timeoutMs ?? 15_000;

    // Axios instance for management API calls
    this.axiosInstance = axios.create({
      baseURL: `https://${this.domain}/api/v2`,
      timeout: timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Axios instance for token endpoint (no interceptors to avoid recursion)
    this.tokenAxios = axios.create({
      baseURL: `https://${this.domain}`,
      timeout: timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Request interceptor to inject Bearer token
    this.axiosInstance.interceptors.request.use(async (config) => {
      const token = await this.getManagementToken();
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      return config;
    });
  }

  /**
   * Ensure required configuration is present
   */
  private assertConfig() {
    const missing: string[] = [];
    if (!this.domain) missing.push('AUTH0_DOMAIN');
    if (!this.clientId) missing.push('AUTH0_M2M_CLIENT_ID');
    if (!this.clientSecret) missing.push('AUTH0_M2M_CLIENT_SECRET');
    if (missing.length) {
      throw new Auth0Error(
        `Missing Auth0 environment variables: ${missing.join(', ')}`,
        500,
        'AUTH0_CONFIG_ERROR'
      );
    }
  }

  /**
   * Checks if cached token is still valid (with skew)
   */
  private isTokenValid(): boolean {
    if (!this.cachedToken) return false;
    const now = Date.now();
    return now < (this.tokenExpiresAt - this.tokenSkewMs);
  }

  /**
   * Maps Axios errors to Auth0Error
   */
  private toAuth0Error(err: unknown, fallbackMessage = 'Auth0 request failed'): Auth0Error {
    if (axios.isAxiosError(err)) {
      const axErr = err as AxiosError<any>;
      const status = axErr.response?.status;
      const data = axErr.response?.data;
      const code = data?.error || data?.code || axErr.code;
      const message =
        data?.error_description ||
        data?.message ||
        axErr.message ||
        fallbackMessage;
      const requestId =
        axErr.response?.headers?.['x-request-id'] ||
        axErr.response?.headers?.['x-auth0-requestid'];
      return new Auth0Error(message, status, code, data, requestId, true);
    }
    if (err instanceof Error) {
      return new Auth0Error(err.message);
    }
    return new Auth0Error(fallbackMessage);
  }

  /**
   * Fetches a fresh management token (no cache).
   */
  private async fetchNewToken(): Promise<string> {
    try {
      const resp = await this.tokenAxios.post('/oauth/token', {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        audience: this.audience,
      });

      const accessToken: string = resp.data?.access_token;
      const expiresIn: number = resp.data?.expires_in ?? 3600;

      if (!accessToken) {
        throw new Auth0Error('No access_token in Auth0 token response', 500, 'AUTH0_TOKEN_MISSING', resp.data);
      }

      this.cachedToken = accessToken;
      this.tokenExpiresAt = Date.now() + expiresIn * 1000;

      return accessToken;
    } catch (err) {
      throw this.toAuth0Error(err, 'Failed to obtain Auth0 management token');
    }
  }

  /**
   * Get management API token (cached, auto-refresh on expiry)
   */
  public async getManagementToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.cachedToken as string;
    }
    if (this.tokenPromise) {
      return this.tokenPromise;
    }
    this.tokenPromise = this.fetchNewToken()
      .finally(() => {
        this.tokenPromise = null;
      });
    return this.tokenPromise;
  }

  /**
   * Get a user by Auth0 user ID
   * @param userId e.g., "auth0|123" or "google-oauth2|abc"
   */
  public async getUserById(userId: string): Promise<Auth0User> {
    try {
      const resp = await this.axiosInstance.get<Auth0User>(`/users/${encodeURIComponent(userId)}`);
      return resp.data;
    } catch (err) {
      throw this.toAuth0Error(err, `Failed to get user ${userId}`);
    }
  }

  /**
   * Get users with optional query and pagination
   * @param query Auth0 Lucene query string (e.g., 'email:"user@example.com"')
   * @param page Page index (zero-based)
   * @param perPage Items per page
   */
  public async getUsers(query?: string, page: number = 0, perPage: number = 25): Promise<GetUsersResponse> {
    try {
      const resp = await this.axiosInstance.get('/users', {
        params: {
          q: query,
          page,
          per_page: perPage,
          include_totals: true,
          search_engine: 'v3',
        },
      });

      const data = resp.data as {
        start: number;
        length: number;
        total: number;
        users: Auth0User[];
      };

      // Some tenants return "users" at root; others return the array directly when include_totals=false.
      if (Array.isArray(resp.data)) {
        return {
          users: resp.data as Auth0User[],
          start: page * perPage,
          length: (resp.data as Auth0User[]).length,
          total: (resp.data as Auth0User[]).length,
        };
      }

      return {
        users: data.users ?? [],
        start: data.start ?? page * perPage,
        length: data.length ?? (data.users?.length ?? 0),
        total: data.total ?? (data.users?.length ?? 0),
      };
    } catch (err) {
      throw this.toAuth0Error(err, 'Failed to get users');
    }
  }

  public async getUsersByRoleNames(roleNames: string[]): Promise<Auth0User[]> {
    try {
      // 1. Get all roles
      const allRoles = await this.getAllRoles();
      // 2. Find role IDs for the given names
      const roleIds = allRoles.filter(r => roleNames.includes(r.name)).map(r => r.id);

      // 3. For each role, get users
      let users: Auth0User[] = [];
      for (const roleId of roleIds) {
        const resp = await this.axiosInstance.get<Auth0User[]>(`/roles/${roleId}/users`, {
          params: { per_page: 100 }, // adjust as needed
        });
        users = users.concat(resp.data);
      }

      // 4. Deduplicate users by user_id
      const uniqueUsers: { [id: string]: Auth0User } = {};
      users.forEach(u => { uniqueUsers[u.user_id] = u; });
      return Object.values(uniqueUsers);
    } catch (err) {
      throw this.toAuth0Error(err, `Failed to get users by role names: ${roleNames.join(', ')}`);
    }
  }

  public async getAllRoles(): Promise<Auth0Role[]> {
    try {
      const resp = await this.axiosInstance.get<Auth0Role[]>('/roles');
      return resp.data;
    } catch (err) {
      throw this.toAuth0Error(err, 'Failed to get all roles');
    }
  }

  /**
   * Create a user
   * @param data CreateUserDto
   */
  public async createUser(data: CreateUserDto): Promise<Auth0User> {
    try {
      const resp = await this.axiosInstance.post<Auth0User>('/users', data);
      return resp.data;
    } catch (err) {
      throw this.toAuth0Error(err, 'Failed to create user');
    }
  }

  /**
   * Update a user
   * @param userId Auth0 user_id
   * @param data UpdateUserDto
   */
  public async updateUser(userId: string, data: UpdateUserDto, options?: { transaction?: any }): Promise<Auth0User> {
    try {
      const resp = await this.axiosInstance.patch<Auth0User>(`/users/${encodeURIComponent(userId)}`, data);
      return resp.data;
    } catch (err) {
      throw this.toAuth0Error(err, `Failed to update user ${userId}`);
    }
  }

  /**
   * Delete a user
   * @param userId Auth0 user_id
   */
  public async deleteUser(userId: string, options?: { transaction?: any }): Promise<void> {
    try {
      await this.axiosInstance.delete(`/users/${encodeURIComponent(userId)}`);
    } catch (err) {
      throw this.toAuth0Error(err, `Failed to delete user ${userId}`);
    }
  }

  /**
   * Assign one or more role IDs to a user
   * @param userId Auth0 user_id
   * @param roles Array of role IDs
   */
  public async assignRolesToUser(userId: string, roles: string[], options?: { transaction?: any }): Promise<void> {
    try {
      await this.axiosInstance.post(`/users/${encodeURIComponent(userId)}/roles`, { roles });
    } catch (err) {
      throw this.toAuth0Error(err, `Failed to assign roles to user ${userId}`);
    }
  }

    /**
   * Remove one or more role IDs from a user
   * @param userId Auth0 user_id
   * @param roles Array of role IDs
   */
  public async removeRolesFromUser(userId: string, roles: string[], options?: { transaction?: any }): Promise<void> {
    try {
      await this.axiosInstance.delete(`/users/${encodeURIComponent(userId)}/roles`, { data: { roles } });
    } catch (err) {
      throw this.toAuth0Error(err, `Failed to remove roles from user ${userId}`);
    }
  }

public async changeUserPassword(userId: string, newPassword: string): Promise<void> {
  try {
    await this.axiosInstance.patch(`/users/${encodeURIComponent(userId)}`, {
      password: newPassword
    });
  } catch (err) {
    throw this.toAuth0Error(err, `Failed to change password for user ${userId}`);
  }
}

  /**
   * Get roles for a user
   * @param userId Auth0 user_id
   */
  public async getUserRoles(userId: string): Promise<Auth0Role[]> {
    try {
      const resp = await this.axiosInstance.get<Auth0Role[]>(`/users/${encodeURIComponent(userId)}/roles`);
      return resp.data;
    } catch (err) {
      throw this.toAuth0Error(err, `Failed to get roles for user ${userId}`);
    }
  }
}