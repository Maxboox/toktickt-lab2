import React, { useEffect, useState } from 'react';
import {
  getITTicket, claimTicket, setITPriority, setTicketStatus,
  addPublicComment, addInternalNote, ITTicket,
} from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Textarea } from '../components/common/Textarea';
import { Input } from '../components/common/Input';

const STATUSES = ['NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'RESOLVED', 'CLOSED', 'REOPENED', 'CANCELLED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

interface Props { ticketId: number; }

export const ITTicketDetail: React.FC<Props> = ({ ticketId }) => {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'notes' | 'attachments'>('comments');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getITTicket(ticketId);
      setTicket(data.ticket);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [ticketId]);

  const back = () => {
    window.history.pushState({}, '', '/it/queue');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleClaim = async () => {
    if (!confirm('Claim this ticket as yours?')) return;
    setBusy(true);
    try { await claimTicket(ticketId); await load(); }
    catch (e: any) { alert(e.message); }
    finally { setBusy(false); }
  };

  const handlePriority = async (p: string) => {
    setBusy(true);
    try { await setITPriority(ticketId, p); await load(); }
    catch (e: any) { alert(e.message); }
    finally { setBusy(false); }
  };

  const handleStatus = async (s: string) => {
    let resolutionSummary: string | undefined;
    if (s === 'RESOLVED') {
      resolutionSummary = prompt('Resolution summary (visible to requester):') || undefined;
    }
    setBusy(true);
    try { await setTicketStatus(ticketId, s, resolutionSummary); await load(); }
    catch (e: any) { alert(e.message); }
    finally { setBusy(false); }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    setBusy(true);
    try {
      await addPublicComment(ticketId, commentInput.trim());
      setCommentInput('');
      await load();
    } catch (e: any) { alert(e.message); }
    finally { setBusy(false); }
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setBusy(true);
    try {
      await addInternalNote(ticketId, noteInput.trim());
      setNoteInput('');
      await load();
    } catch (e: any) { alert(e.message); }
    finally { setBusy(false); }
  };

  if (loading) return <Card><div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div></Card>;
  if (error)   return <Card><div style={{ padding: '1rem', color: '#b3261e' }}>⚠️ {error}</div></Card>;
  if (!ticket) return <Card><div style={{ padding: '1rem' }}>Ticket not found.</div></Card>;

  const publicComments = ticket.publicComments || [];
  const internalNotes  = ticket.internalNotes  || [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button onClick={back}>← Back to Queue</Button>
          <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#666' }}>
            {ticket.ticketNumber}
          </span>
        </div>
        {!ticket.owner && (
          <Button onClick={handleClaim} disabled={busy}>Claim this ticket</Button>
        )}
      </div>

      {/* Infos ticket */}
      <Card style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div><strong>Requester:</strong><div>{ticket.requester?.name}</div></div>
          <div><strong>Category:</strong><div>{ticket.category?.name}</div></div>
          <div><strong>System:</strong><div>{ticket.system?.name}</div></div>
          <div><strong>Owner:</strong><div>{ticket.owner?.name || 'Unassigned'}</div></div>
          <div><strong>Requested Priority:</strong><div>{ticket.requestedPriority}</div></div>
          <div>
            <strong>IT Priority:</strong>
            <Select value={ticket.itPriority || ''} onChange={(e) => handlePriority(e.target.value)} disabled={busy}>
              <option value="">—</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
          <div>
            <strong>Status:</strong>
            <Select value={ticket.currentStatus} onChange={(e) => handleStatus(e.target.value)} disabled={busy}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <strong>Summary:</strong>
          <div style={{ marginTop: '0.25rem' }}>{ticket.summary}</div>
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <strong>Description:</strong>
          <div style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{ticket.description}</div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #eee', marginBottom: '1rem' }}>
          {(['comments', 'notes', 'attachments'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem 0',
                borderBottom: activeTab === tab ? '2px solid #1a5f2a' : '2px solid transparent',
                color: activeTab === tab ? '#1a5f2a' : '#666',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab === 'comments' && `💬 Public Comments (${publicComments.length})`}
              {tab === 'notes' && `🔒 Internal Notes (${internalNotes.length})`}
              {tab === 'attachments' && `📎 Attachments (${(ticket.attachments || []).length})`}
            </button>
          ))}
        </div>

        {activeTab === 'comments' && (
          <div>
            <Textarea
              placeholder="Type your public comment…"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              rows={3}
              disabled={busy}
            />
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleAddComment} disabled={busy || !commentInput.trim()}>Post Comment</Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              {publicComments.map((c: any) => (
                <div key={c.id} style={{ padding: '0.75rem 0', borderTop: '1px solid #eee' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                    <strong>{c.author?.name}</strong> · {new Date(c.createdAt).toLocaleString()}
                  </div>
                  <div>{c.content}</div>
                </div>
              ))}
              {publicComments.length === 0 && <p style={{ color: '#aaa' }}>No public comments yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <div style={{
              background: '#fff8e5',
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              marginBottom: '0.75rem',
              color: '#8a6d00',
            }}>
              🔒 Internal notes are only visible to IT Staff and Administrators.
            </div>
            <Textarea
              placeholder="Type an internal note…"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              rows={3}
              disabled={busy}
            />
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleAddNote} disabled={busy || !noteInput.trim()}>Add Internal Note</Button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              {internalNotes.map((n: any) => (
                <div key={n.id} style={{
                  padding: '0.75rem',
                  borderTop: '1px solid #eee',
                  background: '#fffdf5',
                  marginBottom: '0.5rem',
                  borderRadius: '4px',
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                    <strong>{n.author?.name}</strong> · {new Date(n.createdAt).toLocaleString()}
                  </div>
                  <div>{n.content}</div>
                </div>
              ))}
              {internalNotes.length === 0 && <p style={{ color: '#aaa' }}>No internal notes yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'attachments' && (
          <div>
            {(ticket.attachments || []).length === 0 && <p style={{ color: '#aaa' }}>No attachments.</p>}
            {(ticket.attachments || []).map((a: any) => (
              <div key={a.id} style={{ padding: '0.5rem 0', borderTop: '1px solid #eee' }}>
                📎 {a.fileName} ({Math.round(a.fileSize / 1024)} KB)
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
