import { Router, Request, Response } from "express";
import { getRobots, moveRobot, addRobot } from "../controllers/robotController"
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

//Liefert alle Roboter (auth-geschützt)
router.get("/", authMiddleware, getRobots)

router.post("/:id/move", moveRobot)

//POST /robots zum Hinzufügen eines Roboters
router.post("/", authMiddleware, addRobot)

export default router;
