import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./models/db";
import { applyAssociations } from "./models";
import routes from "./routes";
import { errorHandler, notFoundHandler, setupUnhandledErrorHandlers } from './middlewares/error-handler.middleware';

dotenv.config();
const app = express();

app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(express.json());

const corsOptions = {
    origin: ['http://localhost:5173'],
    credentials: true,
};
app.use(cors(corsOptions));

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);
setupUnhandledErrorHandlers();

async function start() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully.");
        applyAssociations();

        await sequelize.sync();
        console.log("✅ Models synchronized.");

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (error) {
        console.error("❌ FAILED TO CONNECT TO DATABASE:", error);
        process.exit(1);
    }
}

start();
