import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { AppError } from '../utils/AppError';

export class Announcement extends Model<InferAttributes<Announcement>, InferCreationAttributes<Announcement>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare content: string;
  declare audience: 'all' | 'students' | 'teachers';
  declare audienceFilter: object | null;
  declare publishedByUserId: number;
  declare publishedAt: CreationOptional<Date>;
  declare visibleUntil: Date | null;
}

Announcement.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false, validate: { len: [1, 255] } },
    content: { type: DataTypes.TEXT, allowNull: false, 
      validate: { 
        maxLen(value: string) {
          if (value && value.length > 20000) throw new AppError('content too long');
        }
      }
    },
    audience: {
      type: DataTypes.ENUM('all', 'students', 'teachers'),
      defaultValue: 'all',
      allowNull: false,
      validate: { isIn: [['all', 'students', 'teachers']] }
    },
    audienceFilter: { type: DataTypes.JSON, allowNull: true, field: 'audience_filter' },
    publishedByUserId: { type: DataTypes.BIGINT, allowNull: false, field: 'published_by_user_id' },
    publishedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'published_at' },
    visibleUntil: { type: DataTypes.DATE, allowNull: true, field: 'visible_until' },
  },
  { 
    sequelize,
    tableName: 'announcements',
    modelName: 'Announcement',
    underscored: true,
    timestamps: true,
    paranoid: true
  }
);