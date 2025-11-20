import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class Student extends Model<InferAttributes<Student>, InferCreationAttributes<Student>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare studentIdCode: string;
  declare cohortYear: number | null;
  declare className: string | null;
  declare phone: string | null;
  declare dob: Date | null;
  declare gender: 'male' | 'female' | 'other' | null;
  declare status: 'active' | 'inactive' | 'graduated';
}

Student.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.BIGINT, allowNull: false, unique: true, field: 'user_id' },
    studentIdCode: { type: DataTypes.STRING(32), allowNull: false, unique: true, field: 'student_id' },
    cohortYear: { type: DataTypes.INTEGER, allowNull: true, field: 'cohort_year' },
    className: { type: DataTypes.STRING(64), allowNull: true, field: 'class_name' },
    phone: { type: DataTypes.STRING(32), allowNull: true },
    dob: { type: DataTypes.DATEONLY, allowNull: true },
    gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
    status: { type: DataTypes.ENUM('active', 'inactive', 'graduated'), defaultValue: 'active' },
  },
  { sequelize, tableName: 'students', modelName: 'Student', underscored: true, timestamps: true, paranoid: true }
);