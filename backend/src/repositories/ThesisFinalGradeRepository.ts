import { Op } from 'sequelize';
import { ThesisFinalGrade } from '../models/ThesisFinalGrade';
import { GenericRepository } from './GenericRepository';

export class ThesisFinalGradeRepository extends GenericRepository<ThesisFinalGrade, number> {
  constructor() {
    super(ThesisFinalGrade);
  }

  async findByThesisId(thesisId: number): Promise<ThesisFinalGrade | null> {
    return ThesisFinalGrade.findOne({
      where: { thesisId }
    });
  }

  async findByScoreRange(minScore: number, maxScore: number): Promise<ThesisFinalGrade[]> {
    return ThesisFinalGrade.findAll({
      where: {
        finalScore: {
          [Op.between]: [minScore, maxScore]
        }
      }
    });
  }

  async calculateAverageScore(): Promise<number | null> {
    const result = await ThesisFinalGrade.findOne({
      attributes: [
        [this.model.sequelize!.fn('AVG', this.model.sequelize!.col('final_score')), 'averageScore']
      ],
      raw: true
    }) as unknown as { averageScore: number | null };
    
    return result.averageScore;
  }

  async createOrUpdate(data: Pick<ThesisFinalGrade, 'thesisId' | 'finalScore'>): Promise<ThesisFinalGrade> {
    const [grade, created] = await ThesisFinalGrade.findOrCreate({
      where: { thesisId: data.thesisId },
      defaults: {
        thesisId: data.thesisId,
        finalScore: data.finalScore,
        computedAt: new Date()
      }
    });

    if (!created) {
      // Update the existing record
      await grade.update({
        finalScore: data.finalScore,
        computedAt: new Date()
      });
    }

    return grade;
  }

  async findAboveThreshold(threshold: number): Promise<ThesisFinalGrade[]> {
    return ThesisFinalGrade.findAll({
      where: {
        finalScore: {
          [Op.gte]: threshold
        }
      },
      order: [['finalScore', 'DESC']]
    });
  }
}