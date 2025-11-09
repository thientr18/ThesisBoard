import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class PreThesis extends Model<InferAttributes<PreThesis>, InferCreationAttributes<PreThesis>> {
  declare id: CreationOptional<number>;
  declare studentId: number;
  declare topicApplicationId: number | null;
  declare semesterId: number;
  declare supervisorTeacherId: number;
  declare status: 'in_progress' | 'completed' | 'cancelled';
  declare finalScore: number | null;
  declare feedback: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

PreThesis.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.BIGINT, allowNull: false, field: 'student_id' },
    topicApplicationId: { type: DataTypes.BIGINT, allowNull: true, field: 'topic_application_id' },
    semesterId: { type: DataTypes.BIGINT, allowNull: false, field: 'semester_id' },
    supervisorTeacherId: { type: DataTypes.BIGINT, allowNull: false, field: 'supervisor_teacher_id' },
    status: { type: DataTypes.ENUM('in_progress', 'completed', 'cancelled'), defaultValue: 'in_progress' },
    finalScore: { type: DataTypes.DECIMAL(5, 2), allowNull: true, field: 'final_score' },
    feedback: { type: DataTypes.TEXT, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' }
  },
  { sequelize,
    tableName: 'pre_theses',
    modelName: 'PreThesis',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [ {
      unique: true,
      fields: ['student_id', 'semester_id'],
      name: 'uniq_pre_thesis_per_student_per_semester'
    } ]
  }
);