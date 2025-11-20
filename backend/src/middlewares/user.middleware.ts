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

  const permissions =
    payload[`${audienceNs}permissions`] ||
    payload[`${apiNamespace}/permissions`] ||
    payload.permissions ||
    [];

  // Lấy user nội bộ theo auth0UserId
  let dbUser = await userService.getUserByAuth0Id(auth0UserId);
  if (!dbUser) {
    return next(new AppError('Local user not found for this Auth0 account', 404, 'USER_NOT_FOUND'));
  }

  (req as any).user = {
    id: dbUser.id,            // numeric internal ID
    auth0UserId,              // auth0|xxx
    sub: payload.sub,
    email: dbUser.email || payload.email,
    permissions,
  };

  next();
};