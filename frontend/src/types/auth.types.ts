export interface AuthResponse<T> {
  data: T | null;
  error: string | null;
}

export interface AuthTokens {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface UserInfo {
  sub: string;
  nickname?: string;
  name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  updated_at?: string;
  // Add other user profile fields as needed
}

export interface SignupRequest {
  email: string;
  password: string;
  username?: string;
  given_name?: string;
  family_name?: string;
}