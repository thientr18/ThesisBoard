import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class Submission extends Model<InferAttributes<Submission>, InferCreationAttributes<Submission>> {
  declare id: CreationOptional<number>;
  declare entityType: 'pre_thesis_project' | 'thesis';
  declare entityId: number;
  declare title: string | null;
  declare description: string | null;
  declare fileUrl: string;
  declare uploadedByUserId: number;
}

Submission.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    entityType: { type: DataTypes.ENUM('pre_thesis_project', 'thesis'), allowNull: false, field: 'entity_type' },
    entityId: { type: DataTypes.BIGINT, allowNull: false, field: 'entity_id' },
    title: { type: DataTypes.STRING(255), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    fileUrl: { type: DataTypes.STRING(1024), allowNull: false, field: 'file_url' },
    uploadedByUserId: { type: DataTypes.BIGINT, allowNull: false, field: 'uploaded_by_user_id' },
  },
  { sequelize, tableName: 'submissions', modelName: 'Submission', underscored: true, timestamps: true }
);