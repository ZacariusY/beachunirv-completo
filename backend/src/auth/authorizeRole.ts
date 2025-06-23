import {  Response, NextFunction } from 'express';
import { Role } from '../model/enum/Roles';
import { RequestWithPayload } from './payload';

export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: RequestWithPayload, res: Response, next: NextFunction) => {
    const userRole = req.payload.usuario.role;

    const hasAccess = allowedRoles.includes(userRole);

    if (!hasAccess) {
      res.status(403).json({ message: 'Acesso negado' });
      return;
    }

    next();
  };
}

