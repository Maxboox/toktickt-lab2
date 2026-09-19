# UI Specification — Lab 3

## Design language
Reuse Zen Green tokens, typography, spacing, form conventions, cards, badges,
buttons, validation placement, and responsive rules established in Lab 2.
New screens must look like part of the same application.

## Application shell
- Header: current user's name and role badge
- Logout action
- Role-specific navigation (Requester / IT Staff / Administrator)
- No unauthorized destinations shown

## Screen: Login
- Fields: email, password
- Validation and busy state
- Safe failure feedback ("Invalid email or password. Please try again.")
- Clear response for inactive accounts without exposing account info
- Link "Forgot your password?" (non-functional placeholder in Lab 3)

## Screen: Mandatory Password Change
- Fields: current (temporary) password, new password, confirm new password
- Password rules displayed:
  - At least 8 characters
  - Include upper and lower case letters
  - Include a number and a special character
- Validation and confirmation
- On success: continue into the application

## Screen: Requester Ticket Detail (regression + additions)
- Preserve Lab 2 layout, fields, attachments, and ownership
- Add Public Comments section (append-only)
- Add "Problem Appears Resolved" action (visible to the Requester, no status
  change to Resolved/Closed)

## Screen: IT Staff Ticket Queue
- Search: ticket number, summary, requester name
- Filters: status, priority, owner, category
- Sorting: created date, updated date, priority
- Pagination with page size 20
- Columns (desktop): Ticket Number, Created Date, Summary, Category,
  Requested Priority, IT Priority, Current Status, Ticket Owner, Last Updated
- Action: open Ticket Detail
- Feedback: loading, empty, no-results, forbidden, failure
- Responsive: table on desktop, card list on tablet/mobile

## Screen: IT Staff Ticket Detail
- Grouped ticket information (ticket no, category, related system, requester,
  requested priority, IT priority, current status, ticket owner, summary,
  description, resolution summary)
- Editable fields: Ticket Owner, IT Priority, Current Status
- Public Comments section
- Internal Notes section (visually distinct so private info is not posted
  publicly)
- Attachments section (continuity from Lab 2)
- Requester resolution indication visible
- Role-specific actions and validation feedback

## Screen: Administrator User Management
- One screen, minimalist
- User list: Name, Email, Role, Status, Edit action
- Search by name or email
- Optional filter by role
- Create user form: Full Name, Email, Role (one), Active toggle, Initial
  Password, Save
- Edit user form: Name, Email, Role, Active toggle, Save
- Action: Set new initial password (must be changed at next login)
- Safe rules:
  - Reject duplicate emails
  - Reject invalid role values
  - Reject Administrator self-deactivation
  - Reject removing the last active Administrator
- Feedback: validation, success, forbidden, safe API failure
- Responsive: list + form stack on smaller screens

## Modes
Each screen defines create, view, and edit modes where applicable.
Error state does not require a formal separate mode.

## Feedback requirements
Provide visible feedback for:
- loading
- saving
- success
- validation errors
- empty state
- no-results state
- forbidden
- not-found
- conflict (e.g. duplicate email)
- safe API failure

## Responsive and accessibility
- Desktop, tablet, and mobile
- Consistent with Lab 2 accessibility expectations
- Editable vs read-only field styling clearly distinct
- Badges for Ticket Status, Requested Priority, IT Priority, and Role