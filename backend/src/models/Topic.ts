import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class Topic extends Model<InferAttributes<Topic>, InferCreationAttributes<Topic>> {
  declare id: CreationOptional<number>;
  declare teacherId: number;
  declare semesterId: number;
  declare title: string;
  declare description: string | null;
  declare requirements: string | null;
  declare tags: object | null;
  declare maxSlots: number;
  declare status: 'open' | 'closed';
}

Topic.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    teacherId: { type: DataTypes.BIGINT, allowNull: false, field: 'teacher_id' },
    semesterId: { type: DataTypes.BIGINT, allowNull: false, field: 'semester_id' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    requirements: { type: DataTypes.TEXT, allowNull: true },
    tags: { type: DataTypes.JSON, allowNull: true },
    maxSlots: { type: DataTypes.INTEGER, allowNull: false, field: 'max_slots' },
    status: { type: DataTypes.ENUM('open', 'closed'), defaultValue: 'open' },
  },
  { sequelize, tableName: 'topics', modelName: 'Topic', underscored: true, timestamps: true, paranoid: true }
);