import { GenericRepository } from './GenericRepository';
import { ThesisEvaluation } from '../models/ThesisEvaluation';
import { Op } from 'sequelize';

export class ThesisEvaluationRepository extends GenericRepository<ThesisEvaluation, number> {
  constructor() {
    super(ThesisEvaluation);
  }

  async findByThesisId(thesisId: number): Promise<ThesisEvaluation[]> {
    return this.findAll({ thesisId });
  }

  async findByEvaluatorId(evaluatorTeacherId: number): Promise<ThesisEvaluation[]> {
    return this.findAll({ evaluatorTeacherId });
  }

  async getAverageScoreByThesisId(thesisId: number): Promise<number | null> {
    const evaluations = await this.findByThesisId(thesisId);
    if (evaluations.length === 0) return null;
    
    const totalScore = evaluations.reduce((sum, evaluation) => sum + Number(evaluation.score), 0);
    return parseFloat((totalScore / evaluations.length).toFixed(2));
  }

  async countEvaluatorsByThesisId(thesisId: number): Promise<number> {
    const evaluations = await this.findByThesisId(thesisId);
    return evaluations.length;
  }
  
  async isThesisFullyEvaluated(
    thesisId: number, 
    requiredRoles: (ThesisEvaluation['role'])[]
  ): Promise<boolean> {
    const evaluations = await this.findByThesisId(thesisId);
    const evaluatedRoles = new Set(evaluations.map(e => e.role));
    
    return requiredRoles.every(role => evaluatedRoles.has(role));
  }
}