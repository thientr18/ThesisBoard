import axios from 'axios';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { UserRole } from '../models/UserRole';
import { AppError } from '../utils/AppError';

export interface UserWithRoles extends User {
  roles?: Role[];
}

export class AuthService {
  /**
   * Synchronize Auth0 user with internal database
   * Creates or updates user record based on Auth0 profile data
   */
  async syncUserProfile(auth0Id: string, auth0Profile: any): Promise<User> {
    try {
      // Check if user exists
      let user = await User.findOne({ where: { auth0UserId: auth0Id } });
      
      if (user) {
        // Update existing user with latest info from Auth0
        if (auth0Profile.email || auth0Profile.name) {
          await user.update({
            email: auth0Profile.email || user.email,
            fullName: auth0Profile.name || user.fullName,
          });
        }
      } else {
        // Create new user in database
        if (!auth0Profile.email) {
          throw new AppError('Email is required for user creation', 400, 'INVALID_DATA');
        }
        
        user = await User.create({
          auth0UserId: auth0Id,
          email: auth0Profile.email,
          username: auth0Profile.nickname || auth0Profile.email.split('@')[0],
          fullName: auth0Profile.name || '',
          status: 'active'
        });
        
        // Assign default user role
        const defaultRole = await Role.findOne({ where: { name: 'USER' } });
        if (defaultRole) {
          await UserRole.create({
            userId: user.id,
            roleId: defaultRole.id,
            assignedAt: new Date()
          });
        }
      }
      
      // Sync roles from Auth0
      await this.syncUserRoles(user, auth0Profile);
      
      // Reload the user with roles to return updated data
      return this.getUserByAuth0Id(auth0Id) as Promise<UserWithRoles>;
    } catch (error) {
      console.error('Error syncing user profile:', error);
      throw new AppError('Failed to synchronize user profile', 500, 'SYNC_FAILED', error);
    }
  }
  
  /**
   * Synchronize Auth0 roles with internal database roles
   */
  private async syncUserRoles(user: User, auth0Profile: any): Promise<void> {
    try {
      // Extract roles from Auth0 profile
      let auth0Roles = auth0Profile.roles || 
                      (process.env.AUTH0_AUDIENCE ? auth0Profile[`${process.env.AUTH0_AUDIENCE}/roles`] : []) || 
                      auth0Profile['https://thesisboard-api.com/roles'] || 
                      [];
      
      // Ensure roles is an array
      if (!Array.isArray(auth0Roles)) {
        console.warn('Auth0 roles is not an array:', auth0Roles);
        auth0Roles = [];
      }
      
      if (!auth0Roles.length) return;
      
      // Get corresponding roles from database
      const dbRoles = await Role.findAll({
        where: {
          name: auth0Roles
        }
      });
      
      if (!dbRoles.length) {
        console.warn('No matching roles found in database for:', auth0Roles);
        return;
      }
      
      // Get user's current roles
      const userRoleIds = dbRoles.map(role => role.id);
      
      // Remove existing roles that are not in Auth0 anymore
      await UserRole.destroy({
        where: {
          userId: user.id,
          roleId: {
            [Op.notIn]: userRoleIds
          }
        }
      });
      
      // Add new roles from Auth0
      for (const role of dbRoles) {
        await UserRole.findOrCreate({
          where: {
            userId: user.id,
            roleId: role.id
          },
          defaults: {
            userId: user.id,
            roleId: role.id,
            assignedAt: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Error syncing user roles:', error);
      // We don't throw here to prevent the main sync process from failing
    }
  }
  
  /**
   * Get user profile from database by Auth0 user ID
   */
  async getUserByAuth0Id(auth0Id: string): Promise<User | null> {
    return User.findOne({ 
      where: { auth0UserId: auth0Id },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ]
    }) as Promise<UserWithRoles | null>;
  }
  
  /**
   * Update user profile in database
   */
  async updateUserProfile(userId: number, profileData: Partial<User>): Promise<UserWithRoles> {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ]
    });
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Only allow updating certain fields
    const allowedFields = ['fullName', 'username', 'pictureUrl', 'bio', 'contactInfo'];
    const filteredData: any = {};
    
    Object.keys(profileData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = profileData[key as keyof typeof profileData];
      }
    });
    
    await user.update(filteredData);
    return user;
  }
  
  /**
   * Get Auth0 management API token
   */
  async getManagementApiToken(): Promise<string> {
    try {
      const tokenUrl = `https://${process.env.AUTH0_DOMAIN}/oauth/token`;
      
      const payload = {
        client_id: process.env.AUTH0_M2M_CLIENT_ID,
        client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        grant_type: 'client_credentials'
      };
      
      const response = await axios.post(tokenUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid token response from Auth0');
      }
      
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get Auth0 management token:', error);
      throw new AppError('Failed to get management API access', 500, 'TOKEN_FETCH_FAILED', error);
    }
  }
}