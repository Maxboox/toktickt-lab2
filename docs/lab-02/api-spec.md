# Lab 2 API Specification

## Base URL: /api

### GET /api/requesters - Liste des requesters actifs
### GET /api/categories - Liste des catégories
### GET /api/systems - Liste des systèmes
### POST /api/tickets - Crée un ticket
### GET /api/tickets - Liste paginée des tickets
### GET /api/tickets/:id - Détail d'un ticket
### POST /api/tickets/:id/attachments - Upload pièce jointe
### GET /api/attachments/:id/download - Télécharger pièce jointe
### DELETE /api/attachments/:id - Supprimer pièce jointe (soft-delete)
