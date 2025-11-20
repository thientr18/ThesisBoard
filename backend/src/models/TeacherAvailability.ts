import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class TeacherAvailability extends Model<InferAttributes<TeacherAvailability>, InferCreationAttributes<TeacherAvailability>> {
  declare id: CreationOptional<number>;
  declare teacherId: number;
  declare semesterId: number;
  declare maxPreThesis: number;
  declare maxThesis: number;
  declare isOpen: boolean;
  declare note: string | null;
}

TeacherAvailability.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    teacherId: { type: DataTypes.BIGINT, allowNull: false, field: 'teacher_id' },
    semesterId: { type: DataTypes.BIGINT, allowNull: false, field: 'semester_id' },
    maxPreThesis: { type: DataTypes.INTEGER, defaultValue: 0, field: 'max_pre_thesis' },
    maxThesis: { type: DataTypes.INTEGER, defaultValue: 0, field: 'max_thesis' },
    isOpen: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_open' },
    note: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    sequelize,
    tableName: 'teacher_availability',
    modelName: 'TeacherAvailability',
    underscored: true,
    timestamps: true,
    indexes: [{
      unique: true,
      fields: ['teacher_id', 'semester_id'],
      name: 'uniq_teacher_availability_per_teacher_per_semester'
    }],
  }
);