import type { Server } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { redisSubscriber } from "./redis.js";

let wss: WebSocketServer;

export const initWebSocket = (server: Server) => {
	wss = new WebSocketServer({ server });

	wss.on("connection", (socket) => {
		console.log("WebSocket client connected");
		socket.on("close", () => {
			console.log("WebSocket client disconnected");
		});
	});
};

export const subscribeRobotUpdates = async () => {
	await redisSubscriber.subscribe("robot_updates", (message) => {
		if (!wss) {
			return;
		}

		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(message);
			}
		});
	});
};

export const broadcastRobotUpdate = (robot: unknown) => {
	if (!wss) {
		return;
	}

	const message = JSON.stringify({
		type: "robot_position",
		data: {
			robot,
		},
	});

	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(message);
		}
	});
};
