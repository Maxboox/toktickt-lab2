import React, { useState, useEffect } from 'react'
import { useRequester } from '../context/RequesterContext'
import { 
  getTicketById, 
  getCategories, 
  getSystems,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
  Ticket, 
  Category,
  System,
  Attachment
} from '../services/api'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Textarea } from '../components/common/Textarea'
import { Badge } from '../components/common/Badge'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'

interface TicketDetailProps {
  ticketId: number
  onBack?: () => void
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, onBack }) => {
  const { requester } = useRequester()
  
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [systems, setSystems] = useState<System[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (requester) {
      loadData()
    }
  }, [ticketId, requester])

  const loadData = async () => {
    if (!requester) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const [ticketData, cats, sys] = await Promise.all([
        getTicketById(ticketId, requester.id),
        getCategories(),
        getSystems()
      ])
      
      setTicket(ticketData)
      setCategories(cats)
      setSystems(sys)
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size exceeds 5MB limit')
        return
      }
      
      // Vérifier le type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setUploadError('File type not allowed. Allowed: PDF, PNG, JPG, JPEG, DOC, DOCX')
        return
      }
      
      setSelectedFile(file)
      setUploadError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !ticket || !requester) return
    
    try {
      setIsUploading(true)
      setUploadError(null)
      setUploadSuccess(false)
      
      await uploadAttachment(ticket.id, requester.id, selectedFile)
      
      // Recharger le ticket pour mettre à jour les pièces jointes
      await loadData()
      
      setSelectedFile(null)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload attachment')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!requester) return
    if (!confirm('Are you sure you want to delete this attachment?')) return
    
    try {
      await deleteAttachment(attachmentId, requester.id)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to delete attachment')
    }
  }

  const handleDownload = (attachmentId: number) => {
    if (!requester) return
    window.open(downloadAttachment(attachmentId, requester.id), '_blank')
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      NEW: 'NEW',
      IN_PROGRESS: 'IN_PROGRESS',
      RESOLVED: 'RESOLVED',
      CLOSED: 'CLOSED'
    }
    return <Badge type={statusMap[status] || 'NEW'}>{status.replace('_', ' ')}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, string> = {
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH',
      URGENT: 'URGENT'
    }
    return <Badge type={priorityMap[priority] || 'MEDIUM'}>{priority}</Badge>
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (isLoading) {
    return <LoadingState message="Loading ticket details..." />
  }

  if (error || !ticket) {
    return <ErrorState message={error || 'Ticket not found'} onRetry={onBack} />
  }

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h1>Ticket #{ticket.ticketNumber}</h1>
          <p style={{ color: '#6B7A74' }}>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
        </div>
        {onBack && (
          <Button variant="secondary" onClick={onBack}>
            ← Back to My Tickets
          </Button>
        )}
      </div>

      {/* Informations du ticket */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <Input label="Ticket Number" value={ticket.ticketNumber} readOnly />
          <Input label="Ticket Date" value={new Date(ticket.createdAt).toLocaleDateString()} readOnly />
        </div>
        
        <Input label="Requester" value={`${ticket.requester.name} (${ticket.requester.email})`} readOnly />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <Input label="Category" value={ticket.category?.name || '-'} readOnly />
          <Input label="Related System" value={ticket.system?.name || '-'} readOnly />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div>
            <label className="form-label">Requested Priority</label>
            <div>{getPriorityBadge(ticket.requestedPriority)}</div>
          </div>
          <div>
            <label className="form-label">Status</label>
            <div>{getStatusBadge(ticket.currentStatus)}</div>
          </div>
        </div>
        
        <Input label="Summary" value={ticket.summary} readOnly />
        
        <Textarea label="Description" value={ticket.description} readOnly rows={4} />
      </div>

      {/* Pièces jointes */}
      <div className="card">
        <h3 className="card-title">Attachments</h3>
        
        {/* Upload */}
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-md)',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          border: '2px dashed var(--border-color)',
          borderRadius: 'var(--border-radius-sm)'
        }}>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={isUploading}
          />
          <Button 
            variant="secondary" 
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading}
          >
            Choose File
          </Button>
          {selectedFile && (
            <span style={{ flex: 1 }}>
              {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </span>
          )}
          <Button 
            variant="primary" 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            loading={isUploading}
          >
            Upload
          </Button>
          {uploadSuccess && (
            <span style={{ color: 'var(--success)' }}>✅ Uploaded!</span>
          )}
          {uploadError && (
            <span style={{ color: 'var(--error)', width: '100%' }}>❌ {uploadError}</span>
          )}
        </div>

        {/* Liste des pièces jointes */}
        {ticket.attachments && ticket.attachments.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>File Name</th>
                <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Type</th>
                <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Size</th>
                <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Uploaded</th>
                <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ticket.attachments.map((attachment) => (
                <tr key={attachment.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: 'var(--spacing-sm)' }}>{attachment.fileName}</td>
                  <td style={{ padding: 'var(--spacing-sm)' }}>{attachment.fileType}</td>
                  <td style={{ padding: 'var(--spacing-sm)' }}>{formatFileSize(attachment.fileSize)}</td>
                  <td style={{ padding: 'var(--spacing-sm)' }}>
                    {new Date(attachment.uploadDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 'var(--spacing-sm)' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleDownload(attachment.id)}
                      >
                        Download
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#6B7A74', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
            No attachments yet
          </p>
        )}
      </div>
    </div>
  )
}
