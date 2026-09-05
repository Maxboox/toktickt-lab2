# Lab 2 Test Plan and Results

## 1. Test Strategy
The test strategy follows Test-Driven Development (TDD) principles. Tests were planned from the specification before implementation was declared complete. The test suite covers multiple levels: unit tests, API integration tests, UI component tests, and end-to-end tests.

## 2. Planned Tests

| Test ID | Type | Requirement/AC | What It Tests | Expected Result | Automated Test File |
|---------|------|----------------|---------------|-----------------|---------------------|
| API-01 | API | AC-01 | Create ticket with valid data | 201 Created | server/tests/lab-02/tickets.api.test.ts |
| API-02 | API | AC-03 | Access ticket owned by another requester | 403 Forbidden | server/tests/lab-02/tickets.api.test.ts |
| API-03 | API | BR-05 | Create ticket without required fields | 400 Bad Request | server/tests/lab-02/tickets.api.test.ts |
| API-04 | API | FR-04 | List tickets with pagination | 200 OK | server/tests/lab-02/tickets.api.test.ts |
| API-05 | API | FR-10 | Upload an attachment | 201 Created | server/tests/lab-02/attachments.api.test.ts |
| API-06 | API | BR-07 | Upload invalid file type | 400 Bad Request | server/tests/lab-02/attachments.api.test.ts |
| API-07 | API | BR-08 | Upload file exceeding 5MB limit | 413 Payload Too Large | server/tests/lab-02/attachments.api.test.ts |
| API-08 | API | FR-11 | Soft-delete an attachment | 200 OK | server/tests/lab-02/attachments.api.test.ts |
| UI-01 | UI | AC-01 | Submit form with valid data | Success message with ticket number | frontend/src/.../CreateTicket.test.tsx |
| UI-02 | UI | AC-05 | Submit form with empty Summary | Field error message displayed | frontend/src/.../CreateTicket.test.tsx |
| UI-03 | UI | BR-11 | Submit button during processing | Button disabled and shows busy state | frontend/src/.../CreateTicket.test.tsx |
| UI-04 | UI | FR-01 | Requester selector dropdown | List of active requesters | frontend/src/.../RequesterSelect.test.tsx |
| UI-05 | UI | AC-08 | Filter tickets by requester | Only requester's tickets shown | frontend/src/.../MyTickets.test.tsx |
| E2E-01 | E2E | AC-01, AC-04 | Complete ticket creation flow | Ticket created and visible in My Tickets | e2e/lab-02/create-ticket.spec.ts |
| E2E-02 | E2E | AC-02 | Access without requester selection | Redirected to selector screen | e2e/lab-02/auth-flow.spec.ts |
| E2E-03 | E2E | AC-06, AC-07 | Upload and soft-delete attachment | Attachment uploaded then soft-deleted | e2e/lab-02/attachments.spec.ts |
| RESP-01 | Visual | - | Desktop responsive behavior | Multi-column layout | e2e/lab-02/responsive.spec.ts |
| RESP-02 | Visual | - | Tablet responsive behavior | Two-column layout | e2e/lab-02/responsive.spec.ts |
| RESP-03 | Visual | - | Mobile responsive behavior | Vertical layout | e2e/lab-02/responsive.spec.ts |

## 3. Acceptance-Criterion Traceability

| Acceptance Criterion | Tests |
|----------------------|-------|
| AC-01 | API-01, UI-01, E2E-01 |
| AC-02 | E2E-02 |
| AC-03 | API-02 |
| AC-04 | API-04, E2E-01 |
| AC-05 | API-03, UI-02 |
| AC-06 | API-05, E2E-03 |
| AC-07 | API-08, E2E-03 |
| AC-08 | API-04, UI-05 |
| AC-09 | API-04 |
| AC-10 | API-04 |

## 4. Test Commands

```bash
# Run all tests
npm test

# Run API tests only
cd server && npm test

# Run UI tests only
cd frontend && npm test

# Run E2E tests
npm run test:e2e
