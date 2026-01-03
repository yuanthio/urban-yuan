// e-commerce/backend/src/controllers/profile.ts
import { Request, Response } from "express";
import { prisma } from "../prisma/client";

// GET profile user
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// UPDATE profile user
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { fullName, avatarUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    // Cek jika profile ada
    const existingProfile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!existingProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { id: userId },
      data: {
        fullName: fullName !== undefined ? fullName : existingProfile.fullName,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : existingProfile.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE profile (soft delete - hanya mengosongkan field)
export async function deleteProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    // Cek jika profile ada
    const existingProfile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!existingProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Hapus data pribadi, tapi tetap pertahankan user untuk referensi order
    const updatedProfile = await prisma.profile.update({
      where: { id: userId },
      data: {
        fullName: null,
        avatarUrl: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    res.json({
      message: "Profile data cleared successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}