import { Request, Response, NextFunction } from 'express';
import { PreThesisService } from '../services/pre-thesis.service';
import { AppError } from '../utils/AppError';
import { SemesterService } from '../services/semester.service';
import { UserService } from '../services/user.service';
import { PreThesisReportData } from '../types/report.types';
import path from 'path';
import { Attachment } from '../models/Attachment';

export class PreThesisController {
  private preThesisService: PreThesisService;
  private userService: UserService;
  private semesterService: SemesterService;

  constructor() {
    this.preThesisService = new PreThesisService();
    this.userService = new UserService();
    this.semesterService = new SemesterService();
  }

  // Topic endpoints
  getTopics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { semesterId, query, status } = req.query;
      
      let topics;
      
      if (query) {
        topics = await this.preThesisService.searchTopics(query as string);
      } else if (status === 'open' && semesterId) {
        topics = await this.preThesisService.getOpenTopicsByActiveSemester();
      } else {
        topics = await this.preThesisService.getOpenTopicsByActiveSemester();
      }
      
      res.status(200).json({
        status: 'success',
        data: topics
      });
    } catch (error) {
      next(error);
    }
  };

  getOwnTopicsInActiveSemester = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Fetching own topics in active semester');
      const userId = req.user?.id;
      const teacherId = await this.userService.getTeacherIdByUserId(Number(userId));
      if (!teacherId) {
        throw new AppError('User is not a teacher', 403, 'NOT_A_TEACHER');
      }
      const activeSemester = await this.semesterService.getActiveSemester();
      if (!activeSemester) {
        throw new AppError('No active semester found', 404, 'NO_ACTIVE_SEMESTER');
      }
      const teacherTopics = await this.preThesisService.getTeacherTopics(teacherId, activeSemester.id || 0);
      
      res.status(200).json({
        status: 'success',
        data: teacherTopics
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const topicId = Number(req.params.id);
      await this.preThesisService.deleteTopic(topicId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getTopicsWithSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { semesterId } = req.query;
      const topics = semesterId
        ? await this.preThesisService.getTopicsBySemester(Number(semesterId))
        : await this.preThesisService.getAllTopicsByActiveSemester();

      const topicIds = topics.map(t => t.id);
      const applications = await this.preThesisService.getApplicationsByTopicIds(topicIds);

      const slotsMap: Record<number, number> = {};
      applications.forEach(app => {
        if (app.status === 'accepted') {
          slotsMap[app.topicId] = (slotsMap[app.topicId] || 0) + 1;
        }
      });

      const result = topics.map(topic => ({
        ...topic.toJSON(),
        slotsLeft: topic.maxSlots !== null ? Math.max(0, topic.maxSlots - (slotsMap[topic.id] || 0)) : null,
      }));

      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  updateTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const topicId = Number(req.params.id);
      let { maxSlots, teacherId, semesterId } = req.body;

      if (!teacherId || !semesterId) {
        const oldTopic = await this.preThesisService.getTopicById(topicId);
        if (!oldTopic) throw new AppError('Topic not found', 404, 'TOPIC_NOT_FOUND');
        teacherId = teacherId || oldTopic.teacherId;
        semesterId = semesterId || oldTopic.semesterId;
      }

      // counts teacher's slots for each topic in the semester
      const teacherTopics = await this.preThesisService.getTeacherTopics(teacherId, semesterId);
      if (!teacherTopics) {
        throw new AppError('Teacher topics not found', 404, 'TEACHER_TOPICS_NOT_FOUND');
      }
      const totalSlots = teacherTopics.reduce((sum, topic) => sum + (topic.maxSlots || 0), 0);

      const teacherAvailableSlots = (await this.semesterService.getTeacherAvailabilityInSemester(teacherId, semesterId)).availability.maxPreThesis;
      if (totalSlots + maxSlots > teacherAvailableSlots) {
        throw new AppError(`Exceeds available slots. You can only create ${teacherAvailableSlots - totalSlots} more slots.`, 400, 'EXCEEDS_AVAILABLE_SLOTS');
      }

      const updatedTopic = await this.preThesisService.updateTopic(topicId, req.body);
      res.status(200).json({
        status: 'success',
        data: updatedTopic
      });
    } catch (error) {
      next(error);
    }
  };

  getTopicById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const topic = await this.preThesisService.getTopicById(Number(req.params.id));
      if (!topic) {
        throw new AppError('Topic not found', 404, 'TOPIC_NOT_FOUND');
      }
      
      res.status(200).json({
        status: 'success',
        data: topic
      });
    } catch (error) {
      next(error);
    }
  };

  getTopicsBySemester = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { semesterId } = req.params;
      const topics = await this.preThesisService.getTopicsBySemester(Number(semesterId));
      
      res.status(200).json({
        status: 'success',
        data: topics
      });
    } catch (error) {
      next(error);
    }
  };

  createTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, requirements, tags, maxSlots, semesterId } = req.body;
      const userId = req.user?.id;
      const teacherId = await this.userService.getTeacherIdByUserId(Number(userId));
      if (!teacherId) {
        throw new AppError('User is not a teacher', 403, 'NOT_A_TEACHER');
      }

      // counts teacher's slots for each topic in the semester
      const activeSemester = await this.semesterService.getActiveSemester();
      const teacherTopics = await this.preThesisService.getTeacherTopics(teacherId, activeSemester?.id || 0);
      const totalSlots = teacherTopics.reduce((sum, topic) => sum + (topic.maxSlots || 0), 0);

      const teacherAvailableSlots = (await this.semesterService.getTeacherAvailabilityInSemester(teacherId, semesterId)).availability.maxPreThesis;
      if (totalSlots + maxSlots > teacherAvailableSlots) {
        throw new AppError(`Exceeds available slots. You can only create ${teacherAvailableSlots - totalSlots} more slots.`, 400, 'EXCEEDS_AVAILABLE_SLOTS');
      }

      const topic = await this.preThesisService.createTopic({
        title,
        description,
        requirements,
        tags,
        maxSlots,
        semesterId,
        teacherId
      });
      res.status(201).json({
        status: 'success',
        data: topic
      });
    } catch (err) {
      next(err);
    }
  }

  // Application endpoints
  applyToTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { topicId } = req.params;
      const { proposalTitle, proposalAbstract } = req.body;
      const userId = req.user?.id;
      const student = await this.userService.getStudentByUserId(Number(userId));
      if (!student) throw new AppError('User is not a student', 403, 'NOT_A_STUDENT');

      const topic = await this.preThesisService.getTopicById(Number(topicId));
      if (!topic) throw new AppError('Topic not found', 404, 'TOPIC_NOT_FOUND');
      if (topic.status !== 'open') throw new AppError('Topic is not open for applications', 400, 'TOPIC_CLOSED');
      
      if (topic.maxSlots !== null && topic.maxSlots > 0) {
        const acceptedCount = await this.preThesisService.countAcceptedApplicationsOfTopic(topic.id);
        if (acceptedCount >= topic.maxSlots) {
          throw new AppError('No slots available for this topic', 400, 'NO_SLOT_AVAILABLE');
        }
      }
      
      const studentSemester = await this.semesterService.getStudentSemester(Number(student?.id), Number(topic?.semesterId));
      if (!studentSemester) throw new AppError('Student is not enrolled in the semester of the topic', 400, 'NOT_ENROLLED_IN_SEMESTER');
      if (studentSemester.type !== 'pre-thesis') throw new AppError('Student is not eligible for pre-thesis topics in this semester', 400, 'NOT_ELIGIBLE_FOR_PRE_THESIS');
      
      const oldApp = await this.preThesisService.getApplicationByStudentAndTopic(Number(student.id), Number(topicId));
      if (oldApp) {
        if (oldApp.status === 'pending' || oldApp.status === 'accepted') {
          throw new AppError('You have already applied to this topic', 400, 'ALREADY_APPLIED');
        }
        
        const updated = await this.preThesisService.updateApplication(oldApp.id, {
          proposalTitle,
          proposalAbstract,
          status: 'pending',
          note: null,
        });
        res.status(200).json({
          status: 'success',
          data: updated,
        });
        return;
      }

      const application = await this.preThesisService.applyToTopic(
        Number(topicId),
        Number(student?.id),
        { proposalTitle, proposalAbstract }
      );
      
      res.status(201).json({
        status: 'success',
        data: application
      });
    } catch (error) {
      next(error);
    }
  };

  updateApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const student = await this.userService.getStudentByUserId(Number(userId));
      if (!student) throw new AppError('User is not a student', 403, 'NOT_A_STUDENT');
      const applicationId = Number(req.params.id);

      const app = await this.preThesisService.getApplicationById(applicationId);
      if (!app || app.studentId !== student.id) throw new AppError('Forbidden', 403, 'FORBIDDEN');
      if (app.status !== 'pending') throw new AppError('Only pending applications can be updated', 400, 'INVALID_STATUS');

      const { proposalTitle, proposalAbstract } = req.body;
      const updated = await this.preThesisService.updateApplication(applicationId, { proposalTitle, proposalAbstract });
      res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      next(error);
    }
  };

  getMyApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const student = await this.userService.getStudentByUserId(Number(userId));
      if (!student) throw new AppError('User is not a student', 403, 'NOT_A_STUDENT');
      const applications = await this.preThesisService.getApplicationsByStudent(Number(student.id), Number(req.params.semesterId));
      
      res.status(200).json({
        status: 'success',
        data: applications
      });
    } catch (error) {
      next(error);
    }
  };

  getApplicationsByTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const teacherId = await this.userService.getTeacherIdByUserId(Number(userId));
      if (!teacherId) {
        throw new AppError('User is not a teacher', 403, 'NOT_A_TEACHER');
      }

      const applications = await this.preThesisService.getApplicationsByTeacher(teacherId, Number(req.params.semesterId));
      
      res.status(200).json({
        status: 'success',
        data: applications
      });
    } catch (error) {
      next(error);
    }
  };

  getApplicationsByTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { topicId } = req.params;
      const applications = await this.preThesisService.getApplicationsByTopicId(Number(topicId));
      res.status(200).json({
        status: 'success',
        data: applications
      });
    } catch (error) {
      next(error);
    }
  };

  getApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, topicId } = req.query;
      let applications;
      
      if (studentId) {
        const semesterId = req.query.semesterId ? Number(req.query.semesterId) : undefined;
        applications = await this.preThesisService.getApplicationsByStudent(Number(studentId), semesterId);
      } else if (topicId) {
        applications = await this.preThesisService.getApplicationsByTopicId(Number(topicId));
      } else {
        throw new AppError('Please provide studentId or topicId', 400, 'MISSING_QUERY');
      }
      
      res.status(200).json({
        status: 'success',
        data: applications
      });
    } catch (error) {
      next(error);
    }
  };

  getApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const application = await this.preThesisService.getApplicationById(Number(req.params.id));
      
      if (!application) {
        throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
      }
      
      res.status(200).json({
        status: 'success',
        data: application
      });
    } catch (error) {
      next(error);
    }
  };

  updateApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, note } = req.body;
      const applicationId = Number(req.params.id);
      console.log(`Updating application ID ${applicationId} to status: ${status}`);
      
      if (!['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
        throw new AppError('Invalid status value', 400, 'INVALID_STATUS');
      }
      
      const application = await this.preThesisService.updateApplicationStatus(applicationId, status, note);
      
      res.status(200).json({
        status: 'success',
        data: application
      });
    } catch (error) {
      next(error);
    }
  };

  cancelApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applicationId = Number(req.params.id);
      console.log(`Cancelling application with ID: ${applicationId}`);
      
      const application = await this.preThesisService.updateApplicationStatus(applicationId, 'cancelled');
      
      res.status(200).json({
        status: 'success',
        data: application
      });
    } catch (error) {
      next(error);
    }
  };
  
  // PreThesis endpoints
  getPreTheses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, supervisorId, semesterId, applicationId, status } = req.query;
      let preTheses;
      
      if (studentId) {
        preTheses = await this.preThesisService.getPreThesisByStudent(
          Number(studentId), 
          semesterId ? Number(semesterId) : undefined
        );
      } else if (supervisorId) {
        preTheses = await this.preThesisService.getPreThesisBySupervisor(
          Number(supervisorId), 
          semesterId ? Number(semesterId) : undefined
        );
      } else if (semesterId) {
        preTheses = await this.preThesisService.getPreThesisBySemester(Number(semesterId));
      } else if (applicationId) {
        const preThesis = await this.preThesisService.getPreThesisByTopicApplication(Number(applicationId));
        preTheses = preThesis ? [preThesis] : [];
      } else if (status === 'completed') {
        preTheses = await this.preThesisService.getCompletedPreTheses(
          semesterId ? Number(semesterId) : undefined
        );
      } else {
        throw new AppError('Please provide valid query parameters', 400, 'MISSING_QUERY');
      }
      
      res.status(200).json({
        status: 'success',
        data: preTheses
      });
    } catch (error) {
      next(error);
    }
  };

  getPreThesisById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const preThesis = await this.preThesisService.getPreThesisById(Number(req.params.id));
      if (!preThesis) {
        throw new AppError('Pre-thesis not found', 404, 'PRETHESIS_NOT_FOUND');
      }

      const student = await this.userService.getStudentById(preThesis.studentId);
      if (!student) {
        throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
      }

      const supervisor = await this.userService.getTeacherById(preThesis.supervisorTeacherId);
      if (!supervisor) {
        throw new AppError('Supervisor not found', 404, 'SUPERVISOR_NOT_FOUND');
      }

      const topicApplication = preThesis.topicApplicationId
        ? await this.preThesisService.getApplicationById(preThesis.topicApplicationId)
        : null;

      const topic = topicApplication
        ? await this.preThesisService.getTopicById(topicApplication.topicId)
        : null;
      
      res.status(200).json({
        status: 'success',
        data: { preThesis, student, supervisor, topicApplication, topic }
      });
    } catch (error) {
      next(error);
    }
  };

  getMyPreTheses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const student = await this.userService.getStudentByUserId(Number(userId));
      if (!student) throw new AppError('User is not a student', 403, 'NOT_A_STUDENT');
      const preTheses = await this.preThesisService.getPreThesisByStudent(Number(student.id));
      res.status(200).json({
        status: 'success',
        data: preTheses
      });
    } catch (error) {
      next(error);
    }
  };

  getPreThesesByTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const semesterId = Number(req.params.semesterId);
      const teacherId = await this.userService.getTeacherIdByUserId(Number(userId));
      if (!teacherId) {
        throw new AppError('User is not a teacher', 403, 'NOT_A_TEACHER');
      }
      const preTheses = await this.preThesisService.getPreThesisBySupervisor(teacherId, semesterId);
      
      res.status(200).json({
        status: 'success',
        data: preTheses
      });
    } catch (error) {
      next(error);
    }
  };

  
  
  getPreThesesByAdministrator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const semesterId = Number(req.params.semesterId);
      const preTheses = await this.preThesisService.getPreThesisBySemester(semesterId);
      
      res.status(200).json({
        status: 'success',
        data: preTheses
      });
    } catch (error) {
      next(error);
    }
  };

  createPreThesis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, semesterId, supervisorTeacherId, topicApplicationId } = req.body;
      
      if (!studentId || !semesterId || !supervisorTeacherId) {
        throw new AppError('Missing required fields', 400, 'MISSING_FIELDS');
      }
      
      const preThesis = await this.preThesisService.createPreThesis(
        Number(studentId),
        Number(semesterId),
        Number(supervisorTeacherId),
        topicApplicationId ? Number(topicApplicationId) : undefined
      );
      
      res.status(201).json({
        status: 'success',
        data: preThesis
      });
    } catch (error) {
      next(error);
    }
  };

  updatePreThesisStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.body;
      const preThesisId = Number(req.params.id);
      
      if (!['in_progress', 'completed', 'cancelled'].includes(status)) {
        throw new AppError('Invalid status value', 400, 'INVALID_STATUS');
      }
      
      const preThesis = await this.preThesisService.updatePreThesisStatus(preThesisId, status);
      
      res.status(200).json({
        status: 'success',
        data: preThesis
      });
    } catch (error) {
      next(error);
    }
  };

  gradePreThesis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { finalScore, feedback } = req.body;
      const preThesisId = Number(req.params.id);
      
      if (finalScore === undefined || finalScore === null) {
        throw new AppError('Final score is required', 400, 'MISSING_FINAL_SCORE');
      }
      
      const preThesis = await this.preThesisService.gradePreThesis(preThesisId, Number(finalScore), feedback);
      
      res.status(200).json({
        status: 'success',
        data: preThesis
      });
    } catch (error) {
      next(error);
    }
  };

  submitPreThesisFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const preThesisId = Number(req.params.id);
      const userId = req.user?.id;
      if (!preThesisId || !userId) {
        return res.status(400).json({ status: 'fail', message: 'Missing preThesisId or user' });
      }
      if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
        return res.status(400).json({ status: 'fail', message: 'No files uploaded' });
      }

      const attachments = await Promise.all(
        (req.files as Express.Multer.File[]).map(file =>
          Attachment.create({
            entityType: 'prethesis_submission',
            entityId: preThesisId,
            fileUrl: `/uploads/${file.filename}`,
            fileName: file.originalname,
            mimeType: file.mimetype,
            uploadedByUserId: Number(userId),
          })
        )
      );

      res.status(201).json({ status: 'success', data: attachments });
    } catch (error) {
      next(error);
    }
  };

  // Statistics endpoints
  getPreThesisStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { semesterId } = req.params;
      
      if (!semesterId) {
        throw new AppError('Semester ID is required', 400, 'MISSING_SEMESTER_ID');
      }
      
      const stats = await this.preThesisService.getPreThesisCountByStatus(Number(semesterId));
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  getApplicationStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { semesterId } = req.params;
      
      if (!semesterId) {
        throw new AppError('Semester ID is required', 400, 'MISSING_SEMESTER_ID');
      }
      
      const stats = await this.preThesisService.getApplicationStatsBySemester(Number(semesterId));
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Controller for generating pre-thesis academic reports as PDF
   */
  generatePreThesisReportPDF = async (req: Request, res: Response): Promise<void> => {
    try {
      // In a real app, you'd get this data from the database
      // based on the request parameters (e.g., studentId)
      const reportData: PreThesisReportData = {
        student: {
          name: "",
          id: "",
          phone: "",
          className: "",
          cohortYear: 0,
          gpa: 0,
          accumulatedCredits: 0,
          preThesisTitle: ""
        },
        supervisor: {
          name: "",
          academicTitle: "",
          department: ""
        },
        evaluation: {
          numericGrade: 0,
          letterGrade: "",
          comments: "",
          status: "Pass"
        },
        semester: "",
        date: new Date(),
        universityInfo: {
          name: "International University - Vietnam National University HCM City",
          logo: path.join(__dirname, '../assets/Logo-HCMIU.svg.png'),
          address: "Quarter 33, Linh Xuan Ward, Ho Chi Minh City, Vietnam",
          contact: "info@hcmiu.edu.vn | (028) 37244270"
        },
        departmentHead: {
          name: "",
          title: ""
        }
      };

      const pdfBuffer = await this.preThesisService.generatePreThesisReport(reportData);
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=pre-thesis-report-${reportData.student.id}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send PDF buffer as response
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating pre-thesis report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate pre-thesis report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}