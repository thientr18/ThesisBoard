import { z } from 'zod';

export const UserRoleEnum = z.enum(['admin', 'moderator', 'teacher', 'student', 'other']);

export const UserSchema = z.object({
  email: z.string().email().max(255),
  fullName: z.string().min(2).max(255),
  password: z.string().min(8).max(128),
  role: UserRoleEnum,
});

export const TeacherSchema = z.object({
  teacherCode: z.string().max(32),
  title: z.string().max(64).optional().nullable(),
  office: z.string().max(64).optional().nullable(),
  phone: z.string().max(32).regex(/^\+?[0-9\- ]+$/).optional().nullable(),
});

export const StudentSchema = z.object({
  studentIdCode: z.string().max(32),
  semesterId: z.number().int().optional().nullable(),
  cohortYear: z.number().int().min(2000).max(new Date().getFullYear()).optional().nullable(),
  className: z.string().max(64).optional().nullable(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  type: z.enum(['pre-thesis', 'thesis', 'not-registered']).optional().nullable(),
  gpa: z.number().optional().nullable(),
  credits: z.number().optional().nullable(),
  phone: z.string().max(32).regex(/^\+?[0-9\- ]+$/).optional().nullable(),
});

// For create, combine schemas as needed
export const CreateTeacherSchema = UserSchema.merge(TeacherSchema);
export const CreateStudentSchema = UserSchema.merge(StudentSchema);

// For update, partial and omit password/role
export const UpdateUserSchema = UserSchema.partial().omit({ password: true, role: true });
export const UpdateTeacherSchema = TeacherSchema.partial();
export const UpdateStudentSchema = StudentSchema.partial();