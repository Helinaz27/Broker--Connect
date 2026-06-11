import jwt from "jsonwebtoken";
import { prisma } from "../config/db.config.js";
import { permissions } from "../utils/permissions.js";
import env from "../utils/env.js";

export const can = (resource, action) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Not authorized: No token provided",
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, env.jwtSecret);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Not authorized: Invalid token",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized: User not found",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Your account is deactivated",
        });
      }

      req.user = user;

      const resourcePermissions = permissions[resource];

      if (!resourcePermissions) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Unknown resource: ${resource}`,
        });
      }

      if (user.roles.includes("admin")) {
        const adminActions = resourcePermissions["admin"] ?? [];
        if (adminActions.includes("manage")) {
          return next();
        }
      }

      const hasPermission = user.roles.some((role) => {
        const allowedActions = resourcePermissions[role] ?? [];
        return allowedActions.includes(action);
      });

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have permission to ${action} on ${resource}.`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Permission check failed.",
        error: error.message,
      });
    }
  };
};
