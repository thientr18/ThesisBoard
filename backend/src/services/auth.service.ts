import axios from 'axios';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

export class AuthService {
  private userRepository: typeof User;

  constructor() {
    this.userRepository = User;
  }

  /**
   * Get user profile from database by Auth0 user ID
   */
  async getUserByAuth0Id(auth0Id: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { auth0UserId: auth0Id }
    });
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