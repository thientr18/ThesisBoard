import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class StudentSemester extends Model<InferAttributes<StudentSemester>, InferCreationAttributes<StudentSemester>> {
  declare id: CreationOptional<number>;
  declare studentId: number;
  declare semesterId: number;
  declare gpa: number | null; // minimum 0.00, maximum 4.00
  declare credits: number | null; // minimum 0
  declare type: 'pre-thesis' | 'thesis' | 'not-registered';
  declare status: 'enrolled' | 'suspended' | 'completed';
}

StudentSemester.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.BIGINT, allowNull: false, field: 'student_id' },
    semesterId: { type: DataTypes.BIGINT, allowNull: false, field: 'semester_id' },
    gpa: { type: DataTypes.DECIMAL(3, 2), allowNull: true, validate: { min: 0.0, max: 4.0 }, field: 'gpa' },
    credits: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 0 }, field: 'credits' },
    type: { type: DataTypes.ENUM('thesis', 'pre-thesis', 'not-registered'), allowNull: false },
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