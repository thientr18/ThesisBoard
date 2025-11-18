import { z } from 'zod';

export const UserRoleEnum = z.enum(['admin', 'moderator', 'teacher', 'student']);

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(64).regex(/^[a-zA-Z0-9_.-]+$/),
  email: z.string().email().max(255),
  fullName: z.string().min(2).max(255),
  password: z.string().min(8).max(128),
  role: UserRoleEnum,
  // Teacher fields
  teacherCode: z.string().max(32).optional(),
  title: z.string().max(64).optional(),
  office: z.string().max(64).optional(),
  phone: z.string().max(32).regex(/^\+?[0-9\- ]+$/).optional(),
  // Student fields
  studentId: z.string().max(32).optional(),
  semesterId: z.number().int().optional(),
  cohortYear: z.number().int().min(2000).max(new Date().getFullYear()).optional(),
  className: z.string().max(64).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial().omit({ password: true, role: true });