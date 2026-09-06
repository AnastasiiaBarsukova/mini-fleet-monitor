import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = createClient({ url: redisUrl });
export const redisSubscriber = redisClient.duplicate();

redisClient.on("error", (error) => {
	console.error("Redis error:", error);
});

redisSubscriber.on("error", (error) => {
	console.error("Redis subscriber error:", error);
});

export const connectRedis = async () => {
	if (!redisClient.isOpen) {
		await redisClient.connect();
	}
	if (!redisSubscriber.isOpen) {
		await redisSubscriber.connect();
	}

	console.log("Redis connected");
};

export const disconnectRedis = async () => {
	if (redisClient.isOpen) {
		await redisClient.quit();
	}
	if (redisSubscriber.isOpen) {
		await redisSubscriber.quit();
	}
};
