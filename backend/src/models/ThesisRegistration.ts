import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class ThesisRegistration extends Model<InferAttributes<ThesisRegistration>, InferCreationAttributes<ThesisRegistration>> {
  declare id: CreationOptional<number>;
  declare studentId: number;
  declare supervisorTeacherId: number;
  declare semesterId: number;
  declare title: string | null;
  declare abstract: string | null;
  declare status: 'submitted' | 'pending_approval' | 'cancelled' | 'approved' | 'rejected';
  declare submittedByTeacherId: number;
  declare approvedByUserId: number | null;
  declare submittedAt: CreationOptional<Date>;
  declare decidedAt: Date | null;
}

ThesisRegistration.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.BIGINT, allowNull: false, field: 'student_id' },
    supervisorTeacherId: { type: DataTypes.BIGINT, allowNull: false, field: 'supervisor_teacher_id' },
    semesterId: { type: DataTypes.BIGINT, allowNull: false, field: 'semester_id' },
    title: { type: DataTypes.STRING(255), allowNull: true },
    abstract: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('submitted', 'pending_approval', 'cancelled', 'approved', 'rejected'), defaultValue: 'submitted' },
    submittedByTeacherId: { type: DataTypes.BIGINT, allowNull: false, field: 'submitted_by_teacher_id' },
    approvedByUserId: { type: DataTypes.BIGINT, allowNull: true, field: 'approved_by_user_id' },
    submittedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'submitted_at' },
    decidedAt: { type: DataTypes.DATE, allowNull: true, field: 'decided_at' },
  },
  {
    sequelize,
    tableName: 'thesis_registrations',
    modelName: 'ThesisRegistration',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [{
      unique: true,
      fields: ['student_id', 'semester_id'],
      name: 'uniq_thesis_registration_per_student_per_semester'
    }],
  }
);