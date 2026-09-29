import React, { useEffect, useState } from 'react';
import {
  adminGetUsers, adminCreateUser, adminUpdateUser,
  adminSetInitialPassword, AuthUser, Role,
} from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';

const roleLabel: Record<Role, string> = {
  REQUESTER: 'Requester',
  IT_STAFF: 'IT Support',
  ADMINISTRATOR: 'Administrator',
};

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'' | Role>('');
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminGetUsers({
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(data.users);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [search, roleFilter]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Users</h1>
        <Button onClick={() => { setShowCreate(true); setEditing(null); }}>+ Create User</Button>
      </div>

      <Card style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
            <option value="">All roles</option>
            <option value="REQUESTER">Requester</option>
            <option value="IT_STAFF">IT Support</option>
            <option value="ADMINISTRATOR">Administrator</option>
          </Select>
        </div>
      </Card>

      {loading && <Card><div style={{ textAlign: 'center', padding: '2rem' }}>Loading…</div></Card>}
      {error && <Card><div style={{ color: '#b3261e', padding: '1rem' }}>⚠️ {error}</div></Card>}

      {(showCreate || editing) && (
        <Card style={{ marginBottom: '1rem', background: '#f9fbf9' }}>
          <UserForm
            user={editing}
            onCancel={() => { setShowCreate(false); setEditing(null); }}
            onSaved={() => { setShowCreate(false); setEditing(null); load(); }}
          />
        </Card>
      )}

      {!loading && !error && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f5f7f5', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Role</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem' }}>{u.name}</td>
                  <td style={{ padding: '0.75rem' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      background: u.role === 'ADMINISTRATOR' ? '#f3e8ff' : u.role === 'IT_STAFF' ? '#eef6ee' : '#e8f1ff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      background: u.isActive !== false ? '#e6f7ec' : '#fdecea',
                      color: u.isActive !== false ? '#1a5f2a' : '#b3261e',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}>
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <Button onClick={() => { setEditing(u); setShowCreate(false); }}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

// ============================================================
// Sous-composant : formulaire création/édition
// ============================================================
interface UserFormProps {
  user: AuthUser | null;
  onCancel: () => void;
  onSaved: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onCancel, onSaved }) => {
  const isCreate = !user;
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState<Role>(user?.role || 'REQUESTER');
  const [isActive, setIsActive] = useState(user?.isActive !== false);
  const [initialPassword, setInitialPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    try {
      if (isCreate) {
        await adminCreateUser({ name, email, role, isActive, initialPassword });
        setMsg('User created successfully.');
      } else if (user) {
        await adminUpdateUser(user.id, { name, email, role, isActive });
        setMsg('User updated.');
      }
      setTimeout(onSaved, 600);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    const pwd = prompt('New initial password (user will change it on next login):');
    if (!pwd) return;
    try {
      await adminSetInitialPassword(user.id, pwd);
      setMsg('Initial password set. The user must change it on next login.');
    } catch (e: any) {
      setErr(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>
        {isCreate ? 'Create New User' : `Edit — ${user?.name}`}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.85rem' }}>Full Name *</label>
          <Input value={name} onChange={e => setName(e.target.value)} required disabled={busy} />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem' }}>Email Address *</label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={busy} />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem' }}>Role *</label>
          <Select value={role} onChange={e => setRole(e.target.value as Role)} disabled={busy}>
            <option value="REQUESTER">Requester</option>
            <option value="IT_STAFF">IT Support</option>
            <option value="ADMINISTRATOR">Administrator</option>
          </Select>
        </div>
        <div>
          <label style={{ fontSize: '0.85rem' }}>Status</label>
          <Select value={isActive ? '1' : '0'} onChange={e => setIsActive(e.target.value === '1')} disabled={busy}>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </Select>
        </div>

        {isCreate && (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.85rem' }}>Initial Password * (user must change it on first login)</label>
            <Input
              type="text"
              value={initialPassword}
              onChange={e => setInitialPassword(e.target.value)}
              placeholder="e.g. Welcome123!"
              required
              disabled={busy}
            />
          </div>
        )}

        {!isCreate && (
          <div style={{ gridColumn: '1 / -1' }}>
            <Button type="button" onClick={handleResetPassword} disabled={busy}>
              Reset Initial Password
            </Button>
          </div>
        )}
      </div>

      {err && <div style={{ color: '#b3261e', marginTop: '0.75rem' }}>⚠️ {err}</div>}
      {msg && <div style={{ color: '#1a5f2a', marginTop: '0.75rem' }}>✓ {msg}</div>}

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
        <Button type="button" onClick={onCancel} disabled={busy}>Cancel</Button>
      </div>
    </form>
  );
};
