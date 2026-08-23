import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.ticket.count()
  const number = String(count + 1).padStart(3, '0')
  return `TK-${year}-${number}`
}

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { requesterId, categoryId, systemId, summary, requestedPriority, description } = req.body

    const required = ['requesterId', 'categoryId', 'systemId', 'summary', 'description']
    const missing = required.filter(f => !req.body[f])
    if (missing.length > 0) {
      return res.status(400).json({ errors: missing.map(f => `${f} is required`) })
    }

    if (description.length < 10) {
      return res.status(400).json({ errors: ['Description must be at least 10 characters'] })
    }

    const requester = await prisma.requester.findFirst({ where: { id: requesterId, isActive: true } })
    if (!requester) return res.status(404).json({ error: 'Requester not found' })

    const category = await prisma.category.findFirst({ where: { id: categoryId, isActive: true } })
    if (!category) return res.status(404).json({ error: 'Category not found' })

    const system = await prisma.system.findFirst({ where: { id: systemId, isActive: true } })
    if (!system) return res.status(404).json({ error: 'System not found' })

    const ticketNumber = await generateTicketNumber()
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        requesterId,
        categoryId,
        systemId,
        summary,
        requestedPriority: requestedPriority || 'MEDIUM',
        description,
        currentStatus: 'NEW'
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        system: { select: { id: true, name: true } }
      }
    })

    res.status(201).json(ticket)
  } catch (error) {
    console.error('Create ticket error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// GET /api/tickets - Liste des tickets du requester
export const getTickets = async (req: Request, res: Response) => {
  try {
    // 1. Récupérer les paramètres de requête
    const requesterId = parseInt(req.query.requesterId as string)
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const search = (req.query.search as string) || ''
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined
    const status = req.query.status as string
    const sort = (req.query.sort as string) || 'createdAt'
    const order = (req.query.order as string) || 'desc'

    // 2. Vérifier que requesterId est fourni
    if (!requesterId) {
      return res.status(400).json({ error: 'requesterId is required' })
    }

    // 3. Construire la clause WHERE
    const where: any = {
      requesterId,
      ...(categoryId && { categoryId }),
      ...(status && { currentStatus: status }),
      ...(search && {
        OR: [
          { summary: { contains: search, mode: 'insensitive' } },
          { ticketNumber: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    // 4. Construire la clause ORDER BY
    const orderBy: any = {}
    orderBy[sort] = order

    // 5. Calculer le skip pour la pagination
    const skip = (page - 1) * limit

    // 6. Exécuter les requêtes
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          requester: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
          system: { select: { id: true, name: true } },
          attachments: {
            where: { isDeleted: false },
            select: { id: true, fileName: true, fileType: true, fileSize: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.ticket.count({ where })
    ])

    // 7. Retourner la réponse avec pagination
    res.json({
      items: tickets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    })
  } catch (error) {
    console.error('Get tickets error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
