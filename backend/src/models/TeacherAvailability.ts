import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class TeacherAvailability extends Model<InferAttributes<TeacherAvailability>, InferCreationAttributes<TeacherAvailability>> {
  declare id: CreationOptional<number>;
  declare teacherId: number;
  declare semesterId: number;
  declare maxSupervisees: number;
  declare maxReviewers: number;
  declare contactEmail: string | null;
  declare contactPhone: string | null;
  declare isOpen: boolean;
  declare note: string | null;
}

TeacherAvailability.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    teacherId: { type: DataTypes.BIGINT, allowNull: false, field: 'teacher_id' },
    semesterId: { type: DataTypes.BIGINT, allowNull: false, field: 'semester_id' },
    maxSupervisees: { type: DataTypes.INTEGER, defaultValue: 0, field: 'max_supervisees' },
    maxReviewers: { type: DataTypes.INTEGER, defaultValue: 0, field: 'max_reviewers' },
    contactEmail: { type: DataTypes.STRING(255), allowNull: true, field: 'contact_email' },
    contactPhone: { type: DataTypes.STRING(32), allowNull: true, field: 'contact_phone' },
    isOpen: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_open' },
    note: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    sequelize,
    tableName: 'teacher_availability',
    modelName: 'TeacherAvailability',
    underscored: true,
    timestamps: true,
    indexes: [{
      unique: true,
      fields: ['teacher_id', 'semester_id'],
      name: 'uniq_teacher_availability_per_teacher_per_semester'
    }],
  }
);