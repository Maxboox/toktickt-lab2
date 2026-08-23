import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import requesterRoutes from './routes/requester.routes'
import ticketRoutes from './routes/ticket.routes'
import attachmentRoutes from './routes/attachment.routes'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Routes
app.use('/api', requesterRoutes)
app.use('/api', ticketRoutes)
app.use('/api', attachmentRoutes)

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`)
})
