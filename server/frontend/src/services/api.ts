// Vite : on utilise import.meta.env, pas process.env
const API_URL: string =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

export interface Requester {
  id: number;
  name: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface System {
  id: number;
  name: string;
}

// ============================================================
// LAB 2 - REQUESTERS (obsolète mais conservé)
// ============================================================
export const getRequesters = async (): Promise<Requester[]> => {
  const response = await fetch(`${API_URL}/requesters`);
  if (!response.ok) throw new Error('Failed to fetch requesters');
  const data = await response.json();
  return data.requesters;
};

export const selectRequester = async (requesterId: number): Promise<{ requester: Requester }> => {
  const response = await fetch(`${API_URL}/auth/select-requester`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requesterId }),
  });
  if (!response.ok) throw new Error('Failed to select requester');
  return response.json();
};

export const getCurrentRequester = async (): Promise<Requester | null> => {
  const response = await fetch(`${API_URL}/auth/current-requester`);
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Failed to get current requester');
  const data = await response.json();
  return data.requester;
};

export const checkRequester = async (): Promise<{ isSelected: boolean; requester?: Requester }> => {
  const response = await fetch(`${API_URL}/auth/check`);
  if (!response.ok) throw new Error('Failed to check requester');
  return response.json();
};

// ============================================================
// LAB 2 - TICKETS (obsolète mais conservé)
// ============================================================
export interface CreateTicketData {
  requesterId: number;
  categoryId: number;
  systemId: number;
  summary: string;
  requestedPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  ticketDate: string;
  requesterId: number;
  requester: { id: number; name: string; email: string };
  categoryId: number;
  category: { id: number; name: string };
  systemId: number;
  system: { id: number; name: string };
  summary: string;
  requestedPriority: string;
  currentStatus: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  const data = await response.json();
  return data.categories;
};

export const getSystems = async (): Promise<System[]> => {
  const response = await fetch(`${API_URL}/systems`);
  if (!response.ok) throw new Error('Failed to fetch systems');
  const data = await response.json();
  return data.systems;
};

export const createTicket = async (data: CreateTicketData): Promise<Ticket> => {
  const response = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0] || 'Failed to create ticket');
  }
  return response.json();
};

export interface TicketListResponse {
  items: Ticket[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface TicketFilters {
  requesterId: number;
  search?: string;
  categoryId?: number;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const getTickets = async (filters: TicketFilters): Promise<TicketListResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const response = await fetch(`${API_URL}/tickets?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch tickets');
  return response.json();
};

export const getTicketById = async (id: number, requesterId: number): Promise<Ticket> => {
  const response = await fetch(`${API_URL}/tickets/${id}?requesterId=${requesterId}`);
  if (response.status === 404) throw new Error('Ticket not found');
  if (response.status === 403) throw new Error('You do not have permission to view this ticket');
  if (!response.ok) throw new Error('Failed to fetch ticket');
  return response.json();
};

export const uploadAttachment = async (ticketId: number, requesterId: number, file: File): Promise<Attachment> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('requesterId', String(requesterId));
  const response = await fetch(`${API_URL}/tickets/${ticketId}/attachments`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload attachment');
  }
  return response.json();
};

export const deleteAttachment = async (attachmentId: number, requesterId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/attachments/${attachmentId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requesterId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete attachment');
  }
};

export const downloadAttachment = (attachmentId: number, requesterId: number): string => {
  return `${API_URL}/attachments/${attachmentId}/download?requesterId=${requesterId}`;
};

// ============================================================
// LAB 3 — AUTH, IT STAFF, ADMIN
// ============================================================

export type Role = 'REQUESTER' | 'IT_STAFF' | 'ADMINISTRATOR';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  mustChangePassword?: boolean;
}

export interface ITTicket {
  id: number;
  ticketNumber: string;
  summary: string;
  description: string;
  requestedPriority: string;
  itPriority: string | null;
  currentStatus: string;
  createdAt: string;
  updatedAt: string;
  requester: { id: number; name: string; email: string };
  owner: { id: number; name: string; email: string } | null;
  category: { id: number; name: string };
  system: { id: number; name: string };
}

export interface QueueResponse {
  tickets: ITTicket[];
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
}

export interface QueueFilters {
  search?: string;
  status?: string;
  priority?: string;
  owner?: string | number;
  category?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = (err as any).error || `Request failed (${res.status})`;
    const e: any = new Error(message);
    e.status = res.status;
    e.code = (err as any).code;
    throw e;
  }

  return res.json();
}

export const login = async (email: string, password: string): Promise<{ token: string; user: AuthUser }> =>
  apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const logout = async (): Promise<void> => {
  await apiFetch('/auth/logout', { method: 'POST' });
};

export const getMe = async (): Promise<{ user: AuthUser }> => apiFetch('/auth/me');

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> =>
  apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const getITQueue = async (filters: QueueFilters = {}): Promise<QueueResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
  });
  const qs = params.toString();
  return apiFetch(`/it/tickets${qs ? `?${qs}` : ''}`);
};

export const getITTicket = async (id: number): Promise<{ ticket: any }> =>
  apiFetch(`/it/tickets/${id}`);

export const claimTicket = async (id: number): Promise<{ ticket: ITTicket }> =>
  apiFetch(`/it/tickets/${id}/claim`, { method: 'POST' });

export const assignTicket = async (id: number, ownerId: number | null): Promise<{ ticket: ITTicket }> =>
  apiFetch(`/it/tickets/${id}/assign`, { method: 'POST', body: JSON.stringify({ ownerId }) });

export const setITPriority = async (id: number, itPriority: string): Promise<{ ticket: ITTicket }> =>
  apiFetch(`/it/tickets/${id}/it-priority`, { method: 'PATCH', body: JSON.stringify({ itPriority }) });

export const setTicketStatus = async (id: number, status: string, resolutionSummary?: string): Promise<{ ticket: ITTicket }> =>
  apiFetch(`/it/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, resolutionSummary }),
  });

export const addPublicComment = async (id: number, content: string): Promise<any> =>
  apiFetch(`/it/tickets/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) });

export const addInternalNote = async (id: number, content: string): Promise<any> =>
  apiFetch(`/it/tickets/${id}/notes`, { method: 'POST', body: JSON.stringify({ content }) });

export const getInternalNotes = async (id: number): Promise<any> =>
  apiFetch(`/it/tickets/${id}/notes`);

export const adminGetUsers = async (params: { search?: string; role?: string } = {}): Promise<{ users: AuthUser[] }> => {
  const qs = new URLSearchParams();
  if (params.search) qs.append('search', params.search);
  if (params.role) qs.append('role', params.role);
  const query = qs.toString();
  return apiFetch(`/admin/users${query ? `?${query}` : ''}`);
};

export const adminCreateUser = async (data: {
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  initialPassword: string;
}): Promise<{ user: AuthUser }> =>
  apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(data) });

export const adminUpdateUser = async (id: number, data: {
  name?: string;
  email?: string;
  role?: Role;
  isActive?: boolean;
}): Promise<{ user: AuthUser }> =>
  apiFetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const adminSetInitialPassword = async (id: number, initialPassword: string): Promise<{ message: string }> =>
  apiFetch(`/admin/users/${id}/initial-password`, {
    method: 'POST',
    body: JSON.stringify({ initialPassword }),
  });
