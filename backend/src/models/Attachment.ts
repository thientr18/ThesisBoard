import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class Attachment extends Model<InferAttributes<Attachment>, InferCreationAttributes<Attachment>> {
  declare id: CreationOptional<number>;
  declare entityType: 'topic' | 'prethesis_submission' | 'thesis_submission' | 'announcement' | 'topic_application' | 'thesis_proposal' | 'system' | 'other';
  declare entityId: number;
  declare fileUrl: string;
  declare fileName: string | null;
  declare mimeType: string | null;
  declare uploadedByUserId: number;
}

Attachment.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    entityType: {
      type: DataTypes.ENUM('topic', 'prethesis_submission', 'thesis_submission', 'announcement', 'topic_application', 'thesis_proposal', 'system', 'other'),
      allowNull: false,
      field: 'entity_type',
    },
    entityId: { type: DataTypes.BIGINT, allowNull: false, field: 'entity_id' },
    fileUrl: { type: DataTypes.STRING(1024), allowNull: false, field: 'file_url' },
    fileName: { type: DataTypes.STRING(255), allowNull: true, field: 'file_name' },
    mimeType: { type: DataTypes.STRING(128), allowNull: true, field: 'mime_type' },
    uploadedByUserId: { type: DataTypes.BIGINT, allowNull: false, field: 'uploaded_by_user_id' },
  },
  { sequelize,tableName: 'attachments',modelName: 'Attachment',underscored: true,timestamps: true,paranoid: true }
);