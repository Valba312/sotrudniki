import { Request, Response, NextFunction } from 'express';

type Role = 'hr' | 'admin' | 'manager' | 'employee';

export interface AuthUser {
  id: string;
  role: Role;
  department?: string;
  manages?: string[];
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

export const authMiddleware = (req: AuthedRequest, _res: Response, next: NextFunction) => {
  const userId = req.header('x-user-id');
  const role = (req.header('x-user-role') as Role | undefined) ?? 'employee';
  const department = req.header('x-user-department') ?? undefined;
  if (userId) {
    req.user = { id: userId, role, department };
  }
  next();
};

export const authorize = (roles: Role[]) => (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'forbidden' });
  }
  next();
};
