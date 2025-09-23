import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, Op } from 'sequelize';
import { sequelize } from './db';

export class TopicApplication extends Model<InferAttributes<TopicApplication>, InferCreationAttributes<TopicApplication>> {
  declare id: CreationOptional<number>;
  declare topicId: number;
  declare studentId: number;
  declare status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  declare note: string | null;
  declare decidedAt: Date | null;
}

TopicApplication.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    topicId: { type: DataTypes.BIGINT, allowNull: false, field: 'topic_id' },
    studentId: { type: DataTypes.BIGINT, allowNull: false, field: 'student_id' },
    status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled'), defaultValue: 'pending' },
    note: { type: DataTypes.STRING(255), allowNull: true },
    decidedAt: { type: DataTypes.DATE, allowNull: true, field: 'decided_at' },
  },
  {
    sequelize,
    tableName: 'topic_applications',
    modelName: 'TopicApplication',
    underscored: true,
    timestamps: true,
    indexes: [{ unique: true, fields: ['topic_id', 'student_id'] }],
    hooks: {
      async beforeCreate(app, options) {
        if (app.status === 'accepted') {
          const existing = await TopicApplication.findOne({
            where: { studentId: app.studentId, status: 'accepted' },
            transaction: options.transaction,
          });
          if (existing) throw new Error('Student already has an accepted topic.');
        }
      },
      async beforeUpdate(app, options) {
        const prev = app.previous('status');
        if (prev === 'rejected' && app.status === 'accepted') {
          throw new Error('Cannot accept after rejected');
        }
        if (app.changed('status') && app.status === 'accepted') {
          const existing = await TopicApplication.findOne({
            where: {
              studentId: app.studentId,
              status: 'accepted',
              id: { [Op.ne]: app.id },
            },
            transaction: options.transaction,
          });
          if (existing) throw new Error('Student already has an accepted topic.');
        }
        if (app.changed('status') && (app.status === 'accepted' || app.status === 'rejected')) {
          app.decidedAt = new Date();
        }
      },
    }
  }
);