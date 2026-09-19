const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

export interface Requester {
  id: number
  name: string
  email: string
}

export interface Category {
  id: number
  name: string
}

export interface System {
  id: number
  name: string
}

// Requesters
export const getRequesters = async (): Promise<Requester[]> => {
  const response = await fetch(`${API_URL}/requesters`)
  if (!response.ok) {
    throw new Error('Failed to fetch requesters')
  }
  const data = await response.json()
  return data.requesters
}

export const selectRequester = async (requesterId: number): Promise<{ requester: Requester }> => {
  const response = await fetch(`${API_URL}/auth/select-requester`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requesterId })
  })
  if (!response.ok) {
    throw new Error('Failed to select requester')
  }
  return response.json()
}

export const getCurrentRequester = async (): Promise<Requester | null> => {
  const response = await fetch(`${API_URL}/auth/current-requester`)
  if (response.status === 401) {
    return null
  }
  if (!response.ok) {
    throw new Error('Failed to get current requester')
  }
  const data = await response.json()
  return data.requester
}

export const checkRequester = async (): Promise<{ isSelected: boolean; requester?: Requester }> => {
  const response = await fetch(`${API_URL}/auth/check`)
  if (!response.ok) {
    throw new Error('Failed to check requester')
  }
  return response.json()
}

// Tickets
export interface CreateTicketData {
  requesterId: number
  categoryId: number
  systemId: number
  summary: string
  requestedPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  description: string
}

export interface Ticket {
  id: number
  ticketNumber: string
  ticketDate: string
  requesterId: number
  requester: { id: number; name: string; email: string }
  categoryId: number
  category: { id: number; name: string }
  systemId: number
  system: { id: number; name: string }
  summary: string
  requestedPriority: string
  currentStatus: string
  description: string
  createdAt: string
  updatedAt: string
  attachments?: Attachment[]
}

export interface Attachment {
  id: number
  fileName: string
  fileType: string
  fileSize: number
  uploadDate: string
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_URL}/categories`)
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }
  const data = await response.json()
  return data.categories
}

export const getSystems = async (): Promise<System[]> => {
  const response = await fetch(`${API_URL}/systems`)
  if (!response.ok) {
    throw new Error('Failed to fetch systems')
  }
  const data = await response.json()
  return data.systems
}

export const createTicket = async (data: CreateTicketData): Promise<Ticket> => {
  const response = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errors?.[0] || 'Failed to create ticket')
  }
  return response.json()
}

// Tickets list
export interface TicketListResponse {
  items: Ticket[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

export interface TicketFilters {
  requesterId: number
  search?: string
  categoryId?: number
  status?: string
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export const getTickets = async (filters: TicketFilters): Promise<TicketListResponse> => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })
  
  const response = await fetch(`${API_URL}/tickets?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch tickets')
  }
  return response.json()
}

// Ticket Detail
export const getTicketById = async (id: number, requesterId: number): Promise<Ticket> => {
  const response = await fetch(`${API_URL}/tickets/${id}?requesterId=${requesterId}`)
  if (response.status === 404) {
    throw new Error('Ticket not found')
  }
  if (response.status === 403) {
    throw new Error('You do not have permission to view this ticket')
  }
  if (!response.ok) {
    throw new Error('Failed to fetch ticket')
  }
  return response.json()
}

// Attachments
export const uploadAttachment = async (ticketId: number, requesterId: number, file: File): Promise<Attachment> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('requesterId', String(requesterId))
  
  const response = await fetch(`${API_URL}/tickets/${ticketId}/attachments`, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload attachment')
  }
  return response.json()
}

export const deleteAttachment = async (attachmentId: number, requesterId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/attachments/${attachmentId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requesterId })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete attachment')
  }
}

export const downloadAttachment = (attachmentId: number, requesterId: number): string => {
  return `${API_URL}/attachments/${attachmentId}/download?requesterId=${requesterId}`
}
