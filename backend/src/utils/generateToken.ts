import "dotenv/config";
import jwt from "jsonwebtoken";

export const generateToken = (userId: string) => {
  const payload = { userId: userId };
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }
  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: "24h",
  });

  return token;
};