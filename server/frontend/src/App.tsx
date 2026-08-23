import React, { useState } from 'react'
import { RequesterProvider, useRequester } from './context/RequesterContext'
import { RequesterSelection } from './pages/RequesterSelection'
import { CreateTicket } from './pages/CreateTicket'
import { MyTickets } from './pages/MyTickets'
import { TicketDetail } from './pages/TicketDetail'

import './styles/theme.css'

// Simple router pour la démo
const AppContent: React.FC = () => {
  const { requester, isLoading } = useRequester()
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list')
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)

  if (isLoading) {
    return <div className="loading-state"><div className="loading-spinner" /></div>
  }

  if (!requester) {
    return <RequesterSelection />
  }

  // Navigation simple : pour la démo, on utilise les URLs
  const path = window.location.pathname
  
  if (path === '/create' || path.startsWith('/create')) {
    return <CreateTicket />
  }
  
  if (path.startsWith('/tickets/')) {
    const id = parseInt(path.split('/')[2])
    if (!isNaN(id)) {
      return <TicketDetail ticketId={id} onBack={() => {
        window.history.pushState({}, '', '/')
        setView('list')
      }} />
    }
  }

  // Par défaut : My Tickets
  return <MyTickets />
}

const App: React.FC = () => {
  return (
    <RequesterProvider>
      <AppContent />
    </RequesterProvider>
  )
}

export default App
