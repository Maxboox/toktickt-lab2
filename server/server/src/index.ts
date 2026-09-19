import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import cookieParser from 'cookie-parser'
import ticketRoutes from './routes/ticket.routes'
import attachmentRoutes from './routes/attachment.routes'
import authRoutes from './routes/auth.routes'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api', authRoutes)
app.use('/api', ticketRoutes)
app.use('/api', attachmentRoutes)

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`)
})
