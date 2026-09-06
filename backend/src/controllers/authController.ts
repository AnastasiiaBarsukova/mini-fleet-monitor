import { prisma } from "../config/db.js";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken";

const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({
			error: "Email and password are required",
		});
	}

	// Check if user email exists in the table
	const user = await prisma.user.findUnique({
		where: { email: email },
	});

	if (!user) {
		return res.status(401).json({ error: "Invalid email or password" });
	}

	// verify password
	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

	if (!isPasswordValid) {
		return res.status(401).json({ error: "Invalid email or password" });
	}

	// Generate JWT Token
	const token = generateToken(user.id);

	res.status(200).json({
		status: "success",
		data: {
			user: {
				id: user.id,
				email: email,
			},
			token,
		},
	});
};

const logout = async (_req: Request, res: Response) => {
	res.cookie("jwt", "", {
		httpOnly: true,
		expires: new Date(0),
	});
	res.status(200).json({
		status: "success",
		message: "Logged out successfully",
	});
};

export { login, logout };
