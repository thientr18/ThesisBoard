import 'express';

declare module 'express-serve-static-core' {
  interface UserPayload {
    auth0UserId(auth0UserId: any): unknown;
    id: string;
    sub?: string;
    email?: string;
    roles?: string[];
    permissions?: string[];
  }
  interface Request {
    user?: UserPayload;
  }
}