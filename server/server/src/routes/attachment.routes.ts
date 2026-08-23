import express from 'express'
import { 
  upload, 
  uploadAttachment, 
  downloadAttachment, 
  deleteAttachment 
} from '../controllers/attachment.controller'

const router = express.Router()

// Upload une pièce jointe sur un ticket
router.post('/tickets/:id/attachments', upload.single('file'), uploadAttachment)

// Télécharger une pièce jointe
router.get('/attachments/:id/download', downloadAttachment)

// Supprimer une pièce jointe (soft-delete)
router.delete('/attachments/:id', deleteAttachment)

export default router
