import axios from 'axios';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { UserRole } from '../models/UserRole';
import { AppError } from '../utils/AppError';

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
        await user.update({
          email: auth0Profile.email,
          fullName: auth0Profile.name,
        });
      } else {
        // Create new user in database
        user = await User.create({
          auth0UserId: auth0Id,
          email: auth0Profile.email,
          username: auth0Profile.nickname || auth0Profile.email.split('@')[0],
          fullName: auth0Profile.name,
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
      
      return user;
    } catch (error) {
      console.error('Error syncing user profile:', error);
      throw new AppError('Failed to synchronize user profile', 500);
    }
  }
  
  /**
   * Synchronize Auth0 roles with internal database roles
   */
  private async syncUserRoles(user: User, auth0Profile: any): Promise<void> {
    try {
      // Extract roles from Auth0 profile
      const auth0Roles = auth0Profile.roles || 
                        (process.env.AUTH0_AUDIENCE ? auth0Profile[`${process.env.AUTH0_AUDIENCE}/roles`] : []) || 
                        auth0Profile['https://thesisboard-api.com/roles'] || 
                        [];
      
      if (!auth0Roles.length) return;
      
      // Get corresponding roles from database
      const dbRoles = await Role.findAll({
        where: {
          name: auth0Roles
        }
      });
      
      // Remove existing roles that are not in Auth0 anymore
      await UserRole.destroy({
        where: {
          userId: user.id,
          roleId: { $notIn: dbRoles.map(role => role.id) }
        }
      });
      
      // Add new roles from Auth0
      for (const role of dbRoles) {
        await UserRole.findOrCreate({
          where: {
            userId: user.id,
            roleId: role.id
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
          through: { attributes: [] } // Exclude junction table
        }
      ]
    });
  }
  
  /**
   * Update user profile in database
   */
  async updateUserProfile(userId: number, profileData: Partial<User>): Promise<User> {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
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
        audience: process.env.AUTH0_MANAGEMENT_API,
        grant_type: 'client_credentials'
      };
      
      const response = await axios.post(tokenUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get Auth0 management token:', error);
      throw new AppError('Failed to get management API access', 500);
    }
  }
}