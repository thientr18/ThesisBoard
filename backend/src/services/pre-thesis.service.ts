import { Transaction } from 'sequelize';
import { sequelize } from '../models/db';
import { PreThesis } from '../models/PreThesis';
import { Topic } from '../models/Topic';
import { TopicApplication } from '../models/TopicApplication';
import { AppError } from '../utils/AppError';

import { PreThesisRepository } from '../repositories/pre-thesis-repository';
import { TopicApplicationRepository } from '../repositories/topic-application-repository';
import { TopicRepository } from '../repositories/topic-repository';
import { SemesterRepository } from '../repositories/semester-repository';

export class PreThesisService {
  private preThesisRepository: PreThesisRepository;
  private topicApplicationRepository: TopicApplicationRepository;
  private topicRepository: TopicRepository;

  constructor() {
    this.preThesisRepository = new PreThesisRepository();
    this.topicApplicationRepository = new TopicApplicationRepository();
    this.topicRepository = new TopicRepository();
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

  async getTeacherTopics(teacherId: number, semesterId?: number): Promise<Topic[]> {
    return this.topicRepository.findByTeacherId(teacherId, semesterId);
  }

  async searchTopics(query: string, semesterId?: number): Promise<Topic[]> {
    return this.topicRepository.searchTopics(query, semesterId);
  }

  async getTopicsByTag(tag: string, semesterId?: number): Promise<Topic[]> {
    return this.topicRepository.findByTag(tag, semesterId);
  }

  // Application-related methods
  async applyToTopic(
    topicId: number, 
    studentId: number, 
    data?: { proposalTitle?: string, proposalAbstract?: string }
  ): Promise<TopicApplication> {
    const topic = await this.topicRepository.findById(topicId);
    if (!topic) throw new AppError('Topic not found', 404, 'TOPIC_NOT_FOUND');
    if (topic.status === 'closed') throw new AppError('Topic is closed for applications', 400, 'TOPIC_CLOSED');

    // Check if the student already has an application for this topic
    const existingApplication = await this.topicApplicationRepository.findByStudentAndTopic(
      studentId, 
      topicId
    );
    
    if (existingApplication && existingApplication.status !== 'cancelled') {
      throw new AppError('Student already applied to this topic', 400, 'STUDENT_ALREADY_APPLIED');
    }
    
    // Check if student already has an accepted application
    const acceptedApplications = await this.topicApplicationRepository.findByStudentId(studentId);
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
    return this.topicApplicationRepository.create({
      topicId,
      studentId,
      status: 'pending',
      proposalTitle: data?.proposalTitle || null,
      proposalAbstract: data?.proposalAbstract || null
    });
  }

  async getApplicationsByStudent(studentId: number, semesterId?: number): Promise<TopicApplication[]> {
    return this.topicApplicationRepository.findByStudentId(studentId, semesterId);
  }

  async getApplicationsByTopic(topicId: number): Promise<TopicApplication[]> {
    return this.topicApplicationRepository.findByTopicId(topicId);
  }

  async getApplicationById(id: number): Promise<TopicApplication | null> {
    return this.topicApplicationRepository.findById(id);
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
        const existingPreThesis = await this.preThesisRepository.findByStudent(application.studentId);
        if (existingPreThesis.length > 0) {
          await transaction.rollback();
          throw new AppError('Student already has a pre-thesis for this semester', 400, 'STUDENT_ALREADY_PRETHESIS');
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

    return this.preThesisRepository.create({
      studentId,
      semesterId,
      supervisorTeacherId,
      topicApplicationId: topicApplicationId || null,
      status: 'in_progress',
      finalScore: null
    });
  }

  async updatePreThesisStatus(id: number, status: 'in_progress' | 'completed' | 'cancelled'): Promise<PreThesis | null> {
    return this.preThesisRepository.updateStatus(id, status);
  }

  async gradePreThesis(id: number, finalScore: number): Promise<PreThesis | null> {
    if (finalScore < 0 || finalScore > 10) {
      throw new AppError('Final score must be between 0 and 10', 400, 'INVALID_SCORE');
    }
    
    const preThesis = await this.preThesisRepository.findById(id);
    if (!preThesis) {
      throw new AppError('Pre-thesis not found', 404, 'PRETHESIS_NOT_FOUND');
    }
    
    // Update score and mark as completed if score is passing
    const updatedPreThesis = await this.preThesisRepository.update(id, { 
      finalScore,
      status: finalScore >= 5 ? 'completed' : 'in_progress'
    });
    
    return updatedPreThesis;
  }

  async cancelPreThesis(id: number): Promise<PreThesis | null> {
    return this.preThesisRepository.updateStatus(id, 'cancelled');
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
      completed: allPreTheses.filter(pt => pt.status === 'completed').length,
      cancelled: allPreTheses.filter(pt => pt.status === 'cancelled').length
    };
  }

  async getApplicationStatsBySemester(semesterId: number) {
    return this.topicApplicationRepository.getSemesterApplicationStats(semesterId);
  }
}