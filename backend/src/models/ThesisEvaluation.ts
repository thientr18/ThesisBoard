import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class ThesisEvaluation extends Model<InferAttributes<ThesisEvaluation>, InferCreationAttributes<ThesisEvaluation>> {
  declare id: CreationOptional<number>;
  declare thesisId: number;
  declare evaluatorTeacherId: number;
  declare role: 'supervisor' | 'reviewer' | 'committee';
  declare score: number;
  declare comments: string | null;
}

ThesisEvaluation.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    thesisId: { type: DataTypes.BIGINT, allowNull: false, field: 'thesis_id' },
    evaluatorTeacherId: { type: DataTypes.BIGINT, allowNull: false, field: 'evaluator_teacher_id' },
    role: { type: DataTypes.ENUM('supervisor', 'reviewer', 'committee'), allowNull: false },
    score: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    comments: { type: DataTypes.TEXT, allowNull: true },
  },
  { 
    sequelize,
    tableName: 'thesis_evaluations',
    modelName: 'ThesisEvaluation',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [{ 
      unique: true,
      fields: ['thesis_id', 'evaluator_teacher_id', 'role'],
      name: 'uniq_evaluation_per_thesis_per_evaluator_per_role'
    }],
  }
);