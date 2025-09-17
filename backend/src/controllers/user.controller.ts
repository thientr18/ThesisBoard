import { Request, Response } from "express";
import * as userService from "../services/user.service";

export const getUsers = (req: Request, res: Response) => {
  const users = userService.getAllUsers();
  res.json(users);
};

export const createUser = (req: Request, res: Response) => {
  const { name } = req.body;
  const newUser = userService.createUser(name);
  res.status(201).json(newUser);
};
