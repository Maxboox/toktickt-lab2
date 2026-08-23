import express from 'express'
import { createTicket, getTickets } from '../controllers/ticket.controller'

const router = express.Router()

router.post('/tickets', createTicket)
router.get('/tickets', getTickets)

export default router
