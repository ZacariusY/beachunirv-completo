
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './auth';
import { RequestWithPayload } from './payload';

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    (req as RequestWithPayload).payload = payload;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token inválido ou expirado' });
    return;
  }
}