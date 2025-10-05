import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class ThesisAssignment extends Model<InferAttributes<ThesisAssignment>, InferCreationAttributes<ThesisAssignment>> {
  declare id: CreationOptional<number>;
  declare thesisId: number;
  declare teacherId: number;
  declare role: 'reviewer' | 'committee_member' | 'chair' | 'secretary' | 'member';
  declare assignedByUserId: number;
  declare assignedAt: CreationOptional<Date>;
}

ThesisAssignment.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    thesisId: { type: DataTypes.BIGINT, allowNull: false, field: 'thesis_id' },
    teacherId: { type: DataTypes.BIGINT, allowNull: false, field: 'teacher_id' },
    role: { type: DataTypes.ENUM('reviewer', 'committee_member', 'chair', 'secretary', 'member'), allowNull: false },
    assignedByUserId: { type: DataTypes.BIGINT, allowNull: false, field: 'assigned_by_user_id' },
    assignedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'assigned_at' },
  },
  {
    sequelize,
    tableName: 'thesis_assignments',
    modelName: 'ThesisAssignment',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [{
      unique: true,
      fields: ['thesis_id', 'teacher_id', 'role'],
      name: 'uniq_thesis_assignment_per_teacher_per_role'
    }],
  }
);