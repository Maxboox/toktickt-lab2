# Lab 2 Test Plan and Results

## Planned Tests
| Test ID | Type | Requirement | What It Tests | Expected Result | File |
|---------|------|-------------|---------------|-----------------|------|
| API-01 | API | AC-01 | Création ticket valide | 201 | server/tests/lab-02/tickets.api.test.ts |
| API-02 | API | AC-03 | Accès ticket non possédé | 404 | server/tests/lab-02/ownership.test.ts |
| API-03 | API | BR-05 | Ticket sans champ obligatoire | 400 | server/tests/lab-02/validation.test.ts |
| API-04 | API | FR-04 | Liste des tickets | 200 | server/tests/lab-02/list.test.ts |
| UI-01 | UI | AC-01 | Formulaire création | Soumission valide | client/src/.../CreateTicket.test.tsx |
| UI-02 | UI | AC-05 | Validation champ vide | Message d'erreur | client/src/.../CreateTicket.test.tsx |
| UI-02 | UI | AC-05 | Validation champ vide | Message d'erreur | client/src/.../CreateTicket.test.tsx |
