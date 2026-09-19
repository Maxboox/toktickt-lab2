import { Request, Response } from 'express';
import { PrismaClient, Role, ITPriority, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Transitions de statut autorisées
const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  NEW:                    [TicketStatus.OPEN, TicketStatus.CANCELLED],
  OPEN:                   [TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.CANCELLED],
  IN_PROGRESS:            [TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.RESOLVED, TicketStatus.CANCELLED],
  WAITING_FOR_REQUESTER:  [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CANCELLED],
  RESOLVED:               [TicketStatus.CLOSED, TicketStatus.REOPENED],
  CLOSED:                 [TicketStatus.REOPENED],
  REOPENED:               [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
  CANCELLED:              [],
};

// GET /api/it/tickets
export async function getQueue(req: Request, res: Response) {
  try {
    const {
      search, status, priority, owner, category,
      sort = 'updatedAt', order = 'desc',
      page = '1', pageSize = '20',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));

    const where: any = {};
    if (status)  where.currentStatus = status as TicketStatus;
    if (priority) where.itPriority = priority as ITPriority;
    if (category) where.categoryId = parseInt(category, 10);
    if (owner === 'unassigned') where.ownerId = null;
    else if (owner) where.ownerId = parseInt(owner, 10);

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { summary:      { contains: search, mode: 'insensitive' } },
        { requester:    { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const sortable = ['createdAt', 'updatedAt', 'itPriority', 'ticketNumber'];
    const sortField = sortable.includes(sort) ? sort : 'updatedAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const total = await prisma.ticket.count({ where });
    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: (pageNum - 1) * size,
      take: size,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        owner:     { select: { id: true, name: true, email: true } },
        category:  { select: { id: true, name: true } },
        system:    { select: { id: true, name: true } },
      },
    });

    return res.json({
      tickets,
      pagination: { total, page: pageNum, pageSize: size, totalPages: Math.ceil(total / size) },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/it/tickets/:id
export async function getTicketDetail(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ticket id' });

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        owner:     { select: { id: true, name: true, email: true } },
        category:  true,
        system:    true,
        attachments: { where: { isDeleted: false }, orderBy: { createdAt: 'desc' } },
        publicComments: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true, role: true } } },
        },
        internalNotes: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    return res.json({ ticket });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/it/tickets/:id/claim
export async function claimTicket(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const id = parseInt(req.params.id, 10);

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.ownerId) return res.status(409).json({ error: 'Ticket already has an owner' });

    const updated = await prisma.ticket.update({
      where: { id },
      data: { ownerId: req.user.id },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    return res.json({ ticket: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/it/tickets/:id/assign
export async function assignTicket(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const { ownerId } = req.body || {};

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    let newOwnerId: number | null = null;
    if (ownerId !== null && ownerId !== undefined) {
      const owner = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!owner || !owner.isActive) return res.status(400).json({ error: 'Owner must be an active user' });
      if (owner.role !== Role.IT_STAFF && owner.role !== Role.ADMINISTRATOR) {
        return res.status(400).json({ error: 'Owner must be IT Staff or Administrator' });
      }
      newOwnerId = ownerId;
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: { ownerId: newOwnerId },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    return res.json({ ticket: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}

// PATCH /api/it/tickets/:id/it-priority
export async function setItPriority(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const { itPriority } = req.body || {};

    if (!Object.values(ITPriority).includes(itPriority)) {
      return res.status(400).json({ error: 'Invalid IT priority' });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const updated = await prisma.ticket.update({ where: { id }, data: { itPriority } });
    return res.json({ ticket: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}

// PATCH /api/it/tickets/:id/status
export async function setTicketStatus(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, resolutionSummary } = req.body || {};

    if (!Object.values(TicketStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const allowed = ALLOWED_TRANSITIONS[ticket.currentStatus];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: `Invalid transition: ${ticket.currentStatus} → ${status}`,
        allowed,
      });
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        currentStatus: status,
        ...(status === TicketStatus.RESOLVED && resolutionSummary
          ? { resolutionSummary }
          : {}),
      },
    });

    return res.json({ ticket: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/it/tickets/:id/comments
export async function addPublicComment(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const id = parseInt(req.params.id, 10);
    const { content } = req.body || {};

    if (!content || !content.trim()) return res.status(400).json({ error: 'Comment content is required' });
    if (content.length > 2000) return res.status(400).json({ error: 'Comment too long (max 2000 chars)' });

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const comment = await prisma.publicComment.create({
      data: { ticketId: id, authorId: req.user.id, content: content.trim() },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    return res.status(201).json({ comment });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/it/tickets/:id/notes
export async function addInternalNote(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const id = parseInt(req.params.id, 10);
    const { content } = req.body || {};

    if (!content || !content.trim()) return res.status(400).json({ error: 'Note content is required' });
    if (content.length > 2000) return res.status(400).json({ error: 'Note too long (max 2000 chars)' });

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const note = await prisma.internalNote.create({
      data: { ticketId: id, authorId: req.user.id, content: content.trim() },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    return res.status(201).json({ note });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/it/tickets/:id/notes
export async function getInternalNotes(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const notes = await prisma.internalNote.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    return res.json({ notes });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
