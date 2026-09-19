import express from 'express';
import { getUsers, createUser, updateUser, setInitialPassword } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { requirePasswordChanged } from '../middleware/requirePasswordChanged';
import { Role } from '@prisma/client';

const router = express.Router();

router.use('/admin', authenticate, requirePasswordChanged, requireRole(Role.ADMINISTRATOR));

router.get('/admin/users', getUsers);
router.post('/admin/users', createUser);
router.patch('/admin/users/:id', updateUser);
router.post('/admin/users/:id/initial-password', setInitialPassword);

export default router;
