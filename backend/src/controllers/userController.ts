import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const getResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const resource = {
      id,
      name: 'Sample Resource'
    }
    
    if (!resource) {
      // Throw operational error for missing resource
      throw new AppError(`Resource with id ${id} not found`, 404, 'RESOURCE_NOT_FOUND');
    }
    
    return res.status(200).json({ status: 'success', data: resource });
  } catch (error) {
    // Pass to error handler middleware
    next(error);
  }
};
