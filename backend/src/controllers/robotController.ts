import { prisma } from "../config/db.js";
import { Request, RequestHandler, Response } from "express";
import { getRobotPositionsByDate, moveRobotPosition } from "../services/robotService.js";
import { broadcastRobotUpdate } from "../config/websocket.js";
import { redisClient } from "../config/redis.js";
import { setRobotStatus } from "../services/robotService.js";

const ROBOTS_CACHE_KEY = "robots:all";
const ROBOTS_CACHE_TTL = 10;

export interface RobotParams {
	id: string;
}

export interface PositionsQuery {
	date?: string;
}

const getRobots = async (req: Request, res: Response) => {
	try {
		const cachedRobots = await redisClient.get(ROBOTS_CACHE_KEY);

		if (cachedRobots) {
			console.log("GET /robots: Redis cache HIT");

			return res.status(200).json({
				status: "success",
				data: {
					robots: JSON.parse(cachedRobots),
				},
			});
		}

		console.log("GET /robots: Redis cache MISS");

		const robots = await prisma.robot.findMany();

		await redisClient.setEx(ROBOTS_CACHE_KEY, ROBOTS_CACHE_TTL, JSON.stringify(robots));

		return res.status(200).json({
			status: "success",
			data: {
				robots,
			},
		});
	} catch (error) {
		console.error("Get robots error:", error);

		return res.status(500).json({
			error: "Failed to get robots",
		});
	}
};

const moveRobot: RequestHandler = async (req, res) => {
	try {
		const { id } = req.params;
		if (typeof id !== "string") {
			res.status(400).json({
				error: "Invalid robot id",
			});
			return;
		}

		const robot = await moveRobotPosition(id);

		if (!robot) {
			return res.status(404).json({
				error: "Robot not found",
			});
		}

		return res.status(200).json({
			status: "success",
			data: {
				robot,
			},
		});
	} catch (error) {
		console.error("Move robot error:", error);

		return res.status(500).json({
			error: "Failed to move robot",
		});
	}
};

type CreateRobotBody = {
	name: string;
	lat: number;
	lon: number;
};

const addRobot = async (req: Request<{}, {}, CreateRobotBody>, res: Response) => {
	try {
		const { name, lat, lon } = req.body;

		if (typeof name !== "string" || !name.trim() || typeof lat !== "number" || typeof lon !== "number") {
			return res.status(400).json({
				error: "Name, lat and lon are required",
			});
		}

		if (lat < -90 || lat > 90) {
			return res.status(400).json({
				error: "Latitude must be between -90 and 90",
			});
		}

		if (lon < -180 || lon > 180) {
			return res.status(400).json({
				error: "Longitude must be between -180 and 180",
			});
		}

		const robot = await prisma.robot.create({
			data: {
				name,
				lat,
				lon,
				status: "idle",
			},
		});

		return res.status(201).json({
			status: "success",
			data: {
				robot,
			},
		});
	} catch (error) {
		console.error("Create robot error:", error);

		return res.status(500).json({
			error: "Failed to create robot",
		});
	}
};

const getRobotHistoryPositions: RequestHandler = async (req, res) => {
	try {
		const { id } = req.params;
		const { date } = req.query;

		if (typeof id !== "string") {
			res.status(400).json({
				error: "Invalid robot id",
			});
			return;
		}

		if (typeof date !== "string") {
			res.status(400).json({
				error: "Date is required",
			});
			return;
		}

		if (!date) {
			return res.status(400).json({
				error: "Date is required",
			});
		}

		const datePattern = /^\d{4}-\d{2}-\d{2}$/;

		if (!datePattern.test(date)) {
			return res.status(400).json({
				error: "Date must have format YYYY-MM-DD",
			});
		}

		const parsedDate = new Date(`${date}T00:00:00.000Z`);

		if (Number.isNaN(parsedDate.getTime())) {
			return res.status(400).json({
				error: "Invalid date",
			});
		}

		const positions = await getRobotPositionsByDate(id, date);

		if (positions === null) {
			return res.status(404).json({
				error: "Robot not found",
			});
		}

		return res.status(200).json({
			status: "success",
			data: {
				robotId: id,
				date,
				positions,
			},
		});
	} catch (error) {
		console.error("Get robot positions error:", error);

		return res.status(500).json({
			error: "Failed to get robot positions",
		});
	}
};

export const updateRobotStatus: RequestHandler = async (req, res) => {
	try {
		const id = req.params.id;
		const status = req.body.status;

		if (typeof id !== "string") {
			res.status(400).json({
				error: "Invalid robot id",
			});
			return;
		}

		if (status !== "idle" && status !== "moving") {
			res.status(400).json({
				error: "Status must be idle or moving",
			});
			return;
		}

		const robot = await setRobotStatus(id, status);

		if (!robot) {
			res.status(404).json({
				error: "Robot not found",
			});
			return;
		}

		res.status(200).json({
			status: "success",
			data: {
				robot,
			},
		});
	} catch (error) {
		console.error("Update robot status error:", error);

		res.status(500).json({
			error: "Failed to update robot status",
		});
	}
};

export { getRobots, moveRobot, addRobot, getRobotHistoryPositions };
