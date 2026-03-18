import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

/**
 * Security middleware to validate QR tokens and sharing permissions.
 */

/**
 * Validates a temporary share token.
 * Checks for: existence, expiry, and revocation status.
 */
export async function validateShareToken(token: string) {
  const shareToken = await storage.getShareToken(token);
  
  if (!shareToken) {
    return { valid: false, message: "Invalid access token.", status: 404 };
  }

  if (new Date() > shareToken.expiryTime) {
    return { valid: false, message: "Access expired.", status: 410 };
  }

  if (shareToken.isUsed) {
    return { valid: false, message: "Token has already been used.", status: 410 };
  }

  return { valid: true, shareToken };
}

/**
 * Ensures the requesting user (patient) owns the resource they are trying to modify.
 */
export async function verifyPatientDataOwnership(userId: string, patientId: string) {
  const patient = await storage.getPatientByUserId(userId);
  if (!patient || patient.id !== patientId) {
    return false;
  }
  return true;
}

/**
 * Higher-order middleware for protecting routes that require a valid patient session.
 */
export const requirePatientAuth = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const patient = await storage.getPatientByUserId(userId);
  if (!patient) {
    return res.status(403).json({ message: "Access denied. No patient profile found." });
  }

  (req as any).patient = patient;
  next();
};
