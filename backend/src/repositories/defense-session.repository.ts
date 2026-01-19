import { Op } from 'sequelize';
import { DefenseSession } from '../models/DefenseSession';
import { GenericRepository } from './generic.repository';

export class DefenseSessionRepository extends GenericRepository<DefenseSession, number> {
  constructor() {
    super(DefenseSession);
  }

  async findByThesisId(thesisId: number): Promise<DefenseSession | null> {
    return DefenseSession.findOne({
      where: { thesisId }
    });
  }

  async findUpcoming(): Promise<DefenseSession[]> {
    return DefenseSession.findAll({
      where: {
        scheduledAt: {
          [Op.gt]: new Date()
        },
        status: 'scheduled'
      },
      order: [['scheduledAt', 'ASC']]
    });
  }

  async findUpcomingByRoom(room: string): Promise<DefenseSession[]> {
    return DefenseSession.findAll({
      where: {
        scheduledAt: {
          [Op.gt]: new Date()
        },
        room,
        status: 'scheduled'
      },
      order: [['scheduledAt', 'ASC']]
    });
  }

  async findByStatus(status: 'scheduled' | 'completed' | 'cancelled'): Promise<DefenseSession[]> {
    return DefenseSession.findAll({
      where: { status },
      order: [['scheduledAt', 'ASC']]
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<DefenseSession[]> {
    return DefenseSession.findAll({
      where: {
        scheduledAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['scheduledAt', 'ASC']]
    });
  }

  async findByRoom(room: string): Promise<DefenseSession[]> {
    return DefenseSession.findAll({
      where: { room },
      order: [['scheduledAt', 'ASC']]
    });
  }

  async reschedule(id: number, scheduledAt: Date, room?: string): Promise<DefenseSession | null> {
    const session = await DefenseSession.findByPk(id);
    
    if (!session) {
      return null;
    }
    
    session.scheduledAt = scheduledAt;
    session.startTime = scheduledAt;
    
    if (room !== undefined) {
      session.room = room;
    }
    
    await session.save();
    return session;
  }

  async update(id: number, data: Partial<DefenseSession>): Promise<DefenseSession | null> {
    const session = await DefenseSession.findByPk(id);
    
    if (!session) {
      return null;
    }
    
    Object.keys(data).forEach(key => {
      if (data[key as keyof DefenseSession] !== undefined) {
        (session as any)[key] = data[key as keyof DefenseSession];
      }
    });
    
    await session.save();
    return session;
  }

  async updateStatus(id: number, status: 'scheduled' | 'completed' | 'cancelled'): Promise<DefenseSession | null> {
    const session = await this.findById(id);
    if (!session) return null;
    
    return session.update({ status });
  }
}