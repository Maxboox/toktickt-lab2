# API Specification — Lab 3

## Authentication mechanism
- httpOnly cookie-based session (or JWT stored in an httpOnly cookie)
- bcrypt password hashing
- Session invalidation on logout
- CSRF protection considered for cookie-based state-changing endpoints
- Safe, generic error messages on login failure

## Endpoints

### Authentication
- POST /api/auth/login
  - Body: { email, password }
  - 200: { user: { id, name, email, role, mustChangePassword } }
  - 401: invalid credentials
  - 401: inactive account (same shape, safe message)
- POST /api/auth/logout
  - 200: cleared session
- GET /api/auth/me
  - 200: { user: { id, name, email, role, mustChangePassword } }
  - 401: unauthenticated
- POST /api/auth/change-password
  - Body: { currentPassword, newPassword }
  - 200: mustChangePassword = false
  - 400: invalid input / weak password
  - 401: unauthenticated

### Requester (Lab 2 regression)
- GET /api/tickets              (owned by authenticated user)
- POST /api/tickets
- GET /api/tickets/:id          (ownership enforced)
- PUT /api/tickets/:id          (ownership enforced)
- POST /api/tickets/:id/attachments
- POST /api/tickets/:id/comments          (Public Comment)
- POST /api/tickets/:id/resolved-indication

### IT Staff
- GET /api/it/tickets                      (queue: search, filters, sort, pagination)
- GET /api/it/tickets/:id
- POST /api/it/tickets/:id/claim
- POST /api/it/tickets/:id/assign
- PATCH /api/it/tickets/:id/it-priority
- PATCH /api/it/tickets/:id/status
- POST /api/it/tickets/:id/comments        (Public Comment)
- POST /api/it/tickets/:id/notes           (Internal Note)
- GET /api/it/tickets/:id/notes

### Administrator
- GET /api/admin/users                     (search by name/email, optional role filter)
- POST /api/admin/users
- PATCH /api/admin/users/:id
- POST /api/admin/users/:id/initial-password

## Queue query behavior
- searchable: ticketNumber, summary, requester name
- filterable: status, priority, owner, category
- sortable: createdAt, updatedAt, itPriority
- default order: updatedAt desc
- page size: 20
- invalid query parameters → 400 with safe error

## Authorization & safe errors
- 401 unauthenticated
- 403 authenticated but forbidden
- 400 invalid input
- 404 missing resource (do not leak existence of protected resources)
- 409 conflict (duplicate email)
- 500 unexpected server error
- Never expose whether another user's protected Ticket, Attachment, or
  Internal Note exists.

## Validation
- Email: valid format, unique
- Password: min 8 chars, upper + lower, digit, special char
- Role: one of REQUESTER, IT_STAFF, ADMINISTRATOR
- Comment / Note content: not empty or whitespace-only, justified length limit

## Passwords and secrets
- Passwords hashed with bcrypt
- No plaintext passwords stored or returned
- No secrets committed to source control