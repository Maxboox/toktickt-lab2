import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/api';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

const rules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Include upper and lower case letters', test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p) },
  { label: 'Include a number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Include a special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const ChangePassword: React.FC = () => {
  const { refresh } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirm) {
      setError('New passwords do not match');
      return;
    }
    if (!rules.every(r => r.test(newPassword))) {
      setError('New password does not meet the rules');
      return;
    }

    setBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--zen-bg, #f5f7f5)',
      padding: '1rem',
    }}>
      <Card style={{ maxWidth: 460, width: '100%' }}>
        <h1 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#1a5f2a' }}>
          Change Your Password
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
          You must change your password to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
              Current (temporary) password
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={busy}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
              New password
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={busy}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
              Confirm new password
            </label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={busy}
            />
          </div>

          <div style={{
            background: '#eef6ee',
            padding: '0.85rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}>
            <strong style={{ display: 'block', marginBottom: '0.4rem' }}>Password must:</strong>
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              {rules.map(r => (
                <li key={r.label} style={{
                  color: r.test(newPassword) ? '#1a5f2a' : '#666',
                }}>
                  {r.test(newPassword) ? '✓ ' : '• '}{r.label}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              background: '#fdecea',
              color: '#b3261e',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}>
              ⚠️ {error}
            </div>
          )}

          <Button type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
