import React from 'react'
import { RequesterProvider, useRequester } from './context/RequesterContext'
import { RequesterSelection } from './pages/RequesterSelection'
import { CreateTicket } from './pages/CreateTicket'
import { MyTickets } from './pages/MyTickets'

import './styles/theme.css'

const AppContent: React.FC = () => {
  const { requester, isLoading } = useRequester()

  if (isLoading) {
    return <div className="loading-state"><div className="loading-spinner" /></div>
  }

  if (!requester) {
    return <RequesterSelection />
  }

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
