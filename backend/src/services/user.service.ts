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
import { UserSchema, TeacherSchema, StudentSchema, UpdateUserSchema } from '../validators/user.validator';
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
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');

    const student = await this.studentRepository.findByUserId(userId);
    if (!student) throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
    
    const result: StudentDetails = {
      id: student.id,
      userId: student.userId,
      studentIdCode: student.studentIdCode,
      email: user.email,
      fullName: user.fullName,
      cohortYear: student.cohortYear,
      className: student.className,
      phone: student.phone,
      dob: student.dob,
      gender: student.gender,
      status: student.status,
    };

    return result;
  }

  async getStudentById(id: number): Promise<StudentDetails | null> {
    const studentDetails = await this.studentRepository.findById(id);
    if (!studentDetails) {
      throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
    }

    const user = await this.userRepository.findById(studentDetails.userId);
    if (!user) {
      throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
    }
    
    const result: StudentDetails = {
      id: studentDetails.id,
      userId: studentDetails.userId,
      studentIdCode: studentDetails.studentIdCode,
      email: user.email,
      fullName: user.fullName,
      cohortYear: studentDetails.cohortYear,
      className: studentDetails.className,
      phone: studentDetails.phone,
      dob: studentDetails.dob,
      gender: studentDetails.gender,
      status: studentDetails.status,
    };

    return result;
  }

  async getAllStudents(): Promise<StudentDetails[] | []> {
    const students = await this.studentRepository.findAll();
    const studentDetailsList: StudentDetails[] = [];

    for (const student of students) {
      const details = await this.getStudentDetails(student.userId);
      if (details) {
        studentDetailsList.push(details);
      }
    }
    return studentDetailsList;
  }

  async getStudentByUserId(userId: number): Promise<StudentDetails | null> {
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) {
      throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
    }
    return student ? this.getStudentById(student.id) : null;
  }

  async createStudent(input: unknown) {
    // Validate user part
    const userParsed = UserSchema.safeParse(input);
    if (!userParsed.success) throw new AppError('Invalid user input', 400, 'VALIDATION_ERROR', userParsed.error.issues);

    console.log('Data: ', input);
    // Validate student part
    const studentParsed = StudentSchema.safeParse(input);
    if (!studentParsed.success) throw new AppError('Invalid student input', 400, 'VALIDATION_ERROR', studentParsed.error.issues);

    const {
      email, fullName, password, role
    } = userParsed.data;

    const {
      studentIdCode, semesterId, cohortYear, className, dob, gender,
      gpa, credits, type, phone
    } = studentParsed.data;

    if (!email || !fullName || !password || !studentIdCode) {
      throw new AppError('Missing required fields', 400, 'MISSING_FIELDS');
    }
    if (await this.userRepository.findByEmail(email))
      throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');
    if (studentIdCode && await this.studentRepository.findByStudentIdCode(studentIdCode))
      throw new AppError('Student ID already exists', 409, 'STUDENTID_EXISTS');

    let auth0User;
    try {
      auth0User = await this.auth0Service.createUser({
        connection: 'Username-Password-Authentication',
        email,
        password,
        name: fullName,
        username: studentIdCode,
      } as CreateUserDto);
    } catch (err: any) {
      throw new AppError('Auth0 user creation failed', err.statusCode || 500, err.code, err.details);
    }

    const allRoles = await this.auth0Service.getAllRoles();
    const roleObj = allRoles.find(r => r.name === role);
    if (!roleObj) throw new AppError('Role not found in Auth0', 400, 'ROLE_NOT_FOUND');

    return await sequelize.transaction(async (t) => {
      let user: User | null = null;
      let student: Student | null = null;
      let studentSemester: any = null;
      try {
        await this.auth0Service.assignRolesToUser(auth0User.user_id, [roleObj.id], { transaction: t });

        user = await this.userRepository.create({
          auth0UserId: auth0User.user_id,
          email,
          fullName,
        }, { transaction: t });

        student = await this.studentRepository.create({
          userId: user.id,
          studentIdCode,
          cohortYear: cohortYear ?? null,
          className: className ?? null,
          phone: phone ?? null,
          dob: dob ? new Date(dob) : null,
          gender: gender ?? null,
          status: 'active',
        }, { transaction: t });

        let semesterIdToUse = semesterId;
        if (!semesterIdToUse) {
          const newestSemester = await this.semesterRepository.findNewestSemester();
          if (!newestSemester) throw new AppError('No semester found', 400, 'SEMESTER_NOT_FOUND');
          semesterIdToUse = newestSemester.id;
        }

        studentSemester = await this.studentSemesterRepository.create({
          studentId: student.id,
          semesterId: semesterIdToUse,
          gpa: gpa ?? null,
          credits: credits ?? null,
          type: type ?? 'not-registered',
          status: 'enrolled',
        }, { transaction: t });

        return { id: user.id, email, fullName, role: 'student' };
      } catch (err) {
        await this.auth0Service.deleteUser(auth0User.user_id);
        if (user) await user.destroy({ transaction: t });
        if (student) await student.destroy({ transaction: t });
        if (studentSemester) await studentSemester.destroy({ transaction: t });
        throw err;
      }
    });
  }
  
  async updateStudent(studentId: number, input: unknown) {
    const studentParsed = StudentSchema.safeParse(input);
    if (!studentParsed.success) throw new AppError('Invalid student input', 400, 'VALIDATION_ERROR', studentParsed.error.issues);

    const userParsed = UpdateUserSchema.safeParse(input);
    if (!userParsed.success) throw new AppError('Invalid user input', 400, 'VALIDATION_ERROR', userParsed.error.issues);

    const student = await this.studentRepository.findById(studentId);
    if (!student) throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');

    const user = await this.userRepository.findById(student.userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    const {
      email, fullName
    } = userParsed.data;
    const {
      studentIdCode: newStudentIdCode, cohortYear, className, dob, gender, phone, gpa, credits, type, semesterId
    } = studentParsed.data;

    // Check for duplicate studentId if changed
    if (newStudentIdCode && newStudentIdCode !== student.studentIdCode) {
      if (await this.studentRepository.findByStudentIdCode(newStudentIdCode)) {
        throw new AppError('Student ID already exists', 409, 'STUDENTID_EXISTS');
      }
    }

    return await sequelize.transaction(async (t) => {
      if ((email && email !== user.email) || (fullName && fullName !== user.fullName)) {
        await this.auth0Service.updateUser(user.auth0UserId as string, {
          email,
          name: fullName,
        }, { transaction: t });
      }
      // Update user info
      await user.update({
        email,
        fullName,
      }, { transaction: t });

      // Update student info
      await student.update({
        studentIdCode: newStudentIdCode ?? student.studentIdCode,
        cohortYear: cohortYear ?? student.cohortYear,
        className: className ?? student.className,
        dob: dob ? new Date(dob) : student.dob,
        gender: gender ?? student.gender,
        phone: phone ?? student.phone,
      }, { transaction: t });

      return await this.getStudentById(student.id);
    });
  }

  async deleteStudent(studentId: number) {
    const student = await this.studentRepository.findById(studentId);
    if (!student) throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');

    const user = await this.userRepository.findById(student.userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    return await sequelize.transaction(async (t) => {
      // Delete related student-semester records
      await this.studentSemesterRepository.delete(student.id);

      // Delete student record
      await this.studentRepository.delete(student.id);

      // Delete user record
      await this.userRepository.delete(user.id);

      return true;
    });
  }

  // TEACHER
  async getTeacherDetails(userId: number): Promise<TeacherDetails | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError('Teacher not found', 404, 'TEACHER_NOT_FOUND');

    const teacher = await this.teacherRepository.findByUserId(userId);
    if (!teacher) throw new AppError('Teacher not found', 404, 'TEACHER_NOT_FOUND');

    const result: TeacherDetails = {
      id: teacher.id,
      userId: teacher.userId,
      email: user.email,
      fullName: user.fullName,
      teacherCode: teacher.teacherCode,
      title: teacher.title,
      office: teacher.office,
      phone: teacher.phone,
    };

    return result;
  }

  async getTeacherById(id: number): Promise<TeacherDetails | null> {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) {
      throw new AppError('Teacher not found', 404, 'TEACHER_NOT_FOUND');
    }

    const user = await this.userRepository.findById(teacher.userId);
    if (!user) {
      throw new AppError('Teacher not found', 404, 'TEACHER_NOT_FOUND');
    }

    const result: TeacherDetails = {
      id: teacher.id,
      userId: teacher.userId,
      email: user.email,
      fullName: user.fullName,
      teacherCode: teacher.teacherCode,
      title: teacher.title,
      office: teacher.office,
      phone: teacher.phone,
    };
    return result;
  }

  async getTeacherIdByUserId(userId: number): Promise<number | null> {
    const teacher = await this.teacherRepository.findByUserId(userId);
    return teacher ? teacher.id : null;
  }

  async getAllTeachers(): Promise<TeacherDetails[]> {
    const teachers = await this.teacherRepository.findAll();
    const teacherDetailsList: TeacherDetails[] = [];
    for (const teacher of teachers) {
      const details = await this.getTeacherDetails(teacher.userId);
      if (details) {
        teacherDetailsList.push(details);
      }
    }
    return teacherDetailsList;
  }

  async createTeacher(input: unknown) {
    // Validate user part
    const userParsed = UserSchema.safeParse(input);
    if (!userParsed.success) throw new AppError('Invalid user input', 400, 'VALIDATION_ERROR', userParsed.error.issues);

    // Validate teacher part
    const teacherParsed = TeacherSchema.safeParse(input);
    if (!teacherParsed.success) throw new AppError('Invalid teacher input', 400, 'VALIDATION_ERROR', teacherParsed.error.issues);

    const {
      email, fullName, password, role
    } = userParsed.data;
    const {
      teacherCode, title, office, phone
    } = teacherParsed.data;

    if (await this.userRepository.findByEmail(email))
      throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');
    if (teacherCode && await this.teacherRepository.findTeacherByCode(teacherCode))
      throw new AppError('Teacher code already exists', 409, 'TEACHERCODE_EXISTS');

    let auth0User;
    try {
      auth0User = await this.auth0Service.createUser({
        connection: 'Username-Password-Authentication',
        email,
        password,
        name: fullName,
        username: teacherCode,
      } as CreateUserDto);
    } catch (err: any) {
      throw new AppError('Auth0 user creation failed', err.statusCode || 500, err.code, err.details);
    }

    const allRoles = await this.auth0Service.getAllRoles();
    const roleObj = allRoles.find(r => r.name === role);
    if (!roleObj) throw new AppError('Role not found in Auth0', 400, 'ROLE_NOT_FOUND');

    return await sequelize.transaction(async (t) => {
      let user: User | null = null;
      let teacher: Teacher | null = null;
      try {
        await this.auth0Service.assignRolesToUser(auth0User.user_id, [roleObj.id], { transaction: t });
        
        user = await this.userRepository.create({
          auth0UserId: auth0User.user_id,
          email,
          fullName,
        }, { transaction: t });

        teacher = await this.teacherRepository.create({
          userId: user.id,
          teacherCode,
          title,
          office,
          phone,
        }, { transaction: t });

        return { id: user.id, email, fullName, role: 'teacher' };
      } catch (err) {
        await this.auth0Service.deleteUser(auth0User.user_id);
        if (user) await user.destroy({ transaction: t });
        if (teacher) await teacher.destroy({ transaction: t });
        throw err;
      }
    });
  }

  async updateTeacher(teacherId: number, input: unknown) {
    const teacherParsed = TeacherSchema.safeParse(input);
    if (!teacherParsed.success) throw new AppError('Invalid teacher input', 400, 'VALIDATION_ERROR', teacherParsed.error.issues);
    
    const userParsed = UpdateUserSchema.safeParse(input);
    if (!userParsed.success) throw new AppError('Invalid user input', 400, 'VALIDATION_ERROR', userParsed.error.issues);

    const teacher = await this.teacherRepository.findById(teacherId);
    if (!teacher) throw new AppError('Teacher not found', 404, 'TEACHER_NOT_FOUND');
    
    const user = await this.userRepository.findById(teacher.userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    const { email, fullName } = userParsed.data;
    const { teacherCode, title, office, phone } = teacherParsed.data;

    // Check for duplicate teacherCode if changed
    if (teacherCode && teacherCode !== teacher.teacherCode) {
      if (await this.teacherRepository.findTeacherByCode(teacherCode)) {
        throw new AppError('Teacher code already exists', 409, 'TEACHERCODE_EXISTS');
      }
    }
    
    return await sequelize.transaction(async (t) => {
      if ((email && email !== user.email) || (fullName && fullName !== user.fullName)) {
        await this.auth0Service.updateUser(user.auth0UserId as string, {
          email,
          name: fullName,
        }, { transaction: t });
      }

      // Update user info
      await user.update({
        email,
        fullName,
      });

      // Update teacher info
      await teacher.update({
        teacherCode: teacherCode ?? teacher.teacherCode,
        title: title ?? teacher.title,
        office: office ?? teacher.office,
        phone: phone ?? teacher.phone,
      });

      return await this.getTeacherById(teacher.id);
    });
  }

  async deleteTeacher(teacherId: number) {
    const teacher = await this.teacherRepository.findById(teacherId);
    if (!teacher) throw new AppError('Teacher not found', 404, 'TEACHER_NOT_FOUND');
    
    const user = await this.userRepository.findById(teacher.userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    
    return await sequelize.transaction(async (t) => {
      // Delete teacher record
      await this.teacherRepository.delete(teacher.id);
      // Delete user record
      
      await this.userRepository.delete(user.id);
      return true;
    });
  }

  // Administrator CRUD
  async getAllAdministrators() {
    const admins = await this.auth0Service.getUsersByRoleNames(['admin', 'moderator']);
    admins.map(admin => ({
      id: admin.user_id,
      email: admin.email,
      fullName: admin.name,
    }));
    const result = await Promise.all(admins.map(async (admin) => {
      const user = await this.userRepository.findByAuth0Id(admin.user_id);
      if (user) {
        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        };
      }
      return null;
    }));

    return result;
  }
  
  async createAdministrator(input: unknown) {
    // Validate user part only
    const userParsed = UserSchema.safeParse(input);
    if (!userParsed.success) throw new AppError('Invalid user input', 400, 'VALIDATION_ERROR', userParsed.error.issues);

    const { email, fullName, password, role } = userParsed.data;
    const username = email.split("@")[0];

    if (role !== 'admin' && role !== 'moderator') {
      throw new AppError('Invalid role for administrator', 400, 'INVALID_ROLE');
    }

    if (await this.userRepository.findByEmail(email))
      throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');

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

    const allRoles = await this.auth0Service.getAllRoles();
    const roleObj = allRoles.find(r => r.name === role);
    if (!roleObj) throw new AppError('Role not found in Auth0', 400, 'ROLE_NOT_FOUND');

    return await sequelize.transaction(async (t) => {
      let user: User | null = null;
      try {
        await this.auth0Service.assignRolesToUser(auth0User.user_id, [roleObj.id], { transaction: t });

        user = await this.userRepository.create({
          auth0UserId: auth0User.user_id,
          email,
          fullName,
        }, { transaction: t });

        return { id: user.id, email, fullName, role: 'administrator' };
      } catch (err) {
        await this.auth0Service.deleteUser(auth0User.user_id);
        if (user) await user.destroy({ transaction: t });
        throw err;
      }
    });
  }

  async updateAdministrator(adminId: number, input: unknown) {
    console.log('Update administrator input: ', input);
    const userParsed = UpdateUserSchema.safeParse(input);
    if (!userParsed.success) throw new AppError('Invalid user input', 400, 'VALIDATION_ERROR', userParsed.error.issues);
    const { email, fullName } = userParsed.data;

    const user = await this.userRepository.findById(adminId);
    if (!user) throw new AppError('Administrator not found', 404, 'ADMIN_NOT_FOUND');

    return await sequelize.transaction(async (t) => {

      // Update in Auth0
      await this.auth0Service.updateUser(user.auth0UserId as string, {
        email,
        name: fullName,
      });

      // Update in database
      await user.update({
        email,
        fullName,
      }, { transaction: t });

      // Trả về dữ liệu mới
      return await this.getUserWithRolesById(user.id);
    });
  }

  async deleteAdministrator(adminId: number) {
    const user = await this.userRepository.findById(adminId);
    if (!user) throw new AppError('Administrator not found', 404, 'ADMIN_NOT_FOUND');
    return await sequelize.transaction(async (t) => {
      // Delete user record
      await this.userRepository.delete(user.id);
      return true;
    });
  }

  // CRUD OPERATIONS
  async getUserByAuth0Id(auth0UserId: string): Promise<User | null> {
    return await this.userRepository.findByAuth0Id(auth0UserId);
  }

  async getUsersByAuth0Ids(auth0Ids: string[]): Promise<User[]> {
    return await this.userRepository.findByAuth0Ids(auth0Ids);
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getUserWithRolesById(id: number) {
    const user = await this.userRepository.findById(id) as User;
    if (!user) return null;

    const userRoles = await this.auth0Service.getUserRoles(user.auth0UserId as string);
    if (!userRoles) return null;
    const roles = userRoles.map(role => ({ id: role.id, name: role.name }));

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles,
    };
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
          { email: { [Op.like]: `%${query}%` } },
          { fullName: { [Op.like]: `%${query}%` } },
        ]
      }});
    return users;
  }
}

export default UserService;