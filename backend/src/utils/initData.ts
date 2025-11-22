import xlsx from 'xlsx';
import { sequelize } from '../models/db';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import { Semester } from '../models/Semester';
import { StudentSemester } from '../models/StudentSemester';
import { Auth0Service, Auth0User } from '../services/auth0.service';
import axios from 'axios';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();
const auth0Service = new Auth0Service();

// --- Schemas ---
const adminSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  fullName: z.string(),
  password: z.string().min(6),
});

const moderatorSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  fullName: z.string(),
  password: z.string().min(6),
});

const studentSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  fullName: z.string(),
  password: z.string().min(6),
  studentIdCode: z.string(),
  className: z.string().nullable().optional(),
  phone: z.union([z.string(), z.number()]).nullable().optional(),
  dob: z.union([z.string(), z.number()]).optional(),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  status: z.enum(['active', 'inactive', 'graduated'])
});

const teacherSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  fullName: z.string(),
  password: z.string().min(6),
  teacherCode: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  office: z.string().nullable().optional(),
  phone: z.union([z.string(), z.number()]).nullable().optional(),
});

const semesterSchema = z.object({
  code: z.string(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
  isCurrent: z.boolean()
});

const studentSemesterSchema = z.object({
  studentId: z.number(),
  semesterId: z.number(),
  gpa: z.number().min(0).max(4).nullable().optional(),
  credits: z.number().min(0).nullable().optional(),
  type: z.enum(['pre-thesis', 'thesis', 'not-registered'])
});

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function assignRoleWithRetry(auth0Service: Auth0Service, userId: string, roleId: string, maxRetries = 5) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await auth0Service.assignRolesToUser(userId, [roleId]);
      return;
    } catch (err: any) {
      if (err.statusCode === 429) {
        await delay(2000 * (retries + 1));
        retries++;
      } else {
        throw err;
      }
    }
  }
  throw new Error('Rate limit exceeded after retries');
}

function parseExcelDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    let year = parts[2];
    if (year.length === 2) year = '20' + year;
    return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateStr;
}

function excelSerialToDate(serial: number): string {
  // Excel serial date to JS Date (UTC)
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().slice(0, 10); // YYYY-MM-DD
}

// --- Main import function ---
async function initData() {
  const workbook = xlsx.readFile('./src/utils/data.xlsx');

  const admins = xlsx.utils.sheet_to_json<z.infer<typeof adminSchema>>(workbook.Sheets['admin']);
  const moderators = xlsx.utils.sheet_to_json<z.infer<typeof moderatorSchema>>(workbook.Sheets['moderator']);
  const students = xlsx.utils.sheet_to_json<z.infer<typeof studentSchema>>(workbook.Sheets['student']);
  const teachers = xlsx.utils.sheet_to_json<z.infer<typeof teacherSchema>>(workbook.Sheets['teacher']);
  const semesters = xlsx.utils.sheet_to_json<z.infer<typeof semesterSchema>>(workbook.Sheets['semester']);
  const studentSemesters = xlsx.utils.sheet_to_json<z.infer<typeof studentSemesterSchema>>(workbook.Sheets['student-semester']);

  // Validate all data before transaction
  admins.forEach(row => adminSchema.parse(row));
  moderators.forEach(row => moderatorSchema.parse(row));
  students.forEach(row => {
    if (typeof row.dob === 'number') row.dob = excelSerialToDate(row.dob);
    else if (typeof row.dob === 'string') row.dob = parseExcelDate(row.dob);

    if (typeof row.phone === 'number') row.phone = row.phone.toString();
    if (typeof row.phone === 'string' && !row.phone.startsWith('0')) {
      row.phone = '0' + row.phone;
    }

    studentSchema.parse(row);
  });
  teachers.forEach(row => {
    if (typeof row.phone === 'number') row.phone = row.phone.toString();
    if (typeof row.phone === 'string' && !row.phone.startsWith('0')) {
      row.phone = '0' + row.phone;
    }
    teacherSchema.parse(row);
  });
  semesters.forEach(row => {
    if (typeof row.startDate === 'number') row.startDate = excelSerialToDate(row.startDate);
    else if (typeof row.startDate === 'string') row.startDate = parseExcelDate(row.startDate);

    if (typeof row.endDate === 'number') row.endDate = excelSerialToDate(row.endDate);
    else if (typeof row.endDate === 'string') row.endDate = parseExcelDate(row.endDate);

    semesterSchema.parse(row);
  });
  studentSemesters.forEach(row => studentSemesterSchema.parse(row));

  const transaction = await sequelize.transaction();

  try {
    // Insert semesters
    const semesterMap: Record<string, Semester> = {};
    for (const sem of semesters) {
      const s = await Semester.create({
        code: sem.code,
        name: sem.name,
        startDate: new Date(sem.startDate),
        endDate: new Date(sem.endDate),
        isActive: sem.isActive,
        isCurrent: sem.isCurrent
      }, { transaction });
      semesterMap[sem.code] = s;
    }

    const allRoles = await auth0Service.getAllRoles();
    const adminRole = allRoles.find(r => r.name === 'admin');
    if (!adminRole) throw new Error('Admin role not found in Auth0');
    const moderatorRole = allRoles.find(r => r.name === 'moderator');
    if (!moderatorRole) throw new Error('Moderator role not found in Auth0');
    const studentRole = allRoles.find(r => r.name === 'student');
    if (!studentRole) throw new Error('Student role not found in Auth0');
    const teacherRole = allRoles.find(r => r.name === 'teacher');
    if (!teacherRole) throw new Error('Teacher role not found in Auth0');

    // Insert students
    const studentIdMap: Record<string, number> = {};
    for (const student of students) {
      const auth0User = await auth0Service.createUser({
        connection: 'Username-Password-Authentication',
        email: student.email,
        username: student.username,
        password: student.password,
        name: student.fullName,
      });

      await assignRoleWithRetry(auth0Service, auth0User.user_id, studentRole.id);

      const dbUser = await User.create({
        email: student.email,
        fullName: student.fullName,
        auth0UserId: auth0User.user_id
      }, { transaction });
      const s = await Student.create({
        userId: dbUser.id,
        studentIdCode: student.studentIdCode,
        className: student.className,
        phone: typeof student.phone === 'number' ? student.phone.toString() : student.phone ?? null,
        dob: student.dob ? new Date(student.dob) : null,
        gender: student.gender,
        status: student.status as 'active' | 'inactive' | 'graduated'
      }, { transaction });
      studentIdMap[student.studentIdCode] = s.id;
    }

    // Insert student-semester relationships
    for (const ss of studentSemesters) {
      await StudentSemester.create({
        studentId: ss.studentId,
        semesterId: ss.semesterId,
        gpa: ss.gpa,
        credits: ss.credits,
        type: ss.type,
        status: 'enrolled'
      }, { transaction });
    }

    // Insert admins
    for (const admin of admins) {
      let auth0User: Auth0User | null = null;
      try {
        auth0User = await auth0Service.createUser({
          connection: 'Username-Password-Authentication',
          email: admin.email,
          username: admin.username,
          password: admin.password,
          name: admin.fullName,
        });

        await assignRoleWithRetry(auth0Service, auth0User.user_id, adminRole.id);

        await User.create({
          email: admin.email,
          fullName: admin.fullName,
          auth0UserId: auth0User.user_id
        }, { transaction });
      } catch (err) {
        // Delete Auth0 user if created
        if (auth0User) {
          try { await auth0Service.deleteUser(auth0User.user_id); } catch {}
        }
        throw err;
      }
    }

    // Insert moderators
    for (const moderator of moderators) {
      let auth0User: Auth0User | null = null;
      try {
        auth0User = await auth0Service.createUser({
          connection: 'Username-Password-Authentication',
          email: moderator.email,
          username: moderator.username,
          password: moderator.password,
          name: moderator.fullName,
        });

        await assignRoleWithRetry(auth0Service, auth0User.user_id, moderatorRole.id);

        await User.create({
          email: moderator.email,
          fullName: moderator.fullName,
          auth0UserId: auth0User.user_id
        }, { transaction });
      } catch (err) {
        // Delete Auth0 user if created
        if (auth0User) {
          try { await auth0Service.deleteUser(auth0User.user_id); } catch {}
        }
        throw err;
      }
    }

    // Insert teachers
    for (const teacher of teachers) {
      const auth0User = await auth0Service.createUser({
        connection: 'Username-Password-Authentication',
        email: teacher.email,
        username: teacher.username,
        password: teacher.password,
        name: teacher.fullName
      });

      await assignRoleWithRetry(auth0Service, auth0User.user_id, teacherRole.id);

      const dbUser = await User.create({
        email: teacher.email,
        fullName: teacher.fullName,
        auth0UserId: auth0User.user_id
      }, { transaction });
      await Teacher.create({
        userId: dbUser.id,
        teacherCode: teacher.teacherCode,
        title: teacher.title,
        office: teacher.office,
        phone: typeof teacher.phone === 'number' ? teacher.phone.toString() : teacher.phone ?? null
      }, { transaction });
    }

    await transaction.commit();
    console.log('Data import completed successfully.');
  } catch (err) {
    await transaction.rollback();
    console.error('Data import failed:', err);
    throw err;
  }
}

if (require.main === module) {
  (async () => {
    await initData();
    process.exit(0);
  })();
}

export { initData };