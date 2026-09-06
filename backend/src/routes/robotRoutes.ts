import { Router } from "express";
import {
	getRobots,
	moveRobot,
	addRobot,
	getRobotHistoryPositions,
	updateRobotStatus,
} from "../controllers/robotController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

//Liefert alle Roboter (auth-geschützt)
router.get("/", authMiddleware, getRobots);

router.post("/:id/move", authMiddleware, moveRobot);

//POST /robots zum Hinzufügen eines Roboters
router.post("/", authMiddleware, addRobot);

router.get("/:id/positions", authMiddleware, getRobotHistoryPositions);

router.patch("/:id/status", authMiddleware, updateRobotStatus);
export default router;
