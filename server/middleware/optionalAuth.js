import jwt from "jsonwebtoken";
import { prisma } from "../config/db.config.js";
import env from "../utils/env.js";

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return next();

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch {
      return next();
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (user && user.isActive) req.user = user;

    next();
  } catch {
    next();
  }
};
