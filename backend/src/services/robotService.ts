import { prisma } from "../config/db.js";

const MAX_POSITION_DELTA = 0.001;

export const moveRobotPosition = async (robotId: string) => {
	const robot = await prisma.robot.findUnique({
		where: {
			id: robotId,
		},
	});

	if (!robot) {
		return null;
	}

	const getRandomDelta = () => {
		return (Math.random() * 2 - 1) * MAX_POSITION_DELTA;
	};

	const newLat = Math.max(-90, Math.min(90, robot.lat + getRandomDelta()));
	const newLon = Math.max(-180, Math.min(180, robot.lon + getRandomDelta()));

	return prisma.$transaction(async (tx) => {
		const updatedRobot = await tx.robot.update({
			where: {
				id: robotId,
			},

			data: {
				lat: newLat,
				lon: newLon,
			},
		});

		await tx.robotPosition.create({
			data: {
				robotId,
				lat: newLat,
				lon: newLon,
			},
		});

		return updatedRobot;
	});
};

export const getRobotPositionsByDate = async (robotId: string, date: string) => {
	const robot = await prisma.robot.findUnique({
		where: {
			id: robotId,
		},
		select: {
			id: true,
		},
	});

	if (!robot) {
		return null;
	}

	const start = new Date(`${date}T00:00:00.000Z`);
	const end = new Date(start);
	end.setUTCDate(end.getUTCDate() + 1);

	const positions = await prisma.robotPosition.findMany({
		where: {
			robotId,
			createdAt: {
				gte: start,
				lt: end,
			},
		},

		orderBy: {
			createdAt: "asc",
		},

		select: {
			id: true,
			lat: true,
			lon: true,
			createdAt: true,
		},
	});

	return positions;
};

export const setRobotStatus = async (robotId: string, status: "idle" | "moving") => {
	const robot = await prisma.robot.findUnique({
		where: {
			id: robotId,
		},
	});

	if (!robot) {
		return null;
	}

	return prisma.robot.update({
		where: {
			id: robotId,
		},
		data: {
			status,
		},
	});
};
