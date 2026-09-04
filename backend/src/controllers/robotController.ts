import { prisma } from "../config/db.js";
import { Request, Response } from "express";
import { moveRobotPosition } from "../services/robotService.js";
import { broadcastRobotUpdate } from "../config/websocket.js";
import { createRobot } from "../services/robotService.js";
import { redisClient } from "../config/redis.js";

const ROBOTS_CACHE_KEY = "robots:all";
const ROBOTS_CACHE_TTL = 10;

interface RobotParams {
  id: string;
};

const getRobots = async (
  req: Request,
  res: Response
) => {
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

    await redisClient.setEx(
      ROBOTS_CACHE_KEY,
      ROBOTS_CACHE_TTL,
      JSON.stringify(robots)
    );

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

const moveRobot = async (
  req: Request<RobotParams>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const robot = await moveRobotPosition(id);

    if (!robot) {
      return res.status(404).json({
        error: "Robot not found",
      });
    }

    broadcastRobotUpdate(robot);

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

const addRobot = async (
  req: Request<{}, {}, CreateRobotBody>,
  res: Response
) => {
  try {
    const { name, lat, lon } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof lat !== "number" ||
      typeof lon !== "number"
    ) {
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

    const robot = await createRobot({
      name: name.trim(),
      lat,
      lon,
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
 
export { getRobots, moveRobot, addRobot };