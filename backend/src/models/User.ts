import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class User extends Model< InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare auth0UserId: string | null;
  declare username: string;
  declare email: string;
  declare fullName: string;
  declare status: 'active' | 'inactive';
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    auth0UserId: { type: DataTypes.STRING(128), allowNull: true, unique: true, field: 'auth0_user_id' },
    username: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    fullName: { type: DataTypes.STRING(255), allowNull: false, field: 'full_name' },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' }
  },
  { sequelize, tableName: 'users', modelName: 'User', underscored: true, timestamps: true, paranoid: true }
);

export default User;