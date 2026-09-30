# Peer Review Notes — Lab 3

## Reviewer
**Nom :** Maxime (auto-revue)
**Date :** 2025

## Pull Requests Reviewed

| PR | Titre | Statut |
|----|-------|--------|
| #33 | Sprint 3 engineering contract (specs) | ✅ Approved |
| #34 | JWT authentication | ✅ Approved |
| #35 | IT Staff routes | ✅ Approved |
| #36 | Administrator user management routes | ✅ Approved |
| #37 | Frontend Vite migration | ✅ Approved |

## Points reviewed

### Auth foundation
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT signed with JWT_SECRET, httpOnly cookie
- ✅ Safe generic error on invalid credentials
- ✅ Inactive users rejected on login AND protected endpoints

### IT Staff operations
- ✅ requireRole('IT_STAFF', 'ADMINISTRATOR') on /it/* routes
- ✅ requirePasswordChanged middleware
- ✅ Status transitions validated against explicit matrix
- ✅ Internal Notes isolated from Public Comments

### Administrator
- ✅ requireRole('ADMINISTRATOR') on /admin/* routes
- ✅ Self-deactivation blocked
- ✅ Last active Administrator cannot be deactivated
- ✅ Duplicate email rejected (409)

### Frontend
- ✅ Vite migration done (CRA had ajv conflicts)
- ✅ Router listens to popstate
- ✅ Select supports both options prop and children
- ✅ AuthContext replaces RequesterContext

## Comments and resolutions

| Comment | Resolution |
|---------|------------|
| process.env not working in Vite | Migrated to import.meta.env |
| Select.tsx crashed with JSX children | Added runtime guard |
| Clicking Open changed URL but not view | Added popstate listener |

## Approval
Toutes les PRs ont été revues et approuvées.
