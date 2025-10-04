import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class Teacher extends Model<InferAttributes<Teacher>, InferCreationAttributes<Teacher>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare teacherCode: string | null;
  declare title: string | null;
  declare office: string | null;
  declare phone: string | null;
  declare email: string | null;
}

Teacher.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.BIGINT, allowNull: false, unique: true, field: 'user_id' },
    teacherCode: { type: DataTypes.STRING(32), allowNull: true, unique: true, field: 'teacher_code' },
    title: { type: DataTypes.STRING(64), allowNull: true },
    office: { type: DataTypes.STRING(64), allowNull: true },
    phone: { type: DataTypes.STRING(32), allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: true },
  },
  { sequelize, tableName: 'teachers', modelName: 'Teacher', underscored: true, timestamps: true, paranoid: true }
);