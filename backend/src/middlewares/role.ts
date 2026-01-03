// e-commerce/backend/src/middlewares/role.ts 
import { Request, Response, NextFunction } from "express";

export function requireRole(role: "user" | "supplier") {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    // 🔥 DEFAULT ROLE USER
    const userRole = user.app_metadata?.role ?? "user";

    if (userRole !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
