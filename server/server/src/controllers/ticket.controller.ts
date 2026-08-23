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

    // Validation
    const required = ['requesterId', 'categoryId', 'systemId', 'summary', 'description']
    const missing = required.filter(f => !req.body[f])
    if (missing.length > 0) {
      return res.status(400).json({ errors: missing.map(f => `${f} is required`) })
    }

    if (description.length < 10) {
      return res.status(400).json({ errors: ['Description must be at least 10 characters'] })
    }

    // Vérifications
    const requester = await prisma.requester.findFirst({ where: { id: requesterId, isActive: true } })
    if (!requester) return res.status(404).json({ error: 'Requester not found' })

    const category = await prisma.category.findFirst({ where: { id: categoryId, isActive: true } })
    if (!category) return res.status(404).json({ error: 'Category not found' })

    const system = await prisma.system.findFirst({ where: { id: systemId, isActive: true } })
    if (!system) return res.status(404).json({ error: 'System not found' })

    // Création
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
