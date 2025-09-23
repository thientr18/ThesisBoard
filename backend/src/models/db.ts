import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE_NAME || 'thesisboard',
    process.env.MYSQL_USERNAME || 'root',
    process.env.MYSQL_PASSWORD || '',
    {
        dialect: 'mysql',
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306', 10),
        logging: false,
        define: {
            underscored: true,
            timestamps: true,
        },
        dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true } } : {},
    }
);

sequelize.authenticate()
    .then(() => {
        console.log('Database connection established successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });

export default sequelize;