import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class StudentSemester extends Model<InferAttributes<StudentSemester>, InferCreationAttributes<StudentSemester>> {
  declare id: CreationOptional<number>;
  declare studentId: number;
  declare semesterId: number;
  declare gpa: number | null;
  declare totalCredits: number | null;
  declare status: 'enrolled' | 'suspended' | 'completed';
}

StudentSemester.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.BIGINT, allowNull: false, field: 'student_id' },
    semesterId: { type: DataTypes.BIGINT, allowNull: false, field: 'semester_id' },
    gpa: { type: DataTypes.DECIMAL(3, 2), allowNull: true },
    totalCredits: { type: DataTypes.INTEGER, allowNull: true, field: 'total_credits' },
    status: { type: DataTypes.ENUM('enrolled', 'suspended', 'completed'), defaultValue: 'enrolled' },
  },
  {
    sequelize,
    tableName: 'student_semesters',
    modelName: 'StudentSemester',
    underscored: true,
    timestamps: true,
    indexes: [{
      unique: true,
      fields: ['student_id', 'semester_id'],
      name: 'uniq_student_semester_per_student_per_semester'
    }],
  }
);