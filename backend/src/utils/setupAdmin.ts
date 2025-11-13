import axios from 'axios';
import dotenv from 'dotenv';
import { sequelize } from '../models/db';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
// npx ts-node src/utils/setupAdmin.ts
dotenv.config();
/**
 * Email: admin@thesisboard.com
 * Password: Admin@123456
 */

/**
 * Complete admin setup for both database and Auth0
 */
async function setupAdmin() {
  try {
    console.log('=== STARTING ADMIN SETUP ===');
    
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    const dbUser = await setupDatabaseAdmin();
    
    const auth0User = await setupAuth0Admin();
    
    if (dbUser && auth0User?.userId) {
      await User.update(
        { auth0UserId: auth0User.userId },
        { where: { id: dbUser.id } }
      );
      console.log('Updated database user with Auth0 ID.');
    }
    
    console.log('=== ADMIN SETUP COMPLETED SUCCESSFULLY ===');
    console.log('You can now login with:');
    console.log('Email: admin@thesisboard.com');
    console.log('Password: Admin@123456');
    
  } catch (error) {
    console.error('Admin setup failed:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Setup admin in the database
 */
async function setupDatabaseAdmin() {
  try {
    console.log('Setting up admin in database...');
    
    const adminUsername = 'admin';
    const adminEmail = 'admin@thesisboard.com';
    
    const [adminUser, userCreated] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        username: adminUsername,
        email: adminEmail,
        fullName: 'Admin User',
        auth0UserId: 'database-admin',
        status: 'active'
      }
    });
    
    console.log(userCreated ? 'Admin user created in database' : 'Admin user already exists in database');
    console.log('Database admin setup completed.');
    return adminUser;
    
  } catch (error) {
    console.error('Error during database admin setup:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Get Auth0 Management API token
 */
async function getAuth0ManagementToken(): Promise<string> {
  try {
    console.log('Requesting Auth0 management token...');
    
    // Make sure we're using the correct endpoint format
    const tokenUrl = `https://${process.env.AUTH0_DOMAIN}/oauth/token`;
    console.log('Token URL:', tokenUrl);
    
    const payload = {
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: process.env.AUTH0_MANAGEMENT_API,
      grant_type: 'client_credentials'
    };
    
    console.log('Request payload:', {
      ...payload,
      client_secret: '[REDACTED]'
    });
    
    // Set proper headers for this request
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    const response = await axios.post(tokenUrl, payload, { headers });

    console.log('Token received successfully');
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get Auth0 management token:');
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
      console.error('Request URL:', error.config?.url);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }
    throw error;
  }
}

/**
 * Setup admin user in Auth0
 */
async function setupAuth0Admin(): Promise<{ userId: string; roleId: string; username: string; email: string }> {
  try {
    console.log('Setting up admin in Auth0...');
    
    // Get management API token
    const token = await getAuth0ManagementToken();
    if (!token) {
      throw new AppError('No Auth0 management token obtained', 401, 'NO_MANAGEMENT_TOKEN');
    }
    console.log('Token: ', token);
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
    
    // 1. Create admin role if it doesn't exist
    let roleId: string;
    try {
      const rolesResponse = await axios.get(
        `${process.env.AUTH0_MANAGEMENT_API}roles`,
        { headers }
      );
      
      const existingRole = rolesResponse.data.find((role: { name: string, id: string }) => role.name === 'admin');
      
      if (existingRole) {
        console.log('Admin role already exists in Auth0');
        roleId = existingRole.id;
      } else {
        const createRoleResponse = await axios.post(
          `${process.env.AUTH0_MANAGEMENT_API}roles`,
          {
            name: 'admin',
            description: 'Admin role with full system access'
          },
          { headers }
        );
        
        roleId = createRoleResponse.data.id;
        console.log('Created Admin role in Auth0');
      }
    } catch (error) {
      console.error('Error handling Auth0 roles:', error instanceof Error ? error.message : String(error));
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
    
    // 2. Create admin user if it doesn't exist
    const adminUsername = 'admin';
    const adminEmail = 'admin@thesisboard.com';
    const adminPassword = 'Admin@123456';
    
    let userId: string;
    try {
      // Check if user exists
      const usersResponse = await axios.get(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users-by-email?email=${adminEmail}`,
        { headers }
      );
      
      if (usersResponse.data && usersResponse.data.length > 0) {
        console.log('Admin user already exists in Auth0');
        userId = usersResponse.data[0].user_id;
      } else {
        // Create user
        const createUserResponse = await axios.post(
          `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
          {
            email: adminEmail,
            username: adminUsername,
            password: adminPassword,
            connection: 'Username-Password-Authentication',
            email_verified: true,
            name: 'Admin User',
            user_metadata: {
              role: 'admin'
            }
          },
          { headers }
        );
        
        userId = createUserResponse.data.user_id;
        console.log('Created admin user in Auth0');
      }
    } catch (error) {
      console.error('Error handling Auth0 users:', error instanceof Error ? error.message : String(error));
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
    
    // 3. Assign role to user
    try {
      await axios.post(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}/roles`,
        {
          roles: [roleId]
        },
        { headers }
      );
      
      console.log('Assigned Admin role to user in Auth0');
    } catch (error) {
      // Check if error is because role is already assigned
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        console.log('Admin role already assigned to user in Auth0');
      } else {
        console.error('Error assigning role to user:', error instanceof Error ? error.message : String(error));
        if (axios.isAxiosError(error) && error.response) {
          console.error('Response data:', error.response.data);
        }
        throw error;
      }
    }
    
    console.log('Auth0 admin setup completed.');
    
    return {
      userId,
      roleId,
      username: adminUsername,
      email: adminEmail
    };
    
  } catch (error) {
    console.error('Failed to set up Auth0 admin:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// If this file is run directly, execute the setup
if (require.main === module) {
  (async () => {
    try {
      await setupAdmin();
      process.exit(0);
    } catch (error) {
      process.exit(1);
    }
  })();
}

export { setupAdmin };