import { prisma } from "../config/db.js";
import { broadcastRobotUpdate } from "../config/websocket.js";
import { moveRobotPosition } from "./robotService.js";

const SIMULATION_INTERVAL = 2000;

export const startSimulation = () => {
  console.log("Robot simulation started");

  setInterval(async () => {
    try {
      const robots = await prisma.robot.findMany({
        select: {
          id: true,
        },
      });

      const updatedRobots = await Promise.all(
        robots.map((robot) => moveRobotPosition(robot.id))
      );
      
      broadcastRobotUpdate(updatedRobots.filter((robot) => robot !== null));

    } catch (error) {
      console.error("Simulation error:", error);
    }
  }, SIMULATION_INTERVAL);
};
