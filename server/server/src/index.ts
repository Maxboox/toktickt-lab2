import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes'
import itRoutes from './routes/it.routes'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api', authRoutes)
app.use('/api', itRoutes)

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`)
})
