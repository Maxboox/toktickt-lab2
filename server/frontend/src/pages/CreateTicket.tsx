import React, { useState, useEffect } from 'react'
import { useRequester } from '../context/RequesterContext'
import { 
  getCategories, 
  getSystems, 
  createTicket, 
  Category, 
  System 
} from '../services/api'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Textarea } from '../components/common/Textarea'
import { Select } from '../components/common/Select'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'

export const CreateTicket: React.FC = () => {
  const { requester } = useRequester()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [systems, setSystems] = useState<System[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<Ticket | null>(null)
  
  const [formData, setFormData] = useState({
    categoryId: '',
    systemId: '',
    summary: '',
    requestedPriority: 'MEDIUM',
    description: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [cats, sys] = await Promise.all([
        getCategories(),
        getSystems()
      ])
      setCategories(cats)
      setSystems(sys)
    } catch (err) {
      setError('Failed to load data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.categoryId) newErrors.categoryId = 'Category is required'
    if (!formData.systemId) newErrors.systemId = 'System is required'
    if (!formData.summary.trim()) newErrors.summary = 'Summary is required'
    if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requester) return
    
    if (!validate()) return
    
    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(null)
      
      const ticket = await createTicket({
        requesterId: requester.id,
        categoryId: parseInt(formData.categoryId),
        systemId: parseInt(formData.systemId),
        summary: formData.summary.trim(),
        requestedPriority: formData.requestedPriority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        description: formData.description.trim()
      })
      
      setSuccess(ticket)
      
      // Réinitialiser le formulaire après succès
      setFormData({
        categoryId: '',
        systemId: '',
        summary: '',
        requestedPriority: 'MEDIUM',
        description: ''
      })
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur du champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading form data..." />
  }

  if (error && categories.length === 0) {
    return <ErrorState message={error} onRetry={loadData} />
  }

  if (success) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: 'var(--success)' }}>✅ Ticket Created Successfully!</h2>
        <p><strong>Ticket Number:</strong> {success.ticketNumber}</p>
        <p><strong>Status:</strong> {success.currentStatus}</p>
        <p><strong>Summary:</strong> {success.summary}</p>
        <Button 
          variant="primary" 
          onClick={() => setSuccess(null)}
          style={{ marginTop: 'var(--spacing-md)' }}
        >
          Create Another Ticket
        </Button>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Create New Ticket</h1>
      
      <form onSubmit={handleSubmit} className="card">
        {/* Champs système (read-only) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <Input
            label="Ticket Number"
            value="Auto-generated"
            readOnly
          />
          <Input
            label="Ticket Date"
            value={new Date().toLocaleDateString()}
            readOnly
          />
        </div>
        
        <Input
          label="Requester"
          value={requester ? `${requester.name} (${requester.email})` : 'Not selected'}
          readOnly
        />
        
        <hr style={{ margin: 'var(--spacing-lg) 0' }} />
        
        {/* Champs utilisateur */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <Select
            label="Category"
            required
            options={categories.map(c => ({ id: c.id, name: c.name }))}
            value={formData.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            placeholder="Select category"
            error={errors.categoryId}
          />
          <Select
            label="Related System"
            required
            options={systems.map(s => ({ id: s.id, name: s.name }))}
            value={formData.systemId}
            onChange={(e) => handleChange('systemId', e.target.value)}
            placeholder="Select system"
            error={errors.systemId}
          />
        </div>
        
        <Select
          label="Requested Priority"
          options={[
            { id: 'LOW', name: 'Low' },
            { id: 'MEDIUM', name: 'Medium' },
            { id: 'HIGH', name: 'High' },
            { id: 'URGENT', name: 'Urgent' }
          ]}
          value={formData.requestedPriority}
          onChange={(e) => handleChange('requestedPriority', e.target.value)}
        />
        
        <Input
          label="Summary"
          required
          value={formData.summary}
          onChange={(e) => handleChange('summary', e.target.value)}
          placeholder="Brief summary of the issue"
          error={errors.summary}
        />
        
        <Textarea
          label="Description"
          required
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Detailed description of the issue (minimum 10 characters)"
          error={errors.description}
          rows={5}
        />
        
        {error && (
          <div style={{ color: 'var(--error)', padding: 'var(--spacing-sm)', background: '#FFEBEE', borderRadius: '4px' }}>
            ❌ {error}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Create Ticket
          </Button>
          <Button type="reset" variant="secondary" onClick={() => {
            setFormData({
              categoryId: '',
              systemId: '',
              summary: '',
              requestedPriority: 'MEDIUM',
              description: ''
            })
            setErrors({})
          }}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}
