// e-commerce/backend/src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // simpan user ke request
  (req as any).user = data.user;

  next();
}

