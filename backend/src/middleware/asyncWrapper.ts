import { Request, Response, NextFunction } from "express";

export const asyncWrapper = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => {
  
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  
};