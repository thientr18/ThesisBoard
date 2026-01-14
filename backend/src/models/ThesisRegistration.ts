import { Op, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';
import { AppError } from '../utils/AppError';

export class ThesisRegistration extends Model<InferAttributes<ThesisRegistration>, InferCreationAttributes<ThesisRegistration>> {
  declare id: CreationOptional<number>;
  declare studentId: number;
  declare supervisorTeacherId: number;
  declare semesterId: number;
  declare title: string | null;
  declare abstract: string | null;
  declare status: 'pending_approval' | 'cancelled' | 'approved' | 'rejected';
  declare decisionReason: string | null;
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
    status: { type: DataTypes.ENUM('pending_approval', 'cancelled', 'approved', 'rejected'), defaultValue: 'pending_approval' },
    decisionReason: { type: DataTypes.TEXT, allowNull: true, field: 'decision_reason' },
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
    hooks: {
      beforeCreate: async (registration: ThesisRegistration) => {
        const existingApproved = await ThesisRegistration.findOne({
          where: {
            studentId: registration.studentId,
            semesterId: registration.semesterId,
            status: 'approved'
          }
        });

        if (existingApproved) {
          throw new AppError('Student already has an approved thesis registration for this semester', 400, 'DUPLICATE_APPROVED_REGISTRATION', true);
        }
      },
      afterUpdate: async (registration: ThesisRegistration) => {
        if (registration.status === 'approved') {
          await ThesisRegistration.update(
            { 
              status: 'cancelled',
              decisionReason: 'Another registration was approved',
              decidedAt: new Date()
            },
            { 
              where: {
                studentId: registration.studentId,
                semesterId: registration.semesterId,
                status: 'pending_approval',
                id: { [Op.ne]: registration.id }
              }
            }
          );
        }
      }
    }
  }
);