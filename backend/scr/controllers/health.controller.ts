import { Request, Response } from "express";

export const getHealth = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: "ok",
    service: "crypto-portfolio-tracker-backend",
    timestamp: new Date().toISOString(),
  });
};

