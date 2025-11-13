export type UserProfile = {
  id: number;
  auth0Id: string;
  username: string;
  email: string;
  fullName: string;
  status: 'active' | 'inactive';
};