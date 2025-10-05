import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from './db';

export class DefenseSession extends Model<InferAttributes<DefenseSession>, InferCreationAttributes<DefenseSession>> {
  declare id: CreationOptional<number>;
  declare thesisId: number;
  declare scheduledAt: Date;
  declare room: string | null;
  declare status: 'scheduled' | 'completed' | 'cancelled';
  declare notes: string | null;
}

DefenseSession.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    thesisId: { type: DataTypes.BIGINT, allowNull: false, unique: true, field: 'thesis_id' },
    scheduledAt: { type: DataTypes.DATE, allowNull: false, field: 'scheduled_at' },
    room: { type: DataTypes.STRING(64), allowNull: true },
    status: { type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'), defaultValue: 'scheduled' },
    notes: { type: DataTypes.STRING(255), allowNull: true },
  },
  { 
    sequelize,
    tableName: 'defense_sessions',
    modelName: 'DefenseSession',
    underscored: true,
    timestamps: true,
    paranoid: true
  }
);