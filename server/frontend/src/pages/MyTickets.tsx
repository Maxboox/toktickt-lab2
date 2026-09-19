import React, { useState, useEffect } from 'react'
import { useRequester } from '../context/RequesterContext'
import { getTickets, getCategories, Ticket, Category, TicketFilters } from '../services/api'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Select } from '../components/common/Select'
import { Badge } from '../components/common/Badge'
import { LoadingState } from '../components/common/LoadingState'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'

export const MyTickets: React.FC = () => {
  const { requester } = useRequester()
  
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrevious: false
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filters, setFilters] = useState<Omit<TicketFilters, 'requesterId'>>({
    search: '',
    categoryId: undefined,
    status: '',
    sort: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 10
  })

  useEffect(() => {
    if (requester) {
      loadTickets()
      loadCategories()
    }
  }, [requester, filters])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const loadTickets = async () => {
    if (!requester) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await getTickets({
        requesterId: requester.id,
        ...filters
      })
      
      setTickets(response.items)
      setPagination(response.pagination)
    } catch (err) {
      setError('Failed to load tickets. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
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

  if (isLoading && tickets.length === 0) {
    return <LoadingState message="Loading your tickets..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadTickets} />
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h1>My Tickets</h1>
        <Button variant="primary" onClick={() => window.location.href = '/create'}>
          + New Ticket
        </Button>
      </div>

      {/* Filtres */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <Input
              placeholder="Search by summary or ticket number..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <Select
              options={categories.map(c => ({ id: c.id, name: c.name }))}
              value={filters.categoryId || ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="All Categories"
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <Select
              options={[
                { id: 'NEW', name: 'New' },
                { id: 'IN_PROGRESS', name: 'In Progress' },
                { id: 'RESOLVED', name: 'Resolved' },
                { id: 'CLOSED', name: 'Closed' }
              ]}
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              placeholder="All Status"
            />
          </div>
          <Button type="submit" variant="primary">Search</Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => {
              setFilters({
                search: '',
                categoryId: undefined,
                status: '',
                sort: 'createdAt',
                order: 'desc',
                page: 1,
                limit: 10
              })
            }}
          >
            Clear
          </Button>
        </form>
      </div>

      {/* Liste des tickets */}
      {tickets.length === 0 ? (
        <div className="card">
          <EmptyState message={filters.search || filters.categoryId || filters.status ? 'No tickets match your filters' : 'You have no tickets yet'} />
        </div>
      ) : (
        <>
          <div className="card" style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Ticket #</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Summary</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Priority</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    style={{ 
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--pale-green)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => window.location.href = `/tickets/${ticket.id}`}
                  >
                    <td style={{ padding: 'var(--spacing-sm)' }}>
                      <strong>{ticket.ticketNumber}</strong>
                    </td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>{ticket.summary}</td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>{ticket.category?.name || '-'}</td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>{getPriorityBadge(ticket.requestedPriority)}</td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>{getStatusBadge(ticket.currentStatus)}</td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: 'var(--spacing-lg)'
            }}>
              <span>
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - 
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
              </span>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <Button 
                  variant="secondary" 
                  disabled={!pagination.hasPrevious}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  ← Previous
                </Button>
                <span style={{ padding: 'var(--spacing-sm)', display: 'flex', alignItems: 'center' }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button 
                  variant="secondary" 
                  disabled={!pagination.hasNext}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
