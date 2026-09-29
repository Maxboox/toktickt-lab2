import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { ITQueue } from './pages/ITQueue';
import { ITTicketDetail } from './pages/ITTicketDetail';
import { AdminUsers } from './pages/AdminUsers';
import { CreateTicket } from './pages/CreateTicket';
import { MyTickets } from './pages/MyTickets';
import { TicketDetail } from './pages/TicketDetail';
import { AppShell } from './components/AppShell';

import './styles/theme.css';

const Router: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  // Écouter les changements d'URL (popstate)
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (isLoading) {
    return <div className="loading-state"><div className="loading-spinner" /></div>;
  }

  if (!user) return <Login />;
  if (user.mustChangePassword) return <ChangePassword />;

  // Admin - Users
  if (path.startsWith('/admin/users')) {
    return <AppShell><AdminUsers /></AppShell>;
  }

  // IT Staff / Admin
  if (user.role === 'IT_STAFF' || user.role === 'ADMINISTRATOR') {
    // Ticket detail
    if (path.startsWith('/it/tickets/')) {
      const id = parseInt(path.split('/')[3]);
      if (!isNaN(id)) {
        return <AppShell><ITTicketDetail ticketId={id} /></AppShell>;
      }
    }
    // Queue
    if (path === '/it' || path === '/it/queue' || path === '/' || path === '') {
      return <AppShell><ITQueue /></AppShell>;
    }
  }

  // Requester
  if (user.role === 'REQUESTER') {
    if (path === '/create' || path.startsWith('/create')) {
      return <AppShell><CreateTicket /></AppShell>;
    }
    if (path.startsWith('/tickets/')) {
      const id = parseInt(path.split('/')[2]);
      if (!isNaN(id)) {
        return <AppShell><TicketDetail ticketId={id} onBack={() => {
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }} /></AppShell>;
      }
    }
    return <AppShell><MyTickets /></AppShell>;
  }

  return <AppShell><div>Aucune page disponible pour votre rôle.</div></AppShell>;
};

const App: React.FC = () => (
  <AuthProvider>
    <Router />
  </AuthProvider>
);

export default App;
