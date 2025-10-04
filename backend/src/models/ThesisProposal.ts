import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, Op } from 'sequelize';
import { sequelize } from './db';

export class ThesisProposal extends Model<InferAttributes<ThesisProposal>, InferCreationAttributes<ThesisProposal>> {
  declare id: CreationOptional<number>;
  declare studentId: number;
  declare targetTeacherId: number;
  declare semesterId: number;
  declare title: string;
  declare abstract: string | null;
  declare fileUrl: string | null;
  declare status: 'submitted' | 'accepted' | 'rejected' | 'cancelled';
  declare note: string | null;
  declare decidedAt: Date | null;
}

ThesisProposal.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.BIGINT, allowNull: false, field: 'student_id' },
    targetTeacherId: { type: DataTypes.BIGINT, allowNull: false, field: 'target_teacher_id' },
    semesterId: { type: DataTypes.BIGINT, allowNull: false, field: 'semester_id' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    abstract: { type: DataTypes.TEXT, allowNull: true },
    fileUrl: { type: DataTypes.STRING(1024), allowNull: true, field: 'file_url' },
    status: { type: DataTypes.ENUM('submitted', 'accepted', 'rejected', 'cancelled'), defaultValue: 'submitted' },
    note: { type: DataTypes.STRING(255), allowNull: true },
    decidedAt: { type: DataTypes.DATE, allowNull: true, field: 'decided_at' },
  },
  {
    sequelize,
    tableName: 'thesis_proposals',
    modelName: 'ThesisProposal',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      // One active "submitted" proposal per student per semester (soft constraint)
      { unique: false, fields: ['student_id', 'semester_id', 'status'], name: 'idx_thesis_proposal_student_semester_status' },
    ],
    hooks: {
      async beforeCreate(p, options) {
        if (p.status === 'accepted') {
          const existing = await ThesisProposal.findOne({
            where: { studentId: p.studentId, semesterId: p.semesterId, status: 'accepted' },
            transaction: options.transaction,
          });
          if (existing) throw new Error('Student already has an accepted thesis proposal this semester.');
        }
      },
      async beforeUpdate(p, options) {
        const prev = p.previous('status');
        if (prev === 'rejected' && p.status === 'accepted') {
          throw new Error('Cannot accept after rejected');
        }
        if (p.changed('status') && p.status === 'accepted') {
          const existing = await ThesisProposal.findOne({
            where: { studentId: p.studentId, semesterId: p.semesterId, status: 'accepted', id: { [Op.ne]: p.id } },
            transaction: options.transaction,
          });
          if (existing) throw new Error('Student already has an accepted thesis proposal this semester.');
        }
        if (p.changed('status') && (p.status === 'accepted' || p.status === 'rejected')) {
          p.decidedAt = new Date();
        }
      },
    },
  }
);

export default ThesisProposal;