# Lab 3 Specification — TikTockIT

## 1. Sprint Goal

Replace the temporary Development Requester selector with real authentication
and role-based authorization, introduce the first operational IT Staff workflow
(Ticket Queue and Ticket Detail), and add a minimalist Administrator User
Management screen. By the end of the sprint, TikTockIT supports three roles —
Requester, IT Staff, Administrator — while preserving all Lab 2 Requester
capabilities and existing data.

## 2. Stakeholder Request (interpretation)

The system must move from a development-only placeholder identity to real user
accounts with passwords and roles. Administrators need a simple screen to
manage users. Users signing in with an initial password must change it before
entering the application. Requesters keep working exactly as in Lab 2 but under
their authenticated identity. IT Staff get a professional queue and ticket
detail where they can claim, prioritize, comment publicly, record private
notes, and follow a controlled workflow. Every API and screen must be protected
by role and ownership on the server — not by hiding buttons.

## 3. Scope

### Included
- Email + password authentication, logout, current-user retrieval
- Mandatory first-login password change
- Roles: Requester, IT Staff, Administrator
- Server-side role-based authorization and ownership checks
- Migration from Lab 2 Development Requester to real User model
- Requester regression: existing Ticket and Attachment features preserved
- IT Staff Ticket Queue with search, filters, sorting, pagination
- IT Staff Ticket Detail: claim / reassign ownership, IT Priority,
  permitted status transitions, Public Comments, Internal Notes
- Requester indication "Problem Appears Resolved"
- Minimalist Administrator User Management:
  list, search, optional role filter, create, edit, activate/deactivate,
  set new initial password
- Zen Green UI extensions and responsive layout
- Tests: unit, API, UI component, UI style, responsive, security,
  migration/regression, end-to-end

### Explicitly Excluded
- Email invitations, password reset email, MFA, SSO, social login
- Self-registration, Requester-created accounts
- Actions Taken by IT Staff (deferred to Lab 4)
- SLA calculation, escalation, notification services
- Dashboards / KPI analytics
- Multi-tenant organizations, departments, customer administration
- Multiple roles per user
- User deletion, bulk operations, import/export, account audit history
- Departments, organizations, profile photos, extended user profile
- Email delivery of initial password or reset links
- Account unlocking, administrator approval workflows
- Advanced user-list features (mandatory pagination, multi-column sorting,
  multiple simultaneous filters)
- Production-grade deployment or cloud infrastructure changes

## 4. Functional Requirements

- **FR-01** The system shall authenticate a user with email and password.
- **FR-02** The system shall reject authentication for inactive users.
- **FR-03** A user with an initial password shall be required to change it
  before accessing normal application screens.
- **FR-04** The system shall provide logout and invalidate authenticated access.
- **FR-05** The system shall return the authenticated user's identity and role
  via a current-user endpoint.
- **FR-06** The system shall enforce role-based authorization on every
  protected endpoint.
- **FR-07** A Requester shall see only their own Tickets and Attachments.
- **FR-08** A Requester shall be able to post Public Comments on their Tickets.
- **FR-09** A Requester shall be able to indicate that the problem appears
  resolved.
- **FR-10** IT Staff shall access a Ticket Queue with search, filters, sorting,
  and pagination.
- **FR-11** IT Staff shall open a Ticket Detail and claim or reassign ownership.
- **FR-12** IT Staff shall set IT Priority on a Ticket.
- **FR-13** IT Staff shall perform permitted status transitions.
- **FR-14** IT Staff shall post Public Comments.
- **FR-15** IT Staff shall create Internal Notes visible only to IT Staff and
  Administrator.
- **FR-16** An Administrator shall list users, search by name or email, and
  optionally filter by role.
- **FR-17** An Administrator shall create a user with one permitted role and
  an initial password.
- **FR-18** An Administrator shall edit a user's name, email, role, and
  activation state.
- **FR-19** An Administrator shall set a new initial password that the user
  must change at next login.
- **FR-20** The system shall prevent duplicate email addresses.
- **FR-21** The system shall prevent an Administrator from deactivating their
  own account.
- **FR-22** The system shall prevent removal or deactivation of the last
  active Administrator.

## 5. Business Rules

- **BR-01** Only an active user with valid credentials may authenticate.
- **BR-02** A user marked as requiring a password change cannot enter the
  normal application until a new valid password is saved.
- **BR-03** The authenticated user identity, not a requested ID supplied by
  the client, determines ownership of Requester operations.
- **BR-04** Public Comments are visible to the Requester, IT Staff, and
  Administrator. Internal Notes are visible only to IT Staff and
  Administrator.
- **BR-05** A Requester may indicate that the problem appears resolved but
  cannot formally set a Ticket to Resolved or Closed.
- **BR-06** Login failures return a safe generic error without disclosing
  whether the email exists.
- **BR-07** Passwords are never stored in plaintext; a strong password hash
  algorithm (bcrypt) is used.
- **BR-08** Logout invalidates the authenticated session.
- **BR-09** An inactive user cannot authenticate or access protected
  endpoints, even with a previously valid session.
- **BR-10** Duplicate email addresses are rejected with a conflict error.
- **BR-11** Each Ticket may have one primary Ticket Owner who is an active
  IT Staff or Administrator user; a Ticket may initially be unassigned.
- **BR-12** Requested Priority is the value submitted by the Requester and
  cannot be changed by IT Staff.
- **BR-13** IT Priority initially copies Requested Priority and may later be
  changed only by IT Staff or Administrator.
- **BR-14** Ticket status transitions follow the approved matrix
  (New → Open, Open → In Progress / Waiting for Requester / Cancelled,
  In Progress → Waiting for Requester / Resolved / Cancelled,
  Waiting for Requester → In Progress / Resolved / Cancelled,
  Resolved → Closed / Reopened, Closed → Reopened,
  Reopened → In Progress / Cancelled).
  The Requester cannot perform Resolved or Closed.
- **BR-15** Public Comments and Internal Notes are append-only in Lab 3;
  editing and deletion are excluded.
- **BR-16** Each Comment or Note records its author and creation time from
  the backend.
- **BR-17** Empty or whitespace-only content is rejected for Comments and
  Notes.
- **BR-18** User Management operations are restricted to Administrator role.
- **BR-19** An Administrator may not deactivate their own account.
- **BR-20** The system must always keep at least one active Administrator.
- **BR-21** Deactivation, not deletion, is used to retire users.
- **BR-22** Only one role may be assigned to a user in Lab 3.

## 6. UI Specification Summary

See `docs/lab-03/ui-spec.md` for the full screen structure, modes,
controls, feedback, role behavior, and responsive rules.

## 7. Data Changes

### New model: User
- id (uuid)
- name (string)
- email (string, unique)
- passwordHash (string)
- role (enum: REQUESTER | IT_STAFF | ADMINISTRATOR)
- isActive (boolean, default true)
- mustChangePassword (boolean, default true)
- createdAt, updatedAt

### Ticket — added fields
- ownerId (nullable FK → User)
- itPriority (enum: LOW | MEDIUM | HIGH | CRITICAL)
- status extended: NEW, OPEN, IN_PROGRESS, WAITING_FOR_REQUESTER,
  RESOLVED, CLOSED, REOPENED, CANCELLED
- resolvedIndicationByRequester (boolean, default false)

### New model: PublicComment
- id, ticketId, authorId, content, createdAt

### New model: InternalNote
- id, ticketId, authorId, content, createdAt

### Migration strategy
- Lab 2 Development Requester records are migrated into User accounts.
- Existing Tickets keep their ownership (mapped to the migrated User).
- The temporary Requester selector and its client-side state are removed.
- Initial passwords are distributed out-of-band for local development only.

### Seed
- 4 active Requester accounts + 1 inactive Requester
- 3 active IT Staff accounts + 1 inactive IT Staff
- 1 active Administrator account
- Realistic Tickets across Requesters, statuses, priorities, assigned and
  unassigned
- Example Public Comments and Internal Notes without sensitive information

## 8. API Contract

See `docs/lab-03/api-spec.md`.

## 9. Acceptance Criteria

- **AC-01** Given an active user with valid credentials, when the user logs in,
  then the backend establishes authenticated access and returns the permitted
  user identity and role.
- **AC-02** Given a user who must change the initial password, when login
  succeeds, then normal application screens remain unavailable until a valid
  new password is saved.
- **AC-03** Given an authenticated Requester, when the client supplies another
  requesterId, then the backend still applies the authenticated identity and
  does not return another Requester's data.
- **AC-04** Given a Requester account, when an Internal Note endpoint is
  requested, then the operation is rejected without exposing note content.
- **AC-05** Given an inactive user with valid credentials, when login is
  attempted, then access is denied with a safe error.
- **AC-06** Given an authenticated user, when the user logs out, then
  subsequent protected requests are rejected.
- **AC-07** Given an authenticated IT Staff user, when the queue is requested
  with search, filters, sorting, and pagination, then the response matches the
  query parameters.
- **AC-08** Given an IT Staff user, when a Ticket is claimed or reassigned,
  then the ownership is updated.
- **AC-09** Given an IT Staff user, when IT Priority is set, then only IT
  Priority is changed.
- **AC-10** Given an IT Staff user, when a status transition is attempted,
  then only permitted transitions succeed.
- **AC-11** Given an authenticated Requester, when a Public Comment is posted,
  then it is visible to Requester, IT Staff, and Administrator.
- **AC-12** Given an IT Staff user, when an Internal Note is created, then it
  is visible only to IT Staff and Administrator.
- **AC-13** Given an Administrator, when a user is created with a valid role
  and an initial password, then the user must change the password at next
  login.
- **AC-14** Given an Administrator, when a duplicate email is submitted, then
  the operation is rejected with a conflict error.
- **AC-15** Given an Administrator, when self-deactivation is attempted, then
  the operation is rejected.
- **AC-16** Given an Administrator, when attempting to deactivate the last
  active Administrator, then the operation is rejected.
- **AC-17** Given a non-Administrator, when the user-management endpoints are
  requested, then the operation is rejected with a forbidden error.
- **AC-18** Given existing Lab 2 data, when the Lab 3 migration runs, then
  existing Tickets and Attachments remain valid and owned correctly.

## 10. Definition of Done

- [ ] All FR, BR, and AC implemented and covered by tests
- [ ] Unit, API, UI, security, migration, regression, and E2E tests passing
- [ ] Lab 2 Requester features work with authenticated identity
- [ ] Development Requester selector fully removed
- [ ] Zen Green design language reused; no second visual system
- [ ] Responsive on desktop, tablet, and mobile
- [ ] No secrets, plaintext passwords, or real credentials in the repository
- [ ] All GitHub Issues closed and moved to Done
- [ ] Peer review completed and approved
- [ ] Merged into lab3-staging and then main
- [ ] Final PDF with Answer Part 1 .. Answer Part 9 submitted

## 11. Assumptions and Decisions

- Authentication uses httpOnly cookie-based sessions with bcrypt password
  hashing (decision documented in api-spec.md).
- Lab 3 keeps one role per user; multi-role is out of scope.
- Actions Taken is deferred to Lab 4; the corresponding rule is not enforced.
- Initial passwords are distributed by the Administrator manually for the
  local lab; no email delivery.
- Attachment handling is unchanged from Lab 2.
- Zen Green tokens established in Lab 2 are reused unchanged; only new
  components (queue table, comments/notes list, admin user form) extend them.