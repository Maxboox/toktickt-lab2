import express from 'express';
import {
  login,
  logout,
  me,
  changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', authenticate, me);
router.post('/auth/change-password', authenticate, changePassword);

export default router;
