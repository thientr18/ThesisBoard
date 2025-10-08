import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class Semester extends Model<InferAttributes<Semester>, InferCreationAttributes<Semester>> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare name: string;
  declare startDate: Date;
  declare endDate: Date;
  declare isActive: boolean;
}

Semester.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(32), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(64), allowNull: false },
    startDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'start_date' },
    endDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'end_date' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_active' },
  },
  { sequelize,
    tableName: 'semesters',
    modelName: 'Semester',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['is_active'] }
    ],
  }
);