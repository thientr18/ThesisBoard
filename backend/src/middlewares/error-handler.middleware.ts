import { Request, Response, NextFunction } from "express";
import { ValidationError, DatabaseError, ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import { AppError } from "../utils/AppError";

/**
 * Centralized error handling middleware for Express
 * Processes various error types and returns consistent responses
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  // Log error for server-side debugging
  logError(err);

  // Default error response
  let statusCode = err.statusCode || 500;
  let status = err.status || 'error';
  let message = err.message || 'Something went wrong';
  let code = err.code;
  let details = err.details;
  let isOperational = err.isOperational !== undefined ? err.isOperational : false;

  // ==========================================
  // Handle Sequelize-specific errors
  // ==========================================
  
  // Validation errors (field validations failed)
  if (err instanceof ValidationError) {
    statusCode = 400;
    status = 'fail';
    message = 'Validation error';
    code = 'VALIDATION_ERROR';
    details = err.errors.reduce((acc: any, error: any) => {
      acc[error.path] = error.message;
      return acc;
    }, {});
    isOperational = true;
  }
  
  // Unique constraint violations (e.g., duplicate email)
  else if (err instanceof UniqueConstraintError) {
    statusCode = 400;
    status = 'fail';
    message = 'Duplicate value error';
    code = 'DUPLICATE_VALUE';
    details = err.errors.reduce((acc: any, error: any) => {
      acc[error.path] = `${error.path} already exists`;
      return acc;
    }, {});
    isOperational = true;
  }
  
  // Foreign key constraint errors (referenced record doesn't exist)
  else if (err instanceof ForeignKeyConstraintError) {
    statusCode = 400;
    status = 'fail';
    message = 'Referenced record does not exist';
    code = 'FOREIGN_KEY_ERROR';
    isOperational = true;
  }
  
  // General database errors
  else if (err instanceof DatabaseError) {
    statusCode = 500;
    status = 'error';
    message = isProduction() ? 'Database operation failed' : err.message;
    code = 'DATABASE_ERROR';
    isOperational = false;
  }

  // ==========================================
  // Handle Authentication errors
  // ==========================================
  
  else if (err?.name === "InvalidRequestError") {
    statusCode = 401;
    status = 'fail';
    message = 'Authentication token is missing';
    code = 'MISSING_TOKEN';
    isOperational = true;
  }
  
  else if (err?.name === "UnauthorizedError" || err?.name === "JsonWebTokenError") {
    statusCode = 401;
    status = 'fail';
    message = 'Invalid authentication token';
    code = 'INVALID_TOKEN';
    isOperational = true;
  }
  
  else if (err?.name === "TokenExpiredError") {
    statusCode = 401;
    status = 'fail';
    message = 'Authentication token has expired';
    code = 'EXPIRED_TOKEN';
    isOperational = true;
  }
  
  else if (err?.name === "ForbiddenError") {
    statusCode = 403;
    status = 'fail';
    message = 'You do not have permission to perform this action';
    code = 'FORBIDDEN';
    isOperational = true;
  }

  // Build the error response object
  const errorResponse: any = {
    status,
    message
  };
  
  if (code) errorResponse.code = code;
  if (details) errorResponse.details = details;
  
  // Include additional debug info in development
  if (!isProduction()) {
    errorResponse.stack = err.stack;
    // For non-operational errors (bugs), include the raw error
    if (!isOperational) {
      errorResponse.rawError = JSON.stringify(err, Object.getOwnPropertyNames(err));
    }
  }

  return res.status(statusCode).json(errorResponse);
}

// ==========================================
// Additional error handling utilities
// ==========================================

/**
 * Middleware for handling 404 Not Found for unhandled routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error = new AppError(`Resource not found: ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
}

/**
 * Configure global handlers for uncaught exceptions and unhandled rejections
 */
export function setupUnhandledErrorHandlers() {
  process.on('unhandledRejection', (reason: any) => {
    console.error('UNHANDLED PROMISE REJECTION:', reason);
    // In production, you might want to log this to a monitoring service
  });
  
  process.on('uncaughtException', (error: Error) => {
    console.error('UNCAUGHT EXCEPTION:', error);
    // In a production app, log this and gracefully shut down
    if (isProduction()) {
      console.error('Fatal error, shutting down...');
      process.exit(1);
    }
  });
}

// ==========================================
// Helper functions
// ==========================================

/**
 * Logs error details with different formats based on environment
 */
function logError(err: any): void {
  if (isProduction()) {
    // In production, use structured logging
    // Replace with your preferred logging solution (Winston, Bunyan, etc.)
    const logData = {
      timestamp: new Date().toISOString(),
      error: err.name || 'Error',
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      isOperational: err.isOperational
    };
    
    console.error(JSON.stringify(logData));
  } else {
    // In development, use more readable console logging
    console.error('\x1b[31m%s\x1b[0m', '🔥 ERROR:', err);
    if (err.stack) {
      console.error('\x1b[33m%s\x1b[0m', 'Stack:', err.stack);
    }
  }
}

/**
 * Helper to check if running in production environment
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}