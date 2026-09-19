# Test Plan — Lab 3

| Test ID | Type | Req/AC | What It Tests | Expected Result | Automated Test File | Final |
|---------|------|--------|---------------|-----------------|---------------------|-------|
| UNIT-01 | Unit | BR-07 | Password hashing | Hash != plaintext | server/tests/lab-03/auth.unit.test.ts | |
| API-01 | API | AC-01 | Valid login | 200 + safe user data | server/tests/lab-03/auth.api.test.ts | |
| API-02 | API | BR-06 | Invalid login | 401 safe error | server/tests/lab-03/auth.api.test.ts | |
| API-03 | API | AC-05 | Inactive account | 401/403 safe | server/tests/lab-03/auth.api.test.ts | |
| API-04 | API | AC-02 | Must change password | Normal app blocked | server/tests/lab-03/first-login.api.test.ts | |
| API-05 | API | AC-03 | Requester supplies other id | Ownership enforced | server/tests/lab-03/ownership.api.test.ts | |
| API-06 | API | AC-04 | Requester requests Internal Notes | 403, no data | server/tests/lab-03/notes.api.test.ts | |
| API-07 | API | AC-07 | Queue search/filter/sort/pagination | Correct results | server/tests/lab-03/queue.api.test.ts | |
| API-08 | API | AC-08 | Claim / reassign | Ownership changed | server/tests/lab-03/it-ops.api.test.ts | |
| API-09 | API | AC-09 | IT Priority update | Updated | server/tests/lab-03/it-ops.api.test.ts | |
| API-10 | API | AC-10 | Status transitions | Valid only | server/tests/lab-03/status.api.test.ts | |
| API-11 | API | AC-11 | Public Comment post | Visible to all roles | server/tests/lab-03/comments.api.test.ts | |
| API-12 | API | AC-12 | Internal Note create | Only IT Staff/Admin | server/tests/lab-03/notes.api.test.ts | |
| API-13 | API | AC-13 | Admin creates user | mustChangePassword true | server/tests/lab-03/admin.api.test.ts | |
| API-14 | API | AC-14 | Duplicate email | 409 | server/tests/lab-03/admin.api.test.ts | |
| API-15 | API | AC-15 | Admin self-deactivation | 400/403 | server/tests/lab-03/admin.api.test.ts | |
| API-16 | API | AC-16 | Last active admin | 400/403 | server/tests/lab-03/admin.api.test.ts | |
| API-17 | API | AC-17 | Non-admin user endpoints | 403 | server/tests/lab-03/admin.api.test.ts | |
| UI-01 | UI comp | Login | Validation/busy/error | Correct | client/tests/lab-03/Login.test.tsx | |
| UI-02 | UI comp | Change password | Rules, confirm, continue | Correct | client/tests/lab-03/ChangePassword.test.tsx | |
| UI-03 | UI comp | Queue | Search/filter/sort/pagination | Correct | client/tests/lab-03/Queue.test.tsx | |
| UI-04 | UI comp | IT Ticket Detail | Claim/priority/status/comments/notes | Correct | client/tests/lab-03/TicketDetailIT.test.tsx | |
| UI-05 | UI comp | Admin | List/create/edit | Correct | client/tests/lab-03/AdminUsers.test.tsx | |
| UI-06 | UI style | Zen Green | Tokens/badges/forms | Consistent | client/tests/lab-03/style.test.ts | |
| UI-07 | Responsive | All | Desktop/tablet/mobile | No overflow | client/tests/lab-03/responsive.test.tsx | |
| SEC-01 | Security | BR-03 | Direct API auth | 401/403 | server/tests/lab-03/security.api.test.ts | |
| SEC-02 | Security | FR-06 | Role-based navigation | Correct | server/tests/lab-03/security.api.test.ts | |
| MIG-01 | Migration | AC-18 | Lab 2 migration | Tickets/attachments preserved | server/tests/lab-03/migration.test.ts | |
| REG-01 | Regression | Lab 2 | Requester functions | Still work | server/tests/lab-03/regression.test.ts | |
| E2E-01 | E2E | AC-01 | Login flow | Success | e2e/lab-03/login.spec.ts | |
| E2E-02 | E2E | AC-02 | First login + change | App opens after change | e2e/lab-03/first-login.spec.ts | |
| E2E-03 | E2E | AC-07 | IT flow | Success | e2e/lab-03/it-flow.spec.ts | |
| E2E-04 | E2E | AC-13 | Admin flow | Success | e2e/lab-03/admin-flow.spec.ts | |