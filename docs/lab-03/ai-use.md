# AI Use — Lab 3

## LLM used
- **Claude (Anthropic)** — pour la spécification, le code backend, le frontend et le debugging.
- **ChatGPT** — pour des vérifications ponctuelles de syntaxe.

## Key prompts (6 à 10 utilisés pendant le sprint)

1. **Spec agent** — « Transforme le handout Lab 3 en specification.md structurée avec FR-xx, BR-xx, AC-xx. »

2. **Spec agent** — « Propose un schéma Prisma pour Lab 3 qui ajoute User, PublicComment, InternalNote sans casser les modèles Lab 2. »

3. **Coding agent** — « Écris le backend Express d'auth (login, logout, me, change-password) avec bcryptjs + jsonwebtoken, cookie httpOnly, et validation zod. »

4. **Coding agent** — « Écris un middleware `requireRole(...roles)` qui s'appuie sur `req.user.role` peuplé par `authenticate`. »

5. **Coding agent** — « Écris les routes IT Staff : GET /it/tickets avec search/filter/sort/pagination, POST claim, POST assign, PATCH it-priority, PATCH status (avec matrice de transitions), POST comments, POST notes. »

6. **Coding agent** — « Écris les routes Admin : GET/POST /admin/users, PATCH /admin/users/:id, POST /admin/users/:id/initial-password. Interdictions : self-deactivation, dernier admin actif, duplicate email. »

7. **Coding agent** — « Écris les composants React : Login, ChangePassword, ITQueue, ITTicketDetail, AdminUsers, AppShell, AuthContext avec fetch credentials: 'include'. »

8. **Debug agent** — « Pourquoi react-scripts@5.0.1 échoue avec `Cannot find module 'ajv/dist/compile/codegen'` sous Node 24 ? »

9. **Debug agent** — « Mon composant Select plante avec `Cannot read properties of undefined (reading 'map')` quand j'utilise `<Select><option>...</option></Select>`. »

10. **Debug agent** — « L'URL change mais la page ne re-render pas après un pushState. Comment synchroniser React avec l'URL sans react-router ? »

## My Reflection

### Specification agent
L'agent a été très utile pour transformer le handout (16 pages) en une spécification concise et cohérente (FR, BR, AC numérotés). J'ai dû corriger plusieurs fois car l'agent avait tendance à ajouter des features hors-scope (email invitations, MFA, dashboards). En relisant le handout avec lui, on a resserré le périmètre.

### Coding agent
Le backend a été généré en quelques itérations cohérentes. Le frontend a été plus compliqué : les premières versions utilisaient `process.env` et le sélecteur de requester du Lab 2, ce qui ne marchait pas avec Vite. J'ai dû expliquer clairement la stack à l'agent (Vite + React 18 + TS) pour obtenir du code compatible.

### Le plus dur
Le plus dur n'a pas été le code, mais la **chaîne d'outils** : conflits `ajv@6` vs `ajv@8` dans CRA, changement de Node 24 vers Node 18, migration de CRA à Vite. Ce sont des problèmes d'environnement, pas de logique métier.

### Ce que j'ai appris
- Un agent IA ne devine pas la stack : il faut la lui dire explicitement.
- Tester chaque couche séparément (curl avant navigateur) permet d'isoler les bugs.
- Un `package.json` bien fait avec `overrides` évite des heures de conflits de dépendances.
