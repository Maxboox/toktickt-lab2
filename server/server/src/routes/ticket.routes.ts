import express from 'express'
import { createTicket } from '../controllers/ticket.controller'

const router = express.Router()
router.post('/tickets', createTicket)
export default router
