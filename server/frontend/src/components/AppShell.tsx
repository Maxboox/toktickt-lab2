import React from 'react';
import { useAuth } from '../context/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
}

const roleLabel: Record<string, string> = {
  REQUESTER: 'Requester',
  IT_STAFF: 'IT Support',
  ADMINISTRATOR: 'Administrator',
};

const roleColor: Record<string, string> = {
  REQUESTER: '#e8f1ff',
  IT_STAFF: '#eef6ee',
  ADMINISTRATOR: '#f3e8ff',
};

const roleTextColor: Record<string, string> = {
  REQUESTER: '#1a4e8a',
  IT_STAFF: '#1a5f2a',
  ADMINISTRATOR: '#6b21a8',
};

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const path = window.location.pathname;

  if (!user) return <>{children}</>;

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const navItems: { label: string; path: string }[] = [];
  if (user.role === 'REQUESTER') {
    navItems.push({ label: 'My Tickets', path: '/' });
    navItems.push({ label: 'Create Ticket', path: '/create' });
  }
  if (user.role === 'IT_STAFF' || user.role === 'ADMINISTRATOR') {
    navItems.push({ label: 'Ticket Queue', path: '/it/queue' });
  }
  if (user.role === 'ADMINISTRATOR') {
    navItems.push({ label: 'Users', path: '/admin/users' });
  }

  const isActive = (p: string) => p === path || (p !== '/' && path.startsWith(p));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--zen-bg, #f5f7f5)' }}>
      {/* Header */}
      <header style={{
        background: '#1a5f2a',
        color: 'white',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}
               onClick={() => navigate(user.role === 'REQUESTER' ? '/' : '/it/queue')}>
            🎫 TikTockIT
          </div>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => { e.preventDefault(); navigate(item.path); }}
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  opacity: isActive(item.path) ? 1 : 0.75,
                  borderBottom: isActive(item.path) ? '2px solid white' : '2px solid transparent',
                  paddingBottom: '4px',
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem' }}>{user.name}</span>
            <span style={{
              background: roleColor[user.role],
              color: roleTextColor[user.role],
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600,
            }}>
              {roleLabel[user.role]}
            </span>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
};
