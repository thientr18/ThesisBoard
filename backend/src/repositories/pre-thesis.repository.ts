import { Op } from 'sequelize';
import { PreThesis } from '../models/PreThesis';
import { GenericRepository } from './generic.repository';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { Semester } from '../models/Semester';
import User from '../models/User';
import { TopicApplication } from '../models/TopicApplication';
import { Topic } from '../models/Topic';

export class PreThesisRepository extends GenericRepository<PreThesis, number> {
  constructor() {
    super(PreThesis);
  }

  async findByStudentAndSemester(studentId: number, semesterId: number): Promise<PreThesis | null> {
    return this.model.findOne({
      where: {
        studentId,
        semesterId
      },
      include: [
        {
          model: Teacher,
          as: 'supervisorTeacher',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user' }]
        },
        { model: Semester, as: 'semester' },
        {
          model: TopicApplication,
          as: 'topicApplication',
          include: [
            {
              model: Topic,
              as: 'topic'
            }
          ]
        }
      ]
    });
  }

  async findBySupervisor(supervisorTeacherId: number, semesterId?: number): Promise<PreThesis[]> {
    return this.model.findAll({
      where: {
        supervisorTeacherId,
        ...(semesterId && { semesterId })
      },
      include: [
        {
          model: Teacher,
          as: 'supervisorTeacher',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user' }]
        },
        { model: Semester, as: 'semester' },
        {
          model: TopicApplication,
          as: 'topicApplication',
          include: [
            {
              model: Topic,
              as: 'topic'
            }
          ]
        }
      ]
    });
  }

  async findByStatus(status: PreThesis['status'], semesterId?: number): Promise<PreThesis[]> {
    return this.model.findAll({
      where: {
        status,
        ...(semesterId && { semesterId })
      },
      include: [
        {
          model: Teacher,
          as: 'supervisorTeacher',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user' }]
        },
        { model: Semester, as: 'semester' },
        {
          model: TopicApplication,
          as: 'topicApplication',
          include: [
            {
              model: Topic,
              as: 'topic'
            }
          ]
        }
      ]
    });
  }

  async findByTopicApplication(topicApplicationId: number): Promise<PreThesis | null> {
    return this.model.findOne({
      where: { topicApplicationId },
      include: [
        {
          model: Teacher,
          as: 'supervisorTeacher',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user' }]
        },
        { model: Semester, as: 'semester' },
        {
          model: TopicApplication,
          as: 'topicApplication',
          include: [
            {
              model: Topic,
              as: 'topic'
            }
          ]
        }
      ]
    });
  }

  async findByStudent(studentId: number, semesterId?: number): Promise<PreThesis[]> {
    return this.model.findAll({
      where: {
        studentId,
        ...(semesterId && { semesterId }),
      },
      include: [
        {
          model: Teacher,
          as: 'supervisorTeacher',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user' }]
        },
        { model: Semester, as: 'semester' },
        {
          model: TopicApplication,
          as: 'topicApplication',
          include: [
            {
              model: Topic,
              as: 'topic'
            }
          ]
        }
      ]
    });
  }

  async findBySemester(semesterId: number): Promise<PreThesis[]> {
    return this.model.findAll({
      where: {
        semesterId
      },
      include: [
        {
          model: Teacher,
          as: 'supervisorTeacher',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user' }]
        },
        { model: Semester, as: 'semester' },
        {
          model: TopicApplication,
          as: 'topicApplication',
          include: [
            {
              model: Topic,
              as: 'topic'
            }
          ]
        }
      ]
    });
  }

  async updateStatus(id: number, status: PreThesis['status']): Promise<PreThesis | null> {
    return this.update(id, { status });
  }

  async updateFinalScore(id: number, finalScore: number): Promise<PreThesis | null> {
    return this.update(id, { finalScore });
  }

  async findCompletedWithPassingScore(minimumScore: number = 5.0, semesterId?: number): Promise<PreThesis[]> {
    return this.model.findAll({
      where: {
        status: 'completed',
        finalScore: {
          [Op.gte]: minimumScore
        },
        ...(semesterId && { semesterId })
      },
      include: [
        {
          model: Teacher,
          as: 'supervisorTeacher',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user' }]
        },
        { model: Semester, as: 'semester' },
        {
          model: TopicApplication,
          as: 'topicApplication',
          include: [
            {
              model: Topic,
              as: 'topic'
            }
          ]
        }
      ]
    });
  }

  async countPreThesisByTopicApplicationIds(topicApplicationIds: number[]): Promise<number> {
    return this.model.count({
      where: {
        topicApplicationId: topicApplicationIds
      }
    });
  }
}