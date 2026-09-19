import express from 'express';
import {
  getQueue, getTicketDetail, claimTicket, assignTicket,
  setItPriority, setTicketStatus, addPublicComment,
  addInternalNote, getInternalNotes,
} from '../controllers/it.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { requirePasswordChanged } from '../middleware/requirePasswordChanged';
import { Role } from '@prisma/client';

const router = express.Router();

// Toutes les routes IT : authentifié + mot de passe changé + rôle IT/Admin
router.use('/it', authenticate, requirePasswordChanged, requireRole(Role.IT_STAFF, Role.ADMINISTRATOR));

router.get('/it/tickets', getQueue);
router.get('/it/tickets/:id', getTicketDetail);
router.post('/it/tickets/:id/claim', claimTicket);
router.post('/it/tickets/:id/assign', assignTicket);
router.patch('/it/tickets/:id/it-priority', setItPriority);
router.patch('/it/tickets/:id/status', setTicketStatus);
router.post('/it/tickets/:id/comments', addPublicComment);
router.post('/it/tickets/:id/notes', addInternalNote);
router.get('/it/tickets/:id/notes', getInternalNotes);

export default router;
