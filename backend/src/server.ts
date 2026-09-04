import http from "http";
import express from "express";
import { initWebSocket } from "./config/websocket.js";
import "dotenv/config";
import {connectDB, disconnectDB, prisma } from "./config/db.js"
import { startSimulation } from "./services/simulationService.js";
import cors from "cors";
import {
  connectRedis,
  disconnectRedis,
} from "./config/redis.js";

//Import routes
import authRoutes from "./routes/authRoutes.js";
import robotsRoutes from "./routes/robotRoutes.js";

const app = express();

const PORT = 5001;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/robots", robotsRoutes);

const server = http.createServer(app);

initWebSocket(server);

const startServer = async() => {
  try {
    await connectDB();
    await connectRedis();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      startSimulation();
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    await disconnectDB();
    await disconnectRedis();
    process.exit(1);
  }
}
startServer();

// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});