import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword, isValidPassword } from '../utils/password';

const prisma = new PrismaClient();

// GET /api/admin/users
export async function getUsers(req: Request, res: Response) {
  try {
    const { search, role } = req.query as Record<string, string>;
    const where: any = {};
    if (role && Object.values(Role).includes(role as Role)) where.role = role as Role;
    if (search) {
      where.OR = [
        { name:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const users = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true, isActive: true,
                mustChangePassword: true, createdAt: true },
    });
    return res.json({ users });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/admin/users
export async function createUser(req: Request, res: Response) {
  try {
    const { name, email, role, isActive = true, initialPassword } = req.body || {};
    if (!name || !email || !role || !initialPassword) {
      return res.status(400).json({ error: 'name, email, role, and initialPassword are required' });
    }
    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const { valid, errors } = isValidPassword(initialPassword);
    if (!valid) return res.status(400).json({ error: 'Invalid initial password', details: errors });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'A user with this email already exists' });

    const passwordHash = await hashPassword(initialPassword);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role, isActive, mustChangePassword: true },
      select: { id: true, name: true, email: true, role: true, isActive: true,
                mustChangePassword: true, createdAt: true },
    });
    return res.status(201).json({ user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}

// PATCH /api/admin/users/:id
export async function updateUser(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, role, isActive } = req.body || {};

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Auto-désactivation interdite
    if (isActive === false && user.isActive === true) {
      if (req.user && req.user.id === id) {
        return res.status(400).json({ error: 'You cannot deactivate your own account' });
      }
      if (user.role === Role.ADMINISTRATOR) {
        const activeAdmins = await prisma.user.count({
          where: { role: Role.ADMINISTRATOR, isActive: true },
        });
        if (activeAdmins <= 1) {
          return res.status(400).json({ error: 'Cannot deactivate the last active Administrator' });
        }
      }
    }

    // Dernier admin ne peut pas changer de rôle
    if (role && role !== Role.ADMINISTRATOR && user.role === Role.ADMINISTRATOR) {
      const activeAdmins = await prisma.user.count({
        where: { role: Role.ADMINISTRATOR, isActive: true },
      });
      if (activeAdmins <= 1) {
        return res.status(400).json({ error: 'Cannot remove the last active Administrator' });
      }
    }

    // Duplicate email
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ error: 'A user with this email already exists' });
    }

    if (role && !Object.values(Role).includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      select: { id: true, name: true, email: true, role: true, isActive: true,
                mustChangePassword: true, createdAt: true },
    });
    return res.json({ user: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/admin/users/:id/initial-password
export async function setInitialPassword(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const { initialPassword } = req.body || {};
    if (!initialPassword) return res.status(400).json({ error: 'initialPassword is required' });

    const { valid, errors } = isValidPassword(initialPassword);
    if (!valid) return res.status(400).json({ error: 'Invalid password', details: errors });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const passwordHash = await hashPassword(initialPassword);
    await prisma.user.update({
      where: { id },
      data: { passwordHash, mustChangePassword: true },
    });
    return res.json({ message: 'Initial password set. User must change it at next login.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
