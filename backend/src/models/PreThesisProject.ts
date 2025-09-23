import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class PreThesisProject extends Model<InferAttributes<PreThesisProject>, InferCreationAttributes<PreThesisProject>> {
  declare id: CreationOptional<number>;
  declare studentId: number;
  declare topicId: number;
  declare semesterId: number;
  declare supervisorTeacherId: number;
  declare status: 'ongoing' | 'completed' | 'cancelled';
  declare finalScore: number | null;
}

PreThesisProject.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.BIGINT, allowNull: false, field: 'student_id' },
    topicId: { type: DataTypes.BIGINT, allowNull: false, field: 'topic_id' },
    semesterId: { type: DataTypes.BIGINT, allowNull: false, field: 'semester_id' },
    supervisorTeacherId: { type: DataTypes.BIGINT, allowNull: false, field: 'supervisor_teacher_id' },
    status: { type: DataTypes.ENUM('ongoing', 'completed', 'cancelled'), defaultValue: 'ongoing' },
    finalScore: { type: DataTypes.DECIMAL(5, 2), allowNull: true, field: 'final_score' },
  },
  { sequelize,
    tableName: 'pre_thesis_projects',
    modelName: 'PreThesisProject',
    underscored: true,
    timestamps: true,
    indexes: [ {
      unique: true,
      fields: ['student_id', 'semester_id'],
      name: 'uniq_pre_thesis_project_per_student_per_semester'
    } ]
  }
);