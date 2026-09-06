import { apiClient } from "./apiClient";
export type RobotStatus = "idle" | "moving";

export interface Robot {
	id: string;
	name: string;
	status: RobotStatus;
	lat: number;
	lon: number;
	updatedAt: string;
}
export interface CreateRobotRequest {
	name: string;
	lat: number;
	lon: number;
}

interface CreateRobotResponse {
	status: "success";
	data: {
		robot: Robot;
	};
}

interface GetRobotsResponse {
	status: "success";
	data: {
		robots: Robot[];
	};
}

export const getRobots = () => {
	return apiClient<GetRobotsResponse>("/robots");
};

export const createRobot = (robot: CreateRobotRequest) => {
	return apiClient<CreateRobotResponse>("/robots", {
		method: "POST",
		body: JSON.stringify(robot),
	});
};

export interface RobotPosition {
	id: string;
	lat: number;
	lon: number;
	createdAt: string;
}

interface RobotPositionsResponse {
	status: "success";
	data: {
		robotId: string;
		date: string;
		positions: RobotPosition[];
	};
}

export const getRobotPositions = (robotId: string, date: string) => {
	return apiClient<RobotPositionsResponse>(`/robots/${robotId}/positions?date=${encodeURIComponent(date)}`, {
		method: "GET",
	});
};

export const updateRobotStatus = (robotId: string, status: RobotStatus) => {
	return apiClient<CreateRobotResponse>(`/robots/${robotId}/status`, {
		method: "PATCH",
		body: JSON.stringify({
			status,
		}),
	});
};
