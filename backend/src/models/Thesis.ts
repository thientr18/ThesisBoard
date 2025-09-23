import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class Thesis extends Model<InferAttributes<Thesis>, InferCreationAttributes<Thesis>> {
  declare id: CreationOptional<number>;
  declare studentId: number;
  declare supervisorTeacherId: number;
  declare semesterId: number;
  declare title: string | null;
  declare abstract: string | null;
  declare status: 'draft' | 'in_progress' | 'defense_scheduled' | 'completed' | 'cancelled';
}

Thesis.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.BIGINT, allowNull: false, field: 'student_id' },
    supervisorTeacherId: { type: DataTypes.BIGINT, allowNull: false, field: 'supervisor_teacher_id' },
    semesterId: { type: DataTypes.BIGINT, allowNull: false, field: 'semester_id' },
    title: { type: DataTypes.STRING(255), allowNull: true },
    abstract: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('draft', 'in_progress', 'defense_scheduled', 'completed', 'cancelled'), defaultValue: 'in_progress' },
  },
  { 
    sequelize,
    tableName: 'theses',
    modelName: 'Thesis',
    underscored: true,
    timestamps: true,
    indexes: [ {
      unique: true,
      fields: ['student_id', 'semester_id'],
      name: 'uniq_thesis_per_student_per_semester'
    } ]
  }
);