import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import { Op } from 'sequelize';
import { PreThesisReportData } from '../types/report.types';

import { Transaction } from 'sequelize';
import { sequelize } from '../models/db';
import { PreThesis } from '../models/PreThesis';
import { Topic } from '../models/Topic';
import { TopicApplication } from '../models/TopicApplication';
import { AppError } from '../utils/AppError';

import { NotificationService } from './notification.service';

import { PreThesisRepository } from '../repositories/pre-thesis.repository';
import { TopicApplicationRepository } from '../repositories/topic-application.repository';
import { TopicRepository } from '../repositories/topic.repository';
import { SemesterRepository } from '../repositories/semester.repository';
import { TeacherAvailabilityRepository } from '../repositories/teacher-availability.repository';
import { StudentRepository } from '../repositories/student.repository';
import { TeacherRepository } from '../repositories/teacher.repository';
import { Semester } from '../models/Semester';

export class PreThesisService {
  private preThesisRepository: PreThesisRepository;
  private topicApplicationRepository: TopicApplicationRepository;
  private topicRepository: TopicRepository;
  private semesterRepository: SemesterRepository;
  private teacherAvailabilityRepository: TeacherAvailabilityRepository;
  private studentRepository: StudentRepository;
  private teacherRepository: TeacherRepository;

  private notificationService: NotificationService = new NotificationService();

  constructor() {
    this.preThesisRepository = new PreThesisRepository();
    this.topicApplicationRepository = new TopicApplicationRepository();
    this.topicRepository = new TopicRepository();
    this.semesterRepository = new SemesterRepository();
    this.teacherAvailabilityRepository = new TeacherAvailabilityRepository();
    this.studentRepository = new StudentRepository();
    this.teacherRepository = new TeacherRepository();
  }

  // Topic-related methods
  async getAllTopicsByActiveSemester(): Promise<Topic[]> {
    const activeSemester = await new SemesterRepository().findActiveSemester();
    if (!activeSemester) throw new AppError('No active semester found', 404, 'NO_ACTIVE_SEMESTER');
    return this.topicRepository.findBySemesterId(activeSemester.id || 0);
  }

  async getOpenTopicsByActiveSemester(): Promise<Topic[]> {
    const activeSemester = await new SemesterRepository().findActiveSemester();
    if (!activeSemester) throw new AppError('No active semester found', 404, 'NO_ACTIVE_SEMESTER');
    return this.topicRepository.findOpenTopicsBySemesterId(activeSemester.id || 0);
  }

  async getTopicById(id: number): Promise<Topic | null> {
    return this.topicRepository.findById(id);
  }

  async getTopicsBySemester(semesterId: number): Promise<Topic[]> {
    return this.topicRepository.findBySemesterId(semesterId);
  }

  async getTeacherTopics(teacherId: number, semesterId?: number): Promise<Topic[]> {
    return this.topicRepository.findByTeacherId(teacherId, semesterId);
  }

  async searchTopics(query: string, semesterId?: number): Promise<Topic[]> {
    return this.topicRepository.searchTopics(query, semesterId);
  }

  async createTopic(data: {
    title: string;
    description: string;
    requirements?: string;
    tags?: string[];
    maxSlots?: number | null;
    semesterId: number;
    teacherId: number;
  }): Promise<Topic> {
    const topic = await this.topicRepository.create(data);

    return topic;
  }

  async updateTopic(
    id: number,
    data: {
      title?: string;
      description?: string;
      requirements?: string;
      tags?: string[];
      maxSlots?: number | null;
      status?: 'open' | 'closed';
    }
  ): Promise<Topic | null> {
    return this.topicRepository.update(id, data);
  }

  async deleteTopic(id: number): Promise<boolean> {
    return this.topicRepository.delete(id);
  }

  // Application-related methods
  async getApplicationsByTopicIds(topicIds: number[]): Promise<TopicApplication[]> {
    return this.topicApplicationRepository.findByTopicIds(topicIds);
  }

  async applyToTopic(
    topicId: number, 
    studentId: number, 
    semesterId: number,
    data?: { proposalTitle?: string, proposalAbstract?: string }
  ): Promise<TopicApplication> {
    const semester = await this.semesterRepository.findById(semesterId);
    if (!semester) throw new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND');
    if (semester.isActive === false) {
      throw new AppError('Cannot apply to topics in an inactive semester', 400, 'SEMESTER_INACTIVE');
    }
    const topic = await this.topicRepository.findById(topicId);
    if (!topic) throw new AppError('Topic not found', 404, 'TOPIC_NOT_FOUND');
    if (topic.status === 'closed') throw new AppError('Topic is closed for applications', 400, 'TOPIC_CLOSED');
    
    // Check if student already has an accepted application
    const acceptedApplications = await this.topicApplicationRepository.findByStudentId(studentId, semesterId);
    const hasAccepted = acceptedApplications.some(app => app.status === 'accepted');
    if (hasAccepted) {
      throw new AppError('Student already has an accepted topic application', 400, 'STUDENT_ALREADY_ACCEPTED');
    }
    
    // Check if topic has available slots
    if (topic.maxSlots !== null) {
      const topicApplications = await this.topicApplicationRepository.findByTopicId(topicId);
      const acceptedCount = topicApplications.filter(app => app.status === 'accepted').length;
      
      if (acceptedCount >= topic.maxSlots) {
        throw new AppError('Topic has reached maximum number of students', 400, 'TOPIC_FULL');
      }
    }
    
    // Create the application
    const application = await this.topicApplicationRepository.create({
      topicId,
      studentId,
      status: 'pending',
      proposalTitle: data?.proposalTitle || null,
      proposalAbstract: data?.proposalAbstract || null
    });

    const student = await this.studentRepository.findById(studentId);

    await this.notificationService.createNotification({
      userId: Number(student?.userId),
      type: 'TOPIC_APPLICATION',
      title: 'New Topic Application',
      content: `A new application has been submitted for your topic "${topic.title}".`
    });

    return application;
  }

  async getApplicationsByStudent(studentId: number, semesterId?: number): Promise<TopicApplication[]> {
    return this.topicApplicationRepository.findByStudentId(studentId, semesterId);
  }

  async getApplicationsByTeacher(teacherId: number, semesterId?: number): Promise<TopicApplication[]> {
    return this.topicApplicationRepository.findByTeacherId(teacherId, semesterId);
  }

  async getApplicationsByTopicId(topicId: number): Promise<TopicApplication[]> {
    return this.topicApplicationRepository.findByTopicId(topicId);
  }

  async getApplicationById(id: number): Promise<TopicApplication | null> {
    return this.topicApplicationRepository.findById(id);
  }

  getApplicationByStudentAndTopic(studentId: number, topicId: number) {
    return this.topicApplicationRepository.findByStudentAndTopic(studentId, topicId);
  }

  async countAcceptedApplicationsOfTopic(topicId: number): Promise<number> {
    return this.topicApplicationRepository.countAcceptedApplications(topicId);
  }

  async countAcceptedApplicationsOfTeaccher(teacherId: number, semesterId: number): Promise<number> {
    const applications = await this.topicApplicationRepository.findByTeacherId(teacherId, semesterId);
    return applications.filter(app => app.status === 'accepted').length;
  }

  async updateApplication(id: number, data: { proposalTitle?: string, proposalAbstract?: string, note?: string | null, status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' }): Promise<TopicApplication | null> {
    return this.topicApplicationRepository.update(id, data);
  }
  
  async updateApplicationStatus(
    id: number, 
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled', 
    note?: string
  ): Promise<TopicApplication | null> {
    // Use a transaction to ensure consistency when accepting applications
    const transaction = await sequelize.transaction();
    try {
      const application = await this.topicApplicationRepository.findById(id);
      if (!application) {
        await transaction.rollback();
        throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
      }

      // If accepting an application, create a pre-thesis automatically
      if (status === 'accepted') {
        // Get the topic to find the teacher ID
        const topic = await this.topicRepository.findById(application.topicId);
        if (!topic) {
          await transaction.rollback();
          throw new AppError('Topic not found', 404, 'TOPIC_NOT_FOUND');
        }

        // Check if student already has a pre-thesis for this semester
        const existingPreThesis = await this.preThesisRepository.findByStudent(application.studentId, topic.semesterId);
        if (existingPreThesis.length > 0) {
          await transaction.rollback();
          throw new AppError('Student already has a pre-thesis for this semester', 400, 'STUDENT_ALREADY_PRETHESIS');
        }

        // check if topic has available slots
        if (topic.maxSlots !== null) {
          const acceptedCount = await this.topicApplicationRepository.countAcceptedApplications(topic.id);
          if (acceptedCount >= topic.maxSlots) {
            await transaction.rollback();
            throw new AppError('No slots available for this topic', 400, 'NO_SLOT_AVAILABLE');
          }
        }

        // check if teacher has exceeded max supervisee limit (if any)
        const maxPreThesisOfTeacher = await this.countAcceptedApplicationsOfTeaccher(topic.teacherId, topic.semesterId);
        const availability = await this.teacherAvailabilityRepository.findById(topic.teacherId);
        if (availability && availability.maxPreThesis !== null && maxPreThesisOfTeacher >= availability.maxPreThesis) {
          await transaction.rollback();
          throw new AppError('Teacher has reached maximum supervisee limit', 400, 'TEACHER_MAX_SUPERVISEES_REACHED');
        }

        // Update the application status
        await this.topicApplicationRepository.updateStatus(id, status, note, transaction);

        // Create pre-thesis
        await this.preThesisRepository.create({
          studentId: application.studentId,
          topicApplicationId: application.id,
          semesterId: topic.semesterId,
          supervisorTeacherId: topic.teacherId,
          status: 'in_progress',
          finalScore: null
        }, { transaction });

        // Automatically reject other applications from this student
        const otherApplications = await this.topicApplicationRepository.findByStudentId(
          application.studentId
        );
        
        for (const app of otherApplications) {
          if (app.id !== id && app.status === 'pending') {
            await this.topicApplicationRepository.updateStatus(
              app.id, 
              'rejected', 
              'Automatically rejected as another topic was accepted', 
              transaction
            );
          }
        }

      } else {
        // Just update the status for non-accepted statuses
        await this.topicApplicationRepository.updateStatus(id, status, note, transaction);
      }

      await transaction.commit();

      return this.topicApplicationRepository.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async cancelApplication(id: number, note?: string): Promise<TopicApplication | null> {
    return this.updateApplicationStatus(id, 'cancelled', note);
  }

  // PreThesis-related methods
  async getPreThesisByStudent(studentId: number, semesterId?: number): Promise<PreThesis[]> {
    return this.preThesisRepository.findByStudent(studentId, semesterId);
  }

  async getPreThesisBySupervisor(teacherId: number, semesterId?: number): Promise<PreThesis[]> {
    return this.preThesisRepository.findBySupervisor(teacherId, semesterId);
  }

  async getPreThesisBySemester(semesterId: number): Promise<PreThesis[]> {
    return this.preThesisRepository.findBySemester(semesterId);
  }

  async getPreThesisByTopicApplication(applicationId: number): Promise<PreThesis | null> {
    return this.preThesisRepository.findByTopicApplication(applicationId);
  }

  async getPreThesisById(id: number): Promise<PreThesis | null> {
    return this.preThesisRepository.findById(id);
  }

  async createPreThesis(
    studentId: number,
    semesterId: number,
    supervisorTeacherId: number,
    topicApplicationId?: number
  ): Promise<PreThesis> {
    // Check if student already has a pre-thesis for this semester
    const existing = await this.preThesisRepository.findByStudentAndSemester(studentId, semesterId);
    if (existing) {
      throw new AppError('Student already has a pre-thesis for this semester', 400, 'STUDENT_ALREADY_PRETHESIS');
    }

    const supervisor = await this.teacherRepository.findById(supervisorTeacherId);
    const student = await this.studentRepository.findById(studentId);

    await this.notificationService.createNotification({
      userId: Number(supervisor?.userId),
      type: 'PRE_THESIS_CREATED',
      title: 'New Pre-Thesis Assigned',
      content: `A new pre-thesis has been assigned to you for supervision.`
    });

    await this.notificationService.createNotification({
      userId: Number(student?.userId),
      type: 'PRE_THESIS_CREATED',
      title: 'Pre-Thesis Created',
      content: `Your pre-thesis has been created and assigned to your supervisor.`
    });

    return this.preThesisRepository.create({
      studentId,
      semesterId,
      supervisorTeacherId,
      topicApplicationId: topicApplicationId || null,
      status: 'in_progress',
      finalScore: null
    });
  }

  async updatePreThesisStatus(id: number, status: 'in_progress' | 'completed'): Promise<PreThesis | null> {
    return this.preThesisRepository.updateStatus(id, status);
  }

  async gradePreThesis(id: number, finalScore: number, feedback?: string): Promise<PreThesis | null> {
    if (finalScore < 0 || finalScore > 100) {
      throw new AppError('Final score must be between 0 and 100', 400, 'INVALID_SCORE');
    }
    
    const preThesis = await this.preThesisRepository.findById(id);
    if (!preThesis) {
      throw new AppError('Pre-thesis not found', 404, 'PRETHESIS_NOT_FOUND');
    }
    
    // Update score and mark as completed if score is passing
    const updatedPreThesis = await this.preThesisRepository.update(id, { 
      finalScore,
      feedback,
      status: 'completed'
    });

    const student = await this.studentRepository.findById(preThesis.studentId);
    
    await this.notificationService.createNotification({
      userId: Number(student?.userId),
      type: 'PRE_THESIS_GRADED',
      title: 'Pre-Thesis Graded',
      content: `Your pre-thesis has been graded with a final score of ${finalScore}.`
    });
    
    return updatedPreThesis;
  }

  async countPreThesisByTopicApplicationIds(topicApplicationIds: number[]): Promise<number> {
    return this.preThesisRepository.countPreThesisByTopicApplicationIds(topicApplicationIds);
  }

  // Statistics and reports
  async getCompletedPreTheses(semesterId?: number, minimumScore: number = 5.0): Promise<PreThesis[]> {
    return this.preThesisRepository.findCompletedWithPassingScore(minimumScore, semesterId);
  }

  async getPreThesisCountByStatus(semesterId: number): Promise<Record<string, number>> {
    const allPreTheses = await this.preThesisRepository.findBySemester(semesterId);
    
    return {
      total: allPreTheses.length,
      in_progress: allPreTheses.filter(pt => pt.status === 'in_progress').length,
      completed: allPreTheses.filter(pt => pt.status === 'completed').length
    };
  }

  async getApplicationStatsBySemester(semesterId: number) {
    return this.topicApplicationRepository.getSemesterApplicationStats(semesterId);
  }

  async generatePreThesisReport(data: PreThesisReportData): Promise<Buffer> {
    try {
      // Render the template with the provided data
      const templatePath = path.resolve(__dirname, '../views/pre-thesis-report.ejs');
      const html = await ejs.renderFile(templatePath, {
        report: data,
        formatDate: (date: Date): string => {
          return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
      });

      // Launch Puppeteer and create a new page
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set the HTML content of the page
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      // Generate PDF in A4 format
      const pdfData = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      // Close the browser
      await browser.close();

      return Buffer.from(pdfData);
    } catch (error) {
      console.error('Error in PDF generation service:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getOutcomeStats() {
    // Get 4 most recent semesters
    const semesters = await this.semesterRepository.findAll({}, 0, 4, [['startDate', 'DESC']]);
    const semesterIds = semesters.map(s => s.id);

    const preTheses = await this.preThesisRepository.findAll(
      {
        semesterId: { [Op.in]: semesterIds }
      },
      0,
      undefined,
      undefined,
      {
        include: [
          {
            model: Semester,
            as: 'semester',
            attributes: ['id', 'name', 'startDate']
          }
        ]
      }
    );

    // Group by semester
    const semesterMap = new Map<number, {
      semesterName: string;
      startDate: Date;
      passed: number;
      failed: number;
      inProgress: number;
    }>();

    preTheses.forEach((preThesis: any) => {
      const semesterId = preThesis.semesterId;
      const semesterName = preThesis.semester?.name || `Semester ${semesterId}`;
      const startDate = preThesis.semester?.startDate || new Date();

      if (!semesterMap.has(semesterId)) {
        semesterMap.set(semesterId, {
          semesterName,
          startDate,
          passed: 0,
          failed: 0,
          inProgress: 0
        });
      }

      const stats = semesterMap.get(semesterId)!;

      if (preThesis.status === 'in_progress') {
        stats.inProgress++;
      } else if (preThesis.status === 'completed') {
        if (preThesis.finalScore !== null && preThesis.finalScore >= 5.0) {
          stats.passed++;
        } else if (preThesis.finalScore !== null && preThesis.finalScore < 5.0) {
          stats.failed++;
        }
      }
    });

    // Convert map to array and sort by start date (oldest to newest)
    return Array.from(semesterMap.values())
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .map(({ semesterName, passed, failed, inProgress }) => ({
        semester: semesterName,
        passed,
        failed,
        in_progress: inProgress
      }));
  }

  async getGradeDistribution() {
    // Get 4 most recent semesters
    const semesters = await this.semesterRepository.findAll({}, 0, 4, [['startDate', 'DESC']]);
    const semesterIds = semesters.map(s => s.id);

    const preTheses = await this.preThesisRepository.findAll(
      {
        finalScore: { [Op.ne]: null },
        semesterId: { [Op.in]: semesterIds }
      },
      0,
      undefined,
      undefined,
      {
        include: [
          {
            model: Semester,
            as: 'semester',
            attributes: ['id', 'name', 'startDate']
          }
        ]
      }
    );

    // Group by semester
    const semesterMap = new Map<number, {
      semesterName: string;
      startDate: Date;
      excellent: number;
      good: number;
      average: number;
      fail: number;
    }>();

    preTheses.forEach((preThesis: any) => {
      const semesterId = preThesis.semesterId;
      const semesterName = preThesis.semester?.name || `Semester ${semesterId}`;
      const startDate = preThesis.semester?.startDate || new Date();
      const score = Number(preThesis.finalScore);

      if (!semesterMap.has(semesterId)) {
        semesterMap.set(semesterId, {
          semesterName,
          startDate,
          excellent: 0,
          good: 0,
          average: 0,
          fail: 0
        });
      }

      const stats = semesterMap.get(semesterId)!;

      if (score >= 9.0) {
        stats.excellent++;
      } else if (score >= 7.0) {
        stats.good++;
      } else if (score >= 5.0) {
        stats.average++;
      } else {
        stats.fail++;
      }
    });

    // Convert map to array and sort by start date (oldest to newest)
    return Array.from(semesterMap.values())
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .map(({ semesterName, excellent, good, average, fail }) => ({
        semester: semesterName,
        excellent,
        good,
        average,
        fail
      }));
  }
}