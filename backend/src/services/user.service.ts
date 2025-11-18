import { UserRepository } from '../repositories/user.repository';
import { Auth0Service, CreateUserDto, UpdateUserDto } from './auth0.service';
import { TeacherRepository } from '../repositories/teacher.repository';
import { StudentRepository } from '../repositories/student.repository';
import { SemesterRepository } from '../repositories/semester.repository';
import { StudentSemesterRepository } from '../repositories/student-semester.repository';
import { User } from '../models/User';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { AppError } from '../utils/AppError';
import type { StudentDetails, TeacherDetails } from '../types/user.types';
import { CreateUserSchema, UpdateUserSchema } from '../validators/user.validator';
import sequelize from '../models/db';
import { Op } from 'sequelize';

export class UserService {
  private userRepository: UserRepository;
  private auth0Service = new Auth0Service();
  private teacherRepository = new TeacherRepository();
  private studentRepository = new StudentRepository();
  private semesterRepository = new SemesterRepository();
  private studentSemesterRepository = new StudentSemesterRepository();

  constructor() {
    this.userRepository = new UserRepository();
    this.auth0Service = new Auth0Service();
    this.teacherRepository = new TeacherRepository();
    this.studentRepository = new StudentRepository();
    this.semesterRepository = new SemesterRepository();
    this.studentSemesterRepository = new StudentSemesterRepository();
  }
  
  // STUDENT
  async getStudentDetails(userId: number): Promise<StudentDetails | null> {
    return await this.studentRepository.findById(userId);
  }

  async getStudentById(userId: number): Promise<StudentDetails | null> {
    return await this.studentRepository.findById(userId);
  }

  // TEACHER
  async getTeacherDetails(userId: number): Promise<TeacherDetails | null> {
    return await this.teacherRepository.findById(userId);
  }

  async getTeacherById(userId: number): Promise<TeacherDetails | null> {
    return await this.teacherRepository.findById(userId);
  }

  // CRUD OPERATIONS
  async createUser(input: unknown) {
    const parsed = CreateUserSchema.safeParse(input);
    if (!parsed.success) throw new AppError('Invalid input', 400, 'VALIDATION_ERROR', parsed.error.issues);

    const {
      username, email, fullName, password, role,
      teacherCode, title, office, phone,
      studentId, semesterId, cohortYear, className, dob, gender,
    } = parsed.data;

    // Use repository for lookups
    if (await this.userRepository.findByUsername(username))
      throw new AppError('Username already exists', 409, 'USERNAME_EXISTS');
    if (await this.userRepository.findByEmail(email))
      throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');
    if (role === 'teacher' && teacherCode && await this.teacherRepository.findTeacherByCode(teacherCode))
      throw new AppError('Teacher code already exists', 409, 'TEACHERCODE_EXISTS');
    if (role === 'student' && studentId && await this.studentRepository.findByStudentId(studentId))
      throw new AppError('Student ID already exists', 409, 'STUDENTID_EXISTS');

    // Auth0 user creation
    let auth0User;
    try {
      auth0User = await this.auth0Service.createUser({
        connection: 'Username-Password-Authentication',
        email,
        password,
        name: fullName,
        username,
      } as CreateUserDto);
    } catch (err: any) {
      throw new AppError('Auth0 user creation failed', err.statusCode || 500, err.code, err.details);
    }

    // DB transaction
    return await sequelize.transaction(async (t) => {
      try {
        const user = await this.userRepository.create({
          auth0UserId: auth0User.user_id,
          username,
          email,
          fullName,
          status: 'active',
        }, t);

        if (role === 'teacher') {
          await this.teacherRepository.create({
            userId: user.id,
            teacherCode,
            title,
            office,
            phone,
            email,
          }, t);
        }

        if (role === 'student') {
          if (!studentId) throw new AppError('studentId is required for student role', 400, 'STUDENTID_REQUIRED');
          const student = await this.studentRepository.create({
            userId: user.id,
            studentId,
            cohortYear,
            className,
            phone,
            dob: dob ? new Date(dob) : null,
            gender,
            status: 'active',
          }, t);

          let semesterIdToUse = semesterId;
          if (!semesterIdToUse) {
            const newestSemester = await this.semesterRepository.findNewestSemester();
            if (!newestSemester) throw new AppError('No semester found', 400, 'SEMESTER_NOT_FOUND');
            semesterIdToUse = newestSemester.id;
          }

          await this.studentSemesterRepository.create({
            studentId: student.id,
            semesterId: semesterIdToUse,
            type: 'not-registered',
            status: 'enrolled',
          }, t);
        }

        return { id: user.id, username, email, fullName, role };
      } catch (err) {
        await this.auth0Service.deleteUser(auth0User.user_id);
        throw err;
      }
    });
  }

  async updateUser(id: number, input: unknown) {
    const parsed = UpdateUserSchema.safeParse(input);
    if (!parsed.success) throw new AppError('Invalid input', 400, 'VALIDATION_ERROR', parsed.error.issues);

    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    // Never allow auth0UserId update
    if ('auth0UserId' in parsed.data) throw new AppError('Cannot update auth0UserId', 400, 'FORBIDDEN_FIELD');

    // Update Auth0 user
    try {
      await this.auth0Service.updateUser(user.auth0UserId!, {
        email: parsed.data.email,
        name: parsed.data.fullName,
        username: parsed.data.username,
      } as UpdateUserDto);
    } catch (err: any) {
      throw new AppError('Auth0 update failed', err.statusCode || 500, err.code, err.details);
    }

    // DB transaction for role transitions
    return await sequelize.transaction(async (t) => {
      await user.update(parsed.data, { transaction: t });

      // Role transitions
      if (parsed.data.teacherCode) {
        let teacher = await this.teacherRepository.findById(user.id);
        if (!teacher) {
          teacher = await this.teacherRepository.create({ userId: user.id }, { transaction: t });
        }
        await teacher.update(parsed.data, { transaction: t });
      }
      if (parsed.data.studentId) {
        let student = await this.studentRepository.findById(user.id);
        if (!student) {
          student = await this.studentRepository.create({
            userId: user.id,
            studentId: parsed.data.studentId!,
            status: 'active',
            cohortYear: parsed.data.cohortYear,
            className: parsed.data.className,
            phone: parsed.data.phone,
            dob: parsed.data.dob ? new Date(parsed.data.dob) : null,
            gender: parsed.data.gender,
          }, { transaction: t });
        }
        await student.update({
          ...parsed.data,
          dob: parsed.data.dob ? new Date(parsed.data.dob) : null,
        }, { transaction: t });
      }
      return { id: user.id, username: user.username, email: user.email, fullName: user.fullName };
    });
  }

  async deleteUser(id: number, currentUserId?: number) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    if (currentUserId && user.id === currentUserId)
      throw new AppError('Cannot delete own account', 403, 'DELETE_SELF_FORBIDDEN');

    // Delete Auth0 user first
    try {
      await this.auth0Service.deleteUser(user.auth0UserId!);
    } catch (err: any) {
      throw new AppError('Auth0 delete failed', err.statusCode || 500, err.code, err.details);
    }

    // Soft-delete User and related records
    await sequelize.transaction(async (t) => {
      await this.teacherRepository.delete(user.id, { transaction: t });
      await this.studentRepository.delete(user.id, { transaction: t });
      await user.destroy({ transaction: t });
    });
    return { success: true };
  }

  async listUsers({ page = 1, limit = 10, role, status, search }: {
    page?: number, limit?: number, role?: string, status?: string, search?: string
  }) {
    const where: any = {};
    if (status) where.status = status;
    if (search) where.fullName = { [Op.like]: `%${search}%` };
    if (role === 'teacher') where['$Teacher.id$'] = { [Op.not]: null };
    if (role === 'student') where['$Student.id$'] = { [Op.not]: null };

    const { rows, count } = await this.userRepository.findAndCountAll({
      where,
      include: [Teacher, Student],
      attributes: { exclude: ['auth0UserId', 'createdAt', 'updatedAt'] },
      limit,
      offset: (page - 1) * limit,
      order: [['id', 'DESC']],
    });
    return {
      results: rows,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        totalResults: count,
      }
    };
  }

  // Activate a user
  async activateUser(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    if (user.status === 'active') return user;

    // Update status in local DB
    await user.update({ status: 'active' });

    return user;
  }

  // Deactivate a user
  async deactivateUser(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    if (user.status === 'inactive') return user;

    // Update status in local DB
    await user.update({ status: 'inactive' });

    return user;
  }

  // Get user statistics
  async getUserStatistics() {
    const statusCounts = await this.userRepository.countUsersByStatus();
    // const roleDistribution = await this.userRepository.getUsers(truyền vào những ids có role trong Auth0);
    const userGrowth = await this.userRepository.getUserGrowthByPeriod('month', 6);
    
    return {
      statusCounts,
      // roleDistribution,
      userGrowth
    };
  }

  // Search users by query
  async searchUsers(query: string) {
    const users = await this.userRepository.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
          { fullName: { [Op.like]: `%${query}%` } },
        ]
      }});
    return users;
  }
}

export default UserService;