import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { get } from 'http';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
    }
    const userId = req.user.id;
    // Simulate fetching user data from a database
    const user = {
      id: userId,
      name: 'Authenticated User'
    };
    return res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    // Pass to error handler middleware
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Simulate fetching users from a database
    const users = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    return res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    // Pass to error handler middleware
    next(error);
  }
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const user = {
      id,
      name: 'Sample User'
    }

    if (!user) {
      // Throw operational error for missing user
      throw new AppError(`User with id ${id} not found`, 404, 'USER_NOT_FOUND');
    }

    return res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    // Pass to error handler middleware
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    // Simulate user deletion
    return res.status(204).json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    // Pass to error handler middleware
    next(error);
  }
};