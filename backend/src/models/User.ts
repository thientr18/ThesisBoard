import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class User extends Model< InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare auth0UserId: string | null;
  declare email: string;
  declare fullName: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

User.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    auth0UserId: { type: DataTypes.STRING(128), allowNull: true, unique: true, field: 'auth0_user_id' },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    fullName: { type: DataTypes.STRING(255), allowNull: false, field: 'full_name' },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
    deletedAt: { type: DataTypes.DATE, allowNull: true, field: 'deleted_at' },
  },
  { sequelize, tableName: 'users', modelName: 'User', underscored: true, timestamps: true, paranoid: true }
);

export default User;