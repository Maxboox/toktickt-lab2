import express from 'express'
import { createTicket, getTickets, getTicketById } from '../controllers/ticket.controller'

const router = express.Router()

router.post('/tickets', createTicket)
router.get('/tickets', getTickets)
router.get('/tickets/:id', getTicketById)

export default router
