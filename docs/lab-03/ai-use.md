# AI Use — Lab 3

## LLM used
- Claude (Anthropic) — spec, backend, frontend, debugging
- ChatGPT — vérifications ponctuelles

## Key prompts

1. Transforme le handout Lab 3 en specification.md structurée (FR, BR, AC).
2. Propose un schéma Prisma pour User, PublicComment, InternalNote.
3. Écris le backend Express d'auth (login/logout/me/change-password) avec bcryptjs + JWT + cookie httpOnly.
4. Écris un middleware requireRole(...roles).
5. Écris les routes IT Staff (queue, claim, priority, status, comments, notes).
6. Écris les routes Admin (users CRUD, initial-password).
7. Écris les composants React (Login, ChangePassword, ITQueue, ITTicketDetail, AdminUsers, AppShell, AuthContext).
8. Pourquoi react-scripts@5 échoue avec Cannot find module 'ajv/dist/compile/codegen' sous Node 24 ?
9. Mon Select plante avec Cannot read properties of undefined (reading 'map').
10. L'URL change mais la page ne re-render pas après pushState.

## My Reflection

### Specification agent
Utile pour transformer le handout en spec concise (FR, BR, AC numérotés). J'ai dû corriger plusieurs fois car l'agent ajoutait des features hors-scope.

### Coding agent
Backend généré en quelques itérations cohérentes. Frontend plus compliqué : les premières versions utilisaient process.env (CRA-style) incompatible avec Vite.

### Le plus dur
La chaîne d'outils : conflits ajv@6 vs ajv@8, Node 24 → 18, migration CRA → Vite.

### Ce que j'ai appris
- Un agent IA ne devine pas la stack : il faut la lui dire.
- Tester chaque couche séparément (curl avant navigateur) isole les bugs.
- Un package.json avec overrides évite des heures de conflits.
