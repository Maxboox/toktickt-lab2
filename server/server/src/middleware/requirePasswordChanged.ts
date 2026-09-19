import { Request, Response, NextFunction } from 'express';

/**
 * Middleware : bloque l'accès aux utilisateurs qui doivent encore
 * changer leur mot de passe initial.
 */
export function requirePasswordChanged(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.mustChangePassword) {
    return res.status(403).json({
      error: 'You must change your password before accessing this resource',
      code: 'MUST_CHANGE_PASSWORD',
    });
  }
  next();
}
