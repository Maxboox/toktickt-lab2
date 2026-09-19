import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('File type not allowed. Allowed: PDF, PNG, JPG, JPEG, DOC, DOCX'), false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

// POST /api/tickets/:id/attachments - Upload une pièce jointe
export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id)
    const requesterId = parseInt(req.body.requesterId)

    if (!requesterId) {
      return res.status(400).json({ error: 'requesterId is required' })
    }

    // Vérifier que le ticket existe et appartient au requester
    const ticket = await prisma.ticket.findFirst({
      where: { 
        id: ticketId,
        requesterId: requesterId
      }
    })

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found or you do not have permission' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Créer l'attachment dans la base de données
    const attachment = await prisma.attachment.create({
      data: {
        ticketId,
        requesterId,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: req.file.path,
        uploadDate: new Date()
      }
    })

    res.status(201).json({
      id: attachment.id,
      ticketId: attachment.ticketId,
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
      uploadDate: attachment.uploadDate,
      downloadUrl: `/api/attachments/${attachment.id}/download?requesterId=${requesterId}`
    })
  } catch (error) {
    console.error('Upload attachment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// GET /api/attachments/:id/download - Télécharger une pièce jointe
export const downloadAttachment = async (req: Request, res: Response) => {
  try {
    const attachmentId = parseInt(req.params.id)
    const requesterId = parseInt(req.query.requesterId as string)

    if (!requesterId) {
      return res.status(400).json({ error: 'requesterId is required' })
    }

    // Récupérer l'attachment
    const attachment = await prisma.attachment.findFirst({
      where: { 
        id: attachmentId,
        isDeleted: false
      },
      include: {
        ticket: true
      }
    })

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' })
    }

    // Vérifier l'ownership (le requester doit être le propriétaire du ticket)
    if (attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: 'You do not have permission to download this file' })
    }

    // Vérifier que le fichier existe
    if (!fs.existsSync(attachment.filePath)) {
      return res.status(404).json({ error: 'File not found on server' })
    }

    // Télécharger le fichier
    res.download(attachment.filePath, attachment.fileName)
  } catch (error) {
    console.error('Download attachment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE /api/attachments/:id - Suppression douce d'une pièce jointe
export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const attachmentId = parseInt(req.params.id)
    const requesterId = parseInt(req.body.requesterId)
    const deletionReason = req.body.deletionReason || 'Deleted by requester'

    if (!requesterId) {
      return res.status(400).json({ error: 'requesterId is required' })
    }

    // Récupérer l'attachment
    const attachment = await prisma.attachment.findFirst({
      where: { 
        id: attachmentId,
        isDeleted: false
      },
      include: {
        ticket: true
      }
    })

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' })
    }

    // Vérifier l'ownership
    if (attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: 'You do not have permission to delete this file' })
    }

    // Soft-delete
    const deletedAttachment = await prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletionReason
      }
    })

    res.json({
      id: deletedAttachment.id,
      isDeleted: deletedAttachment.isDeleted,
      deletedAt: deletedAttachment.deletedAt,
      deletionReason: deletedAttachment.deletionReason,
      message: 'Attachment deleted successfully'
    })
  } catch (error) {
    console.error('Delete attachment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
