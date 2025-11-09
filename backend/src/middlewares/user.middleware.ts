import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const attachUserFromJwt = async (req: Request, _res: Response, next: NextFunction) => {
  const auth: any = (req as any).auth;
  const payload = auth?.payload as Record<string, any> | undefined;
  if (!payload) return next();

  const auth0UserId: string | undefined = payload.sub; // dạng auth0|xxxx
  if (!auth0UserId) return next(new AppError('Invalid token: missing subject', 401, 'INVALID_TOKEN'));

  const audienceNs = process.env.AUTH0_AUDIENCE ? `${process.env.AUTH0_AUDIENCE}/` : '';
  const apiNamespace = process.env.AUTH0_AUDIENCE ? process.env.AUTH0_AUDIENCE : 'https://thesisboard-api.com';

  const roles =
    payload[`${audienceNs}roles`] ||
    payload[`${apiNamespace}/roles`] ||
    payload.roles ||
    [];

  const permissions =
    payload[`${audienceNs}permissions`] ||
    payload[`${apiNamespace}/permissions`] ||
    payload.permissions ||
    [];

  // Lấy user nội bộ theo auth0UserId
  let dbUser = await userService.findByAuth0UserId(auth0UserId);
  if (!dbUser) {
    return next(new AppError('Local user not found for this Auth0 account', 404, 'USER_NOT_FOUND'));
    // Hoặc dùng getOrCreateByAuth0UserId để auto-provision
    // dbUser = await userService.getOrCreateByAuth0UserId(auth0UserId, { email: payload.email, fullName: payload.name });
  }

  (req as any).user = {
    id: dbUser.id,            // numeric internal ID
    auth0UserId,              // auth0|xxx
    sub: payload.sub,
    email: dbUser.email || payload.email,
    roles,
    permissions,
  };

  next();
};