# AI-Powered Developer Forum

A full-stack developer forum with AI-powered features including semantic search, RAG document upload, similar question recommendations, and an AI chatbot — built as part of a structured bootcamp with a 6-person team.

🌐 **Live Demo:** [ai-powered-forum-project-three.vercel.app](https://ai-powered-forum-project-three.vercel.app)

---

## ✨ Features

### Core Forum

- User registration and login (email/password + Google OAuth)
- Post questions with rich content support
- Answer questions (with ownership protection — you can't answer your own question)
- Question and answer feed with keyword search

### AI-Powered Features

- **Semantic Search** — find conceptually related questions using Gemini vector embeddings and cosine similarity, not just keyword matching
- **Similar Questions** — recommends related questions based on an existing question's stored vector
- **RAG PDF Upload** — upload personal PDF documents that get chunked, embedded, and stored for AI retrieval
- **AI Forum Chatbot** — a floating chatbot that answers questions using the forum's knowledge base (questions + answers) as context, with citations back to source posts
- **Answer Fit Assessment** — evaluates how well a draft answer addresses the question before posting
- **Draft Coach** — AI feedback on question drafts to improve clarity and completeness
- **Content Moderation** — automated moderation of forum content using Gemini

---

## 🛠️ Tech Stack

| Layer       | Technology                                                  |
| ----------- | ----------------------------------------------------------- |
| Frontend    | React 18, Vite, React Router, CSS Modules                   |
| Backend     | Node.js, Express.js, ES Modules                             |
| Database    | MySQL                                                       |
| AI          | Google Gemini API (`@google/genai` v2)                      |
| Auth        | JWT + Google OAuth 2.0                                      |
| File Upload | Multer                                                      |
| PDF Parsing | pdf-parse                                                   |
| Deployment  | Vercel (frontend) + Render (backend) + Clever Cloud (MySQL) |

---

## 🚀 My Contributions

This was a team project. Here is what I specifically built:

### T-11 — Semantic Search (`GET /api/questions/search`)

Implemented AI-powered search that understands meaning, not just keywords. When a user searches "how to center a div," it finds posts about "aligning elements in CSS" even if the exact words don't match.

**How it works:**

1. User's query is embedded into a vector via Gemini (`taskType: RETRIEVAL_QUERY`)
2. All stored question vectors are fetched from `question_vectors` table
3. Cosine similarity is computed between the query vector and each stored vector
4. Results above a 0.75 threshold are sorted by score and returned

### T-11 — Similar Questions (`GET /api/questions/:questionHash/similar`)

Recommends questions related to one you're viewing, using the question's already-stored vector — no new Gemini call needed.

### T-12 — Create Answer (`POST /api/answers`)

Answer creation endpoint with a business rule: users cannot answer their own questions. `userId` always comes from the JWT payload, never from the request body, preventing impersonation.

### T-22 — RAG PDF Upload (`POST /api/rag/documents`)

Full pipeline for uploading and processing PDFs for AI retrieval:

1. Multer validates file type (PDF only) and size limit
2. Document record inserted with `status='processing'`
3. PDF text extracted via `pdf-parse`
4. Text split into overlapping chunks (900 chars, 120 char overlap) to preserve context at boundaries
5. Each chunk embedded via Gemini (`taskType: RETRIEVAL_DOCUMENT`)
6. Chunks and vectors stored in `document_chunks` and `document_chunk_vectors`
7. Status updated to `'ready'` or `'failed'`

### T-30 — AI Forum Chatbot (`POST /api/forum-chat/query`)

A floating chatbot widget that searches the entire forum knowledge base to answer user questions:

- Forum posts (questions + answers) are embedded into `forum_post_vectors` — shared across all users
- User's uploaded documents are searched from `document_chunk_vectors` — scoped per user (privacy)
- Query is embedded transiently for search only, never stored
- Top K results passed to Gemini with a grounded prompt
- Response includes the answer + structured citations linking back to source posts

Also built the **backfill script** (`scripts/backfill-forum-vector.js`) to embed existing forum content, and wired **auto-embedding** into question and answer creation so new posts are indexed automatically (fire-and-forget, never blocks the creation response).

### Responsive Design

Fixed mobile layout issues across all pages:

- Sidebar no longer crushes main content on mobile
- Navbar search/logo/title no longer squeezed on narrow screens
- Auth page reorders sections on mobile (form first, info panel second)
- Landing page grids collapse to single column on small screens

### Merge Conflict Resolution

Resolved 4-file merge conflict when T-22 (my upload feature) collided with teammates' T-23 (document search) and T-24 (document management) — both sides working on the same `rag/` folder simultaneously. Carefully combined all three features, verified both sides still worked after the merge.

---

## 🏗️ Architecture

```
Frontend (React/Vite)
    └── Vercel CDN

Backend (Node.js/Express)
    ├── /api/auth          — Registration, login, Google OAuth
    ├── /api/questions     — CRUD + semantic search + similar
    ├── /api/answers       — Answer creation
    ├── /api/rag           — PDF upload, search, query, list, delete
    ├── /api/forum-chat    — AI chatbot endpoint
    └── /api/moderation    — Content moderation
    └── Render

Database (MySQL)
    ├── users
    ├── questions + question_vectors
    ├── answers
    ├── documents + document_chunks + document_chunk_vectors
    ├── forum_post_vectors
    └── password_resets
    └── Clever Cloud
```

---

## 🔑 Environment Variables

### Backend (`.env`)

```env
PORT=3777
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
GEMINI_API_KEY=your_gemini_api_key
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
GEMINI_TEXT_MODEL=gemini-2.5-flash-lite
RECOMMEND_THRESHOLD=0.75
RECOMMEND_K=5
RAG_UPLOAD_DIR=uploads/rag
RAG_MAX_UPLOAD_MB=5
RAG_CHUNK_CHARS=900
RAG_CHUNK_OVERLAP=120
RAG_MAX_CHUNKS_PER_DOC=1000
RAG_MAX_PDFS_PER_USER=20
RAG_MIN_TEXT_CHARS=50
RAG_SEARCH_THRESHOLD=0.45
RAG_SEARCH_K=10
GOOGLE_CLIENT_ID=your_google_client_id
```

### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:3777
VITE_API_URL=http://localhost:3777/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🗄️ Database Setup

```bash
mysql -u your_user -p your_database < backend/db/schema.sql
```

For the AI chatbot to work on existing data, run the backfill script once:

```bash
cd backend
node scripts/backfill-forum-vector.js
```

---

## 🏃 Running Locally

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3777`.

---

## 👥 Team

Built by a 6-person team as part of the Evangadi Academy bootcamp program.

| Contributor       | Role                                                       |
| ----------------- | ---------------------------------------------------------- |
| Khalid Abdulkerim | Semantic search, RAG upload, AI chatbot, responsive design |
| Suud Abrar        | Project lead, architecture, document management            |
| + 3 teammates     | Auth, question CRUD, frontend pages, moderation            |
