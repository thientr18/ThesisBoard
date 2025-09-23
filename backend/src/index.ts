import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes";
import { sequelize } from "./models/db";
import { applyAssociations } from "./models";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

async function start() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully.");
        applyAssociations();

        await sequelize.sync({ alter: true });
        console.log("✅ Models synchronized.");

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (error) {
        console.error("❌ FAILED TO CONNECT TO DATABASE:", error);
        process.exit(1);
    }
}

start();
