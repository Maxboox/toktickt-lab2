import React, { useEffect, useState } from 'react';
import { getITQueue, QueueFilters, ITTicket } from '../services/api';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const statusColors: Record<string, string> = {
  NEW: '#e8f1ff',
  OPEN: '#fff4e5',
  IN_PROGRESS: '#eef6ee',
  WAITING_FOR_REQUESTER: '#fef9e7',
  RESOLVED: '#e6f7ec',
  CLOSED: '#e9ecef',
  REOPENED: '#fdecea',
  CANCELLED: '#e9ecef',
};

const priorityColors: Record<string, string> = {
  LOW: '#e9ecef',
  MEDIUM: '#e8f1ff',
  HIGH: '#fff4e5',
  URGENT: '#fdecea',
  CRITICAL: '#f8d7da',
};

export const ITQueue: React.FC = () => {
  const [tickets, setTickets] = useState<ITTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 0 });

  const [filters, setFilters] = useState<QueueFilters>({
    page: 1,
    pageSize: 20,
    sort: 'updatedAt',
    order: 'desc',
  });

  const [searchInput, setSearchInput] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getITQueue(filters);
      setTickets(data.tickets);
      setPagination(data.pagination);
    } catch (e: any) {
      setError(e.message || 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const updateFilter = (key: keyof QueueFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Ticket Queue</h1>
        <span style={{ color: '#666', fontSize: '0.9rem' }}>
          {pagination.total} ticket{pagination.total > 1 ? 's' : ''}
        </span>
      </div>

      <Card style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#666' }}>Search</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Input
                placeholder="Ticket #, summary, requester…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && updateFilter('search', searchInput)}
              />
              <Button onClick={() => updateFilter('search', searchInput)}>🔍</Button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#666' }}>Status</label>
            <Select value={filters.status || ''} onChange={(e) => updateFilter('status', e.target.value)}>
              <option value="">All</option>
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_REQUESTER">Waiting for Requester</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REOPENED">Reopened</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#666' }}>IT Priority</label>
            <Select value={filters.priority || ''} onChange={(e) => updateFilter('priority', e.target.value)}>
              <option value="">All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#666' }}>Owner</label>
            <Select value={filters.owner === undefined ? '' : String(filters.owner)}
                    onChange={(e) => updateFilter('owner', e.target.value)}>
              <option value="">All</option>
              <option value="unassigned">Unassigned</option>
            </Select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#666' }}>Sort</label>
            <Select value={filters.sort || 'updatedAt'} onChange={(e) => updateFilter('sort', e.target.value)}>
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Created Date</option>
              <option value="itPriority">IT Priority</option>
              <option value="ticketNumber">Ticket Number</option>
            </Select>
          </div>
        </div>
      </Card>

      {loading && (
        <Card><div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading…</div></Card>
      )}

      {error && (
        <Card><div style={{ color: '#b3261e', padding: '1rem' }}>⚠️ {error}</div></Card>
      )}

      {!loading && !error && tickets.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            No tickets match your filters.
          </div>
        </Card>
      )}

      {!loading && !error && tickets.length > 0 && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f5f7f5', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Ticket</th>
                <th style={{ padding: '0.75rem' }}>Summary</th>
                <th style={{ padding: '0.75rem' }}>Requester</th>
                <th style={{ padding: '0.75rem' }}>Req. Priority</th>
                <th style={{ padding: '0.75rem' }}>IT Priority</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Owner</th>
                <th style={{ padding: '0.75rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {t.ticketNumber}
                  </td>
                  <td style={{ padding: '0.75rem', maxWidth: 280 }}>{t.summary}</td>
                  <td style={{ padding: '0.75rem' }}>{t.requester?.name}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      background: priorityColors[t.requestedPriority] || '#e9ecef',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}>
                      {t.requestedPriority}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {t.itPriority ? (
                      <span style={{
                        background: priorityColors[t.itPriority] || '#e9ecef',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                      }}>
                        {t.itPriority}
                      </span>
                    ) : (
                      <span style={{ color: '#aaa', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      background: statusColors[t.currentStatus] || '#e9ecef',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}>
                      {t.currentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {t.owner ? t.owner.name : <span style={{ color: '#aaa' }}>Unassigned</span>}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <Button onClick={() => navigate(`/it/tickets/${t.id}`)}>Open</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <Button
            disabled={pagination.page <= 1}
            onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
          >
            ← Prev
          </Button>
          <span style={{ padding: '8px 12px', fontSize: '0.9rem' }}>
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
};
