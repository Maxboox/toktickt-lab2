import React, { useState, useEffect } from 'react'
import { useRequester } from '../context/RequesterContext'
import { getRequesters, Requester } from '../services/api'
import { Button } from '../components/common/Button'
import { Select } from '../components/common/Select'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'

export const RequesterSelection: React.FC = () => {
  const { selectRequester } = useRequester()
  const [requesters, setRequesters] = useState<Requester[]>([])
  const [selectedId, setSelectedId] = useState<number | string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRequesters()
  }, [])

  const loadRequesters = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getRequesters()
      setRequesters(data)
      if (data.length === 1) {
        setSelectedId(data[0].id)
      }
    } catch (err) {
      setError('Failed to load requesters. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) {
      setError('Please select a requester')
      return
    }
    try {
      await selectRequester(Number(selectedId))
    } catch (err) {
      setError('Failed to select requester. Please try again.')
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading requesters..." />
  }

  if (error && requesters.length === 0) {
    return <ErrorState message={error} onRetry={loadRequesters} />
  }

  return (
    <div className="container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%' }}>
        <h1 style={{ 
          fontSize: 'var(--font-size-xxl)', 
          color: 'var(--primary-green)',
          marginBottom: 'var(--spacing-sm)'
        }}>
          TokTickT
        </h1>
        <p style={{ 
          fontSize: 'var(--font-size-sm)', 
          color: '#6B7A74',
          marginBottom: 'var(--spacing-lg)'
        }}>
          Selected a Development Requester to test requester-specific ticket behavior.
          This is not a login screen. Authentication and role-based access will be introduced in Lab 3.
        </p>

        <form onSubmit={handleSubmit}>
          <Select
            label="Development Requester"
            required
            options={requesters.map(r => ({ id: r.id, name: `${r.name} (${r.email})` }))}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            placeholder="Select a requester..."
            error={error && !selectedId ? error : undefined}
          />

          <Button
            type="submit"
            variant="primary"
            disabled={!selectedId}
            style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
          >
            Continue
          </Button>
        </form>
      </div>
    </div>
  )
}
