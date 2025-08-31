# Phone Book

Lightweight phone book mini-app built with **HTML, Tailwind (CDN), Vanilla JS, and Express backend**.

## Features
- Add, edit, delete, and search contacts
- Persistent storage via backend JSON database (`db/contacts.json`)
- Export and import JSON backups through the API
- Optional auto-download backup after changes
- Preferences and Help pages
- All headings and static business info bound from `data/ui.json`
- Sample seed contacts from `data/seed-contacts.json`

## API Endpoints
- GET /api/contacts → List all contacts
- GET /api/contacts/:id → Get single contact
- POST /api/contacts → Add new contact
- PUT /api/contacts/:id → Update contact
- DELETE /api/contacts/:id → Delete contact
- GET /api/export → Download JSON backup
- POST /api/import → Import contacts from JSON

## Run Locally
1. Install dependencies  
   npm install
2. Start the backend  
   npm start
3. Open in browser  
   http://localhost:3000

## Notes
- On first run, the app seeds contacts from `data/seed-contacts.json`.
- Data persists in `db/contacts.json`.
- To reset, delete `db/contacts.json` and restart the server.
