// e-commerce/backend/src/controllers/auth.ts
import { Request, Response } from "express";

export async function getMe(req: Request, res: Response) {
  const user = (req as any).user;

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}
