import request from 'supertest'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import ticketRoutes from '../../src/routes/ticket.routes'
import requesterRoutes from '../../src/routes/requester.routes'

const prisma = new PrismaClient()

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', ticketRoutes)
app.use('/api', requesterRoutes)

beforeAll(async () => {
  await prisma.attachment.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.requester.deleteMany()
  await prisma.category.deleteMany()
  await prisma.system.deleteMany()

  await prisma.category.create({
    data: { name: 'Hardware', isActive: true }
  })
  await prisma.system.create({
    data: { name: 'Corporate Laptop', isActive: true }
  })
  await prisma.requester.create({
    data: { 
      name: 'Test User', 
      email: 'test@example.com', 
      isActive: true 
    }
  })
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /api/tickets', () => {
  let requesterId: number
  let categoryId: number
  let systemId: number

  beforeAll(async () => {
    const requester = await prisma.requester.findFirst({
      where: { email: 'test@example.com' }
    })
    const category = await prisma.category.findFirst({
      where: { name: 'Hardware' }
    })
    const system = await prisma.system.findFirst({
      where: { name: 'Corporate Laptop' }
    })
    
    requesterId = requester?.id || 0
    categoryId = category?.id || 0
    systemId = system?.id || 0
  })

  test('POST /api/tickets - Should create a ticket with valid data', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({
        requesterId,
        categoryId,
        systemId,
        summary: 'Test ticket',
        requestedPriority: 'MEDIUM',
        description: 'This is a test ticket with more than 10 characters'
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('ticketNumber')
    expect(response.body.summary).toBe('Test ticket')
    expect(response.body.currentStatus).toBe('NEW')
  })

  test('POST /api/tickets - Should return 400 if requesterId is missing', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({
        categoryId,
        systemId,
        summary: 'Test ticket',
        description: 'This is a test ticket with more than 10 characters'
      })

    expect(response.status).toBe(400)
    expect(response.body.errors[0]).toContain('requesterId')
  })

  test('POST /api/tickets - Should return 400 if summary is missing', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({
        requesterId,
        categoryId,
        systemId,
        description: 'This is a test ticket with more than 10 characters'
      })

    expect(response.status).toBe(400)
    expect(response.body.errors[0]).toContain('summary')
  })

  test('POST /api/tickets - Should return 400 if description is too short', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({
        requesterId,
        categoryId,
        systemId,
        summary: 'Test ticket',
        description: 'Short'
      })

    expect(response.status).toBe(400)
    expect(response.body.errors[0]).toContain('Description must be at least 10 characters')
  })
})
