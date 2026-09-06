import { prisma } from "../config/db.js";
import { redisClient } from "../config/redis.js";
import { moveRobotPosition } from "./robotService.js";

const SIMULATION_INTERVAL = 2000;
let simulationTimer: NodeJS.Timeout | null = null;

export const startSimulation = () => {
	if (simulationTimer) {
		return false;
	}
	setInterval(async () => {
		try {
			const movingRobots = await prisma.robot.findMany({
				where: {
					status: "moving",
				},
				select: {
					id: true,
				},
			});

			await Promise.all(movingRobots.map((robot) => moveRobotPosition(robot.id)));
			const robots = await prisma.robot.findMany();
			const validRobots = robots.filter((robot) => robot !== null);

			await redisClient.publish(
				"robot_updates",
				JSON.stringify({
					type: "robot_positions",
					data: {
						robots: validRobots,
					},
				}),
			);
		} catch (error) {
			console.error("Simulation error:", error);
		}
	}, SIMULATION_INTERVAL);
};
