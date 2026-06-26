// backend/src/api/forum-chat/service/forum-chat.service.js
import { GoogleGenAI } from "@google/genai";
import { db, safeExecute } from "../../../../db/config.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
const TOP_K = parseInt(process.env.RECOMMEND_K, 10) || 5;

// ─────────────────────────────────────────────
// cosineSimilarity — same logic reused across
// ─────────────────────────────────────────────
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error(
      `Vector dimension mismatch: ${vectorA.length} vs ${vectorB.length}`,
    );
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

// ─────────────────────────────────────────────
// embedQuery — the user's chatbot question.
// ─────────────────────────────────────────────
async function embedQuery(queryText) {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: queryText,
    config: { taskType: "RETRIEVAL_QUERY" },
  });

  return response.embeddings[0].values;
}

// ─────────────────────────────────────────────
// fetchForumPostVectors()
// ─────────────────────────────────────────────
async function fetchForumPostVectors() {
  const rows = await safeExecute(
    `SELECT post_type, post_id, embedding
     FROM forum_post_vectors
     WHERE status = 'ready'`,
    [],
  );

  return rows.map((row) => ({
    sourceType: row.post_type, // 'question' or 'answer'
    postId: row.post_id,
    embedding:
      typeof row.embedding === "string"
        ? JSON.parse(row.embedding)
        : row.embedding,
  }));
}

// ─────────────────────────────────────────────
// fetchUserDocumentVectors(userId)
// ─────────────────────────────────────────────
async function fetchUserDocumentVectors(userId) {
  const rows = await safeExecute(
    `SELECT dcv.chunk_id, dcv.embedding
     FROM document_chunk_vectors dcv
     JOIN document_chunks dc ON dc.chunk_id = dcv.chunk_id
     JOIN documents d        ON d.document_id = dc.document_id
     WHERE d.user_id = ?
       AND dcv.status = 'ready'`,
    [userId],
  );

  return rows.map((row) => ({
    sourceType: "document",
    chunkId: row.chunk_id,
    embedding:
      typeof row.embedding === "string"
        ? JSON.parse(row.embedding)
        : row.embedding,
  }));
}

// ─────────────────────────────────────────────
// hydrateCitations(topMatches)
// ─────────────────────────────────────────────
async function hydrateCitations(topMatches) {
  const citations = [];

  // Group matches by source type so we can batch-fetch each kind
  const questionIds = topMatches
    .filter((m) => m.sourceType === "question")
    .map((m) => m.postId);

  const answerIds = topMatches
    .filter((m) => m.sourceType === "answer")
    .map((m) => m.postId);

  const chunkIds = topMatches
    .filter((m) => m.sourceType === "document")
    .map((m) => m.chunkId);

  const scoreMap = new Map(
    topMatches.map((m) => [
      `${m.sourceType}:${m.postId ?? m.chunkId}`,
      m.score,
    ]),
  );

  // ── Hydrate questions ───────────────────────
  if (questionIds.length > 0) {
    const placeholders = questionIds.map(() => "?").join(", ");
    const rows = await safeExecute(
      `SELECT question_id, question_hash, title, content
       FROM questions
       WHERE question_id IN (${placeholders})`,
      questionIds,
    );

    rows.forEach((row) => {
      citations.push({
        sourceType: "question",
        questionHash: row.question_hash,
        questionId: row.question_id,
        excerpt: row.title,
        score: scoreMap.get(`question:${row.question_id}`),
      });
    });
  }

  // ── Hydrate answers ─────────────────────────
  if (answerIds.length > 0) {
    const placeholders = answerIds.map(() => "?").join(", ");
    const rows = await safeExecute(
      `SELECT a.answer_id, a.content, q.question_hash
       FROM answers a
       JOIN questions q ON q.question_id = a.question_id
       WHERE a.answer_id IN (${placeholders})`,
      answerIds,
    );

    rows.forEach((row) => {
      citations.push({
        sourceType: "answer",
        questionHash: row.question_hash,
        answerId: row.answer_id,
        excerpt: row.content.slice(0, 200),
        score: scoreMap.get(`answer:${row.answer_id}`),
      });
    });
  }

  // ── Hydrate document chunks ─────────────────
  if (chunkIds.length > 0) {
    const placeholders = chunkIds.map(() => "?").join(", ");
    const rows = await safeExecute(
      `SELECT dc.chunk_id, dc.content, d.document_id, d.title
       FROM document_chunks dc
       JOIN documents d ON d.document_id = dc.document_id
       WHERE dc.chunk_id IN (${placeholders})`,
      chunkIds,
    );

    rows.forEach((row) => {
      citations.push({
        sourceType: "document",
        documentId: row.document_id,
        documentTitle: row.title,
        chunkId: row.chunk_id,
        excerpt: row.content.slice(0, 200),
        score: scoreMap.get(`document:${row.chunk_id}`),
      });
    });
  }

  // Re-sort combined citations by score, highest first
  return citations.sort((a, b) => b.score - a.score);
}

// ─────────────────────────────────────────────
// queryForumChatService({ query, userId })
// ─────────────────────────────────────────────
export async function queryForumChatService({ query, userId }) {
  // Step 1 — embed the query (never stored, search-only)
  const queryEmbedding = await embedQuery(query);

  // Step 2 — gather candidates from both knowledge bases
  const [forumVectors, documentVectors] = await Promise.all([
    fetchForumPostVectors(),
    fetchUserDocumentVectors(userId),
  ]);

  const allCandidates = [...forumVectors, ...documentVectors];

  // Step 3 — score everything in one unified ranking
  const scored = allCandidates.map((candidate) => ({
    ...candidate,
    score: cosineSimilarity(queryEmbedding, candidate.embedding),
  }));

  // Step 4 — take top K across BOTH sources combined
  const topMatches = scored.sort((a, b) => b.score - a.score).slice(0, TOP_K);

  if (topMatches.length === 0) {
    return {
      answer:
        "I couldn't find any relevant information in the forum or your documents to answer that question.",
      citations: [],
    };
  }

  // Step 5 — hydrate full citation details
  const citations = await hydrateCitations(topMatches);

  // Step 6 — build grounded context from excerpts
  const context = citations
    .map((c, i) => `[${i + 1}] ${c.excerpt}`)
    .join("\n\n");

  // Step 7 — call Gemini with the grounded prompt
  const prompt = `
You are a helpful assistant for a developer forum. Answer the user's
question using ONLY the context below. Reference sources using their
bracket number, e.g. [1], [2]. If the context doesn't contain enough
information, say so honestly rather than guessing.

Context:
${context}

Question:
${query}
`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash-lite",
    contents: prompt,
  });

  // Step 8 — return answer + citations
  return {
    answer: response.text,
    citations,
  };
}
