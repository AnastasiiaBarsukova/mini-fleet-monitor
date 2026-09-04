import { prisma } from "../config/db.js";

const MAX_POSITION_DELTA = 0.001;

const getRandomDelta = () => {
  return (Math.random() * 2 - 1) * MAX_POSITION_DELTA;
};

interface CreateRobotData {
  name: string;
  lat: number;
  lon: number;
};

export const moveRobotPosition = async (robotId: string) => {
  const robot = await prisma.robot.findUnique({
    where: {
      id: robotId,
    },
  });

  if (!robot) {
    return null;
  }

  const newLat = Math.max(
    -90,
    Math.min(90, robot.lat + getRandomDelta())
  );

  const newLon = Math.max(
    -180,
    Math.min(180, robot.lon + getRandomDelta())
  );

  return prisma.robot.update({
    where: {
      id: robotId,
    },
    data: {
      lat: newLat,
      lon: newLon,
      status: "moving",
    },
  });
};


export const createRobot = async ({
  name,
  lat,
  lon,
}: CreateRobotData) => {
  return prisma.robot.create({
    data: {
      name,
      lat,
      lon,
      status: "idle",
    },
  });
};
 
