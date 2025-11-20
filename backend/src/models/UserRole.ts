import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from './db';

export class UserRole extends Model<InferAttributes<UserRole>, InferCreationAttributes<UserRole>> {
  declare userId: number;
  declare roleId: number;
  declare assignedAt: Date;
}

UserRole.init(
  {
    userId: { type: DataTypes.BIGINT, primaryKey: true, allowNull: false, field: 'user_id' },
    roleId: { type: DataTypes.BIGINT, primaryKey: true, allowNull: false, field: 'role_id' },
    assignedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'assigned_at' },
  },
  { sequelize, tableName: 'user_roles', modelName: 'UserRole', underscored: true, timestamps: true }
);