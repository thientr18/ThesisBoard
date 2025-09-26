import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err?.name === "InvalidRequestError") {
    return res.status(401).json({ error: "missing_token" });
  }
  if (err?.name === "UnauthorizedError") {
    return res.status(401).json({ error: "invalid_token", message: err.message });
  }
  return res.status(err?.status || 500).json({ error: "server_error", message: err?.message || "Unexpected error" });
}