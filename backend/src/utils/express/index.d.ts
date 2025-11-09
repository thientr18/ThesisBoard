import 'express';

declare module 'express-serve-static-core' {
  interface UserPayload {
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