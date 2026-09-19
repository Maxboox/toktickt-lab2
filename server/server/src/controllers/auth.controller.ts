import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword, verifyPassword, isValidPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

const isProd = process.env.NODE_ENV === 'production';

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Retourne : { user: { id, name, email, role, mustChangePassword } }
 */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Réponse générique pour ne pas révéler si l'email existe
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken({ userId: user.id, role: user.role });

  // Cookie httpOnly
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });

  return res.json({
    token, // pratique pour tester avec curl/Postman
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  });
}

/**
 * POST /api/auth/logout
 * Efface le cookie.
 */
export async function logout(req: Request, res: Response) {
  res.clearCookie('token');
  return res.json({ message: 'Logged out' });
}

/**
 * GET /api/auth/me
 * Retourne l'utilisateur authentifié.
 */
export async function me(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ user });
}

/**
 * POST /api/auth/change-password
 * Body: { currentPassword, newPassword }
 */
export async function changePassword(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }

  const { valid, errors } = isValidPassword(newPassword);
  if (!valid) {
    return res.status(400).json({ error: 'Invalid new password', details: errors });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const newHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
    },
  });

  return res.json({ message: 'Password changed successfully' });
}
