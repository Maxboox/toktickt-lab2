# Peer Review Notes — Lab 3

## Reviewer
**Nom :** Maxime (auto-revue avec assistance IA)
**Date :** 2025

## Pull Requests Reviewed

| PR | Titre | Statut |
|----|-------|--------|
| #33 | Sprint 3 engineering contract (specs) | ✅ Approved |
| #34 | JWT authentication (login/logout/me/change-password) | ✅ Approved |
| #35 | IT Staff routes (queue, claim, priority, status, comments, notes) | ✅ Approved |
| #36 | Administrator user management routes | ✅ Approved |
| #37 | Frontend Vite migration + Login + Queue + Admin | ✅ Approved |

## Points reviewed

### Auth foundation
- ✅ Password hashing with bcrypt (salt rounds 10)
- ✅ JWT signed with `JWT_SECRET` env var, httpOnly cookie
- ✅ Safe generic error on invalid credentials (no user enumeration)
- ✅ Inactive users rejected on login AND on every protected endpoint

### IT Staff operations
- ✅ `requireRole('IT_STAFF', 'ADMINISTRATOR')` on all `/it/*` routes
- ✅ `requirePasswordChanged` middleware blocks initial-password users
- ✅ Status transitions validated against an explicit matrix
- ✅ Internal Notes isolated from Public Comments in both API and UI

### Administrator
- ✅ `requireRole('ADMINISTRATOR')` on all `/admin/*` routes
- ✅ Self-deactivation blocked
- ✅ Last active Administrator cannot be deactivated or demoted
- ✅ Duplicate email rejected (409 Conflict)

### Frontend
- ✅ Vite migration done (CRA was causing ajv/schema-utils conflicts)
- ✅ Router listens to `popstate` so navigation works
- ✅ `Select` component supports both `options` prop and JSX `children`
- ✅ AuthContext replaces the old RequesterContext

## Comments and resolutions

| Comment | Resolution |
|---------|------------|
| `process.env` does not work in Vite | Migrated to `import.meta.env` + fallback |
| `Select.tsx` crashed when used with JSX children | Added runtime guard `if (options && Array.isArray(options))` |
| Clicking "Open" changed URL but not the view | Added `popstate` listener + `useState` in `App.tsx` |

## Approval

Toutes les PRs ont été revues et approuvées. Le code respecte le contrat Lab 3 et la Definition of Done.
