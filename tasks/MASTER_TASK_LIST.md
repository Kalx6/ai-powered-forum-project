# Master Task List: AI-Powered Evangadi Forum

This document provides a consolidated, milestone-by-milestone breakdown of all frontend and backend tasks for the project, referencing the detailed documentation files.

---

## Milestone 1: Authentication (Auth)

_The foundation of user access. Both backend APIs and frontend pages are implemented here._

### Backend Tasks

- **Task Name**: Register User (`T-04`)

  - **Description**: Implement `POST /api/auth/register` to validate input, hash passwords using bcrypt, and create new user accounts.
  - **Reference**: `/auth/register.md`

- **Task Name**: Login User (`T-05`)
  - **Description**: Implement `POST /api/auth/login` to verify user credentials and issue signed JWT tokens for session management.
  - **Reference**: `/auth/login.md`

### Frontend Tasks

- **Task Name**: Axios + Auth Service (`T-06`)

  - **Description**: Setup Axios interceptors to automatically attach JWT tokens to API requests and handle global 401 unauthorized redirects.

- **Task Name**: Auth Page UI (`T-07`)

  - **Description**: Build the combined Login/Register page at `/auth` utilizing Framer Motion for smooth form transitions.
  - **Reference**: `/auth/task-auth.md`

- **Task Name**: AuthContext + ProtectedRoute (`T-08`)

  - **Description**: Create the global React authentication context and route guards to protect authenticated pages from unauthorized access.

- **Task Name**: Public Landing Page (`T-00`)
  - **Description**: Build the unauthenticated `/` homepage to market the application and direct users to sign up or log in.
  - **Reference**: `/public/task-landing.md`

---

## Milestone 2: Questions & Answers

_The core community forum functionality, featuring AI-assisted drafting and answer evaluation._

### Backend Tasks

- **Task Name**: Create Question & Auto-Embed (`T-09`)

  - **Description**: Implement `POST /api/questions` to save questions and simultaneously generate AI vector embeddings for semantic search.
  - **Reference**: `/question/create-question.md`

- **Task Name**: List Questions (`T-10`)

  - **Description**: Implement `GET /api/questions` with support for keyword search and a "mine" filter.
  - **Reference**: `/question/list-questions.md`

- **Task Name**: Get Single Question Details (`T-10`)

  - **Description**: Implement `GET /api/questions/:questionHash` to fetch a specific question and all its associated answers.
  - **Reference**: `/question/single-question.md`

- **Task Name**: Semantic Search Questions (`T-11`)

  - **Description**: Implement `GET /api/questions/search` to find conceptually related questions using AI vector cosine similarity.
  - **Reference**: `/question/search-questions.md`

- **Task Name**: Find Similar Questions (`T-11`)

  - **Description**: Implement `GET /api/questions/:questionHash/similar` to recommend related questions based on an existing question's vector.
  - **Reference**: `/question/similar-questions.md`

- **Task Name**: Create Answer (`T-12`)

  - **Description**: Implement `POST /api/answers` to allow users to answer community questions (preventing them from answering their own).
  - **Reference**: `/answer/create-answer.md`

- **Task Name**: AI Question Draft Coach (`T-17`)

  - **Description**: Implement `POST /api/questions/draft-coach` to provide real-time AI feedback and tips on question drafts.
  - **Reference**: `/question/draft-coach.md`

- **Task Name**: AI Answer Fit Evaluation (`T-18`)
  - **Description**: Implement `POST /api/questions/:questionHash/answer-fit` to evaluate how strongly a draft answer addresses the question.
  - **Reference**: `/question/answer-fit.md`

### Frontend Tasks

- **Task Name**: Layout Shell (`T-13`)

  - **Description**: Create the `Layout`, `Navbar`, and `Sidebar` components to wrap and navigate between protected routes.

- **Task Name**: Dashboard Page (`T-14`)

  - **Description**: Build the `/dashboard` page to list questions and handle keyword/semantic search inputs.
  - **Reference**: `/dashboard/task-dashboard.md`

- **Task Name**: Post Question Page (`T-15`)

  - **Description**: Build the `/questions/ask` form, seamlessly integrating the AI Draft Coach for real-time writing feedback.
  - **Reference**: `/post-question/task-post-question.md`

- **Task Name**: Question Detail Page (`T-16` & `T-20`)

  - **Description**: Build the `/questions/:questionHash` page to display the question, answers, and the new answer form equipped with AI Answer Fit.
  - **Reference**: `/question-detail/task-question-detail.md`

- **Task Name**: My Questions Page (`T-21`)
  - **Description**: Build the `/my-questions` page to display a personalized list of only the user's authored questions.
  - **Reference**: `/my-questions/task-my-questions.md`

---

## Milestone 3: Knowledge Base (RAG)

_Advanced AI feature allowing users to upload PDFs, perform semantic searches within them, and ask AI-grounded questions._

### Backend Tasks

- **Task Name**: Upload & Process RAG Document (`T-22`)

  - **Description**: Implement `POST /api/rag/documents` to securely upload PDFs, parse text, chunk paragraphs, and generate vector embeddings.
  - **Reference**: `/rag/create-document.md`

- **Task Name**: Semantic Search in RAG Document (`T-23`)

  - **Description**: Implement `GET /api/rag/documents/:documentId/search` to find and return the most relevant text excerpts within a PDF.
  - **Reference**: `/rag/search-document.md`

- **Task Name**: AI Query Grounded in RAG Document (`T-23`)

  - **Description**: Implement `POST /api/rag/documents/:documentId/query` to generate accurate AI answers based purely on the uploaded PDF's context.
  - **Reference**: `/rag/query-document.md`

- **Task Name**: Get RAG Document Metadata (`T-24`)

  - **Description**: Implement `GET /api/rag/documents/:documentId` to fetch processing status and metadata for a document.
  - **Reference**: `/rag/get-document-meta.md`

- **Task Name**: Stream RAG Document PDF (`T-24`)

  - **Description**: Implement `GET /api/rag/documents/:documentId/file` to serve the PDF blob for browser previews.
  - **Reference**: `/rag/get-document-file.md`

- **Task Name**: List My RAG Documents (`T-24`)

  - **Description**: Implement `GET /api/rag/documents` to list all PDFs uploaded by the authenticated user.
  - **Reference**: `/rag/list-documents.md`

- **Task Name**: Delete RAG Document (`T-24`)
  - **Description**: Implement `DELETE /api/rag/documents/:documentId` to safely remove a PDF from disk and cascade delete its vectors from the database.
  - **Reference**: `/rag/delete-document.md`

### Frontend Tasks

- **Task Name**: RAG Documents Page (`T-24` & `T-25`)
  - **Description**: Build the `/rag-documents` page featuring a document list sidebar, PDF upload dropzone, and a 3-tab active view interface (Ask AI, Semantic Search, PDF Preview).
  - **Reference**: `/rag-documents/task-rag-documents.md`

  


## Milestone 4: Account & Engagement Upgrade
_Adds Google sign-in, self-service password recovery, a modern responsive profile menu, user-controlled appearance settings, and real-time notifications when a user's question is answered._
### Backend Tasks
- **Task Name**: Google Sign-In & Sign-Up (`T-25`)
  - **Description**: Implement `POST /api/auth/google` to verify a Google ID token, create or link a user account, and return our own JWT, allowing sign-in and sign-up via "Continue with Google."
  - **Reference**: `/auth/google-signin.md`
- **Task Name**: Request Password Reset Code (`T-26`)
  - **Description**: Implement `POST /api/auth/forgot-password` to generate a 6-digit verification code, store it hashed with an expiry, and email it to the user.
  - **Reference**: `/auth/forgot-password.md`
- **Task Name**: Verify Password Reset Code (`T-26`)
  - **Description**: Implement `POST /api/auth/verify-reset-code` to validate the submitted code against the stored hash and expiry, returning a short-lived reset token on success.
  - **Reference**: `/auth/verify-reset-code.md`
- **Task Name**: Reset Password (`T-26`)
  - **Description**: Implement `POST /api/auth/reset-password` to validate the reset token and update the user's password hash in the database.
  - **Reference**: `/auth/reset-password.md`
- **Task Name**: Update User Settings (`T-28`)
  - **Description**: Implement `PATCH /api/users/settings` to persist a user's theme preference (light or dark) to their account.
  - **Reference**: `/users/update-settings.md`
- **Task Name**: List Notifications (`T-29`)
  - **Description**: Implement `GET /api/notifications` to fetch the authenticated user's notification history, most recent first.
  - **Reference**: `/notifications/list-notifications.md`
- **Task Name**: Mark Notification as Read (`T-29`)
  - **Description**: Implement `PATCH /api/notifications/:notificationId/read` to mark a single notification as read for the authenticated user.
  - **Reference**: `/notifications/mark-notification-read.md`
- **Task Name**: Real-Time Notification Delivery (`T-29`)
  - **Description**: Set up a Socket.io server attached to the existing HTTP server, authenticate socket connections via JWT, and emit a `notification:new` event the instant an answer is posted to a user's question.
  - **Reference**: `/notifications/realtime-delivery.md`
### Frontend Tasks
- **Task Name**: Google Sign-In Button (`T-25`)
  - **Description**: Add "Continue with Google" to the sign-in and sign-up pages using `@react-oauth/google`, sending the returned credential to the backend and handling the login response the same way as the existing email/password flow.
  - **Reference**: `/auth/google-signin-ui.md`
- **Task Name**: Forgot Password Flow (`T-26`)
  - **Description**: Build the three-screen forgot password flow — enter email, enter verification code, set new password — wired to the three backend endpoints in sequence.
  - **Reference**: `/auth/forgot-password-ui.md`
- **Task Name**: Responsive Profile Menu (`T-27`)
  - **Description**: Build a header avatar dropdown showing the user's name, email, a Settings link, and Sign Out, collapsing into a full-width slide-down panel on mobile screens.
  - **Reference**: `/profile/profile-menu.md`
- **Task Name**: Settings Page & Theme Toggle (`T-28`)
  - **Description**: Build the `/settings` page with a light/dark mode toggle, backed by a `ThemeContext` that applies the theme instantly and persists the choice to the user's account.
  - **Reference**: `/settings/theme-toggle.md`
- **Task Name**: Live Notification Bell (`T-29`)
  - **Description**: Build a notification bell icon with an unread-count badge, a dropdown panel listing notification history, and a live Socket.io connection that updates the badge instantly when a new notification arrives.
  - **Reference**: `/notifications/notification-bell-ui.md`

  ## Milestone 5: AI Forum Intelligence
_Advanced AI features that turn the forum itself into a knowledge base — chat with the forum, summarize long discussions, auto-moderate new content, and surface the best answer automatically._
### Backend Tasks
- **Task Name**: Forum Post Embedding Pipeline (`T-30`)
  - **Description**: Implement a background ingestion process that chunks every question and answer, generates vector embeddings via Gemini, and stores them so the entire forum becomes searchable the same way an uploaded RAG document is.
  - **Reference**: `/ai-forum/embedding-pipeline.md`
- **Task Name**: RAG Forum Chatbot Query (`T-30`)
  - **Description**: Implement `POST /api/forum-chat/query` to embed a user's natural-language question, run a similarity search across all forum post vectors, and generate a Gemini answer with citations back to the source posts.
  - **Reference**: `/ai-forum/forum-chatbot-query.md`
- **Task Name**: AI Answer Summarizer (`T-31`)
  - **Description**: Implement `GET /api/questions/:questionHash/answer-summary` to send all answers for a question to Gemini and return a short bulleted summary of the key points and consensus.
  - **Reference**: `/ai-forum/answer-summarizer.md`
- **Task Name**: AI Content Moderation Check (`T-32`)
  - **Description**: Implement `POST /api/moderation/check` to scan a new question or answer for spam, toxic language, and duplicate content using Gemini, returning a flag status and reason.
  - **Reference**: `/ai-forum/moderation-check.md`
- **Task Name**: Moderation Review Queue (`T-32`)
  - **Description**: Implement `GET /api/moderation/queue` and `PATCH /api/moderation/:itemId/resolve` to list flagged content for a moderator and approve or remove it, backed by a new `moderation_status` column.
  - **Reference**: `/ai-forum/moderation-queue.md`
- **Task Name**: AI Accepted Answer Recommendation (`T-33`)
  - **Description**: Implement `GET /api/questions/:questionHash/recommend-answer` to have Gemini evaluate all answers together against correctness, upvotes, and completeness, returning a recommended answer ID with a confidence score and reasoning.
  - **Reference**: `/ai-forum/recommend-answer.md`
### Frontend Tasks
- **Task Name**: Forum AI Chatbot Widget (`T-30`)
  - **Description**: Build a floating chat widget accessible from any page that sends user questions to `/api/forum-chat/query` and renders the AI's answer with clickable citation links back to the original forum posts.
  - **Reference**: `/ai-forum/forum-chatbot-ui.md`
- **Task Name**: Answer Discussion Summary Panel (`T-31`)
  - **Description**: Add a collapsible "Discussion Summary" panel above the answers list on the question detail page, populated from `/answer-summary`, shown only when a question has more than a set number of answers.
  - **Reference**: `/ai-forum/answer-summary-ui.md`
- **Task Name**: Moderation Review Dashboard (`T-32`)
  - **Description**: Build an admin-only `/moderation` page listing flagged questions and answers with their AI-given reason, and Approve/Remove actions wired to the moderation queue endpoints.
  - **Reference**: `/ai-forum/moderation-dashboard-ui.md`
- **Task Name**: Recommended Answer Badge (`T-33`)
  - **Description**: Display a "Recommended Answer" badge with confidence percentage above the AI-selected answer on the question detail page, with a tooltip explaining the reasoning behind the recommendation.
  - **Reference**: `/ai-forum/recommended-answer-ui.md`

