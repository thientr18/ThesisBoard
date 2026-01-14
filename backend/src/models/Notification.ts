import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class Notification extends Model<InferAttributes<Notification>, InferCreationAttributes<Notification>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare type: string | null;
  declare title: string | null;
  declare content: string | null;
  declare entityType: 'topic' | 'prethesis_submission' | 'thesis_submission' | 'announcement' | 'topic_application' | 'thesis_proposal' | 'system' | 'other' | null;
  declare entityId: number | null;
  declare isRead: boolean;
}

Notification.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.BIGINT, allowNull: false, field: 'user_id' },
    type: { type: DataTypes.STRING(64), allowNull: true },
    title: { type: DataTypes.STRING(255), allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: true },
    entityType: { 
      type: DataTypes.ENUM('topic', 'prethesis_submission', 'thesis_submission', 'announcement', 'topic_application', 'thesis_proposal', 'system', 'other'), 
      allowNull: true, 
      field: 'entity_type' },
    entityId: { type: DataTypes.BIGINT, allowNull: true, field: 'entity_id' },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_read' },
  },
  { sequelize, tableName: 'notifications', modelName: 'Notification', underscored: true, timestamps: true }
);