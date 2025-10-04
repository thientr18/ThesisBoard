import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class ThesisFinalGrade extends Model<InferAttributes<ThesisFinalGrade>, InferCreationAttributes<ThesisFinalGrade>> {
  declare id: CreationOptional<number>;
  declare thesisId: number;
  declare finalScore: number;
  declare computedAt: CreationOptional<Date>;
}

ThesisFinalGrade.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    thesisId: { type: DataTypes.BIGINT, allowNull: false, unique: true, field: 'thesis_id' },
    finalScore: { type: DataTypes.DECIMAL(5, 2), allowNull: false, field: 'final_score' },
    computedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'computed_at' },
  },
  { sequelize, tableName: 'thesis_final_grades', modelName: 'ThesisFinalGrade', underscored: true, timestamps: true, paranoid: true }
);