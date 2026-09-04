import { apiClient } from "./apiClient";
export type RobotStatus = "idle" | "moving";

export interface Robot {
  id: string;
  name: string;
  status: RobotStatus;
  lat: number;
  lon: number;
  updatedAt: string;
};
export interface CreateRobotRequest {
  name: string;
  lat: number;
  lon: number;
};

interface CreateRobotResponse {
  status: "success";
  data: {
    robot: Robot;
  };
};

interface GetRobotsResponse {
  status: "success";
  data: {
    robots: Robot[];
  };
};

export const getRobots = () => {
  return apiClient<GetRobotsResponse>(
    "/robots"
  );
};

export const createRobot = (
  robot: CreateRobotRequest
) => {
  return apiClient<CreateRobotResponse>("/robots", {
    method: "POST",
    body: JSON.stringify(robot),
  });
};