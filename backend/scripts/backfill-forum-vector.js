// backend/scripts/backfill-forum-vectors.js
//
// One-time script to embed existing questions and answers
// into forum_post_vectors for the AI Forum Chatbot (T-30).
//
// Run manually with: node backend/scripts/backfill-forum-vectors.js
//
// Safe to re-run — uses INSERT ... ON DUPLICATE KEY UPDATE,
// so it only processes posts that don't already have a vector.

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { db, safeExecute } from "../db/config.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

async function embedText(text) {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { taskType: "RETRIEVAL_DOCUMENT" },
  });
  return response.embeddings[0].values;
}

async function backfillQuestions() {
  // ─────────────────────────────────────────────
  // Find questions with NO existing forum_post_vectors row.
  // LEFT JOIN + WHERE fpv.vector_id IS NULL is the standard
  // pattern for "find rows in A that have no matching row in B".
  // ─────────────────────────────────────────────
  const questions = await safeExecute(
    `SELECT q.question_id, q.title, q.content
     FROM questions q
     LEFT JOIN forum_post_vectors fpv
       ON fpv.post_type = 'question' AND fpv.post_id = q.question_id
     WHERE fpv.vector_id IS NULL`,
    [],
  );

  console.log(`Found ${questions.length} questions to embed.`);

  for (const q of questions) {
    try {
      // Combine title + content for richer embedding context
      const sourceText = `${q.title}\n\n${q.content}`;
      const embedding = await embedText(sourceText);

      await safeExecute(
        `INSERT INTO forum_post_vectors
           (post_type, post_id, source_text, embedding, status)
         VALUES ('question', ?, ?, ?, 'ready')
         ON DUPLICATE KEY UPDATE
           source_text = VALUES(source_text),
           embedding = VALUES(embedding),
           status = 'ready'`,
        [q.question_id, sourceText, JSON.stringify(embedding)],
      );

      console.log(`  ✓ question ${q.question_id} embedded`);
    } catch (err) {
      console.error(`  ✗ question ${q.question_id} failed:`, err);
    }
  }
}

async function backfillAnswers() {
  const answers = await safeExecute(
    `SELECT a.answer_id, a.content
     FROM answers a
     LEFT JOIN forum_post_vectors fpv
       ON fpv.post_type = 'answer' AND fpv.post_id = a.answer_id
     WHERE fpv.vector_id IS NULL`,
    [],
  );

  console.log(`Found ${answers.length} answers to embed.`);

  for (const a of answers) {
    try {
      const embedding = await embedText(a.content);

      await safeExecute(
        `INSERT INTO forum_post_vectors
           (post_type, post_id, source_text, embedding, status)
         VALUES ('answer', ?, ?, ?, 'ready')
         ON DUPLICATE KEY UPDATE
           source_text = VALUES(source_text),
           embedding = VALUES(embedding),
           status = 'ready'`,
        [a.answer_id, a.content, JSON.stringify(embedding)],
      );

      console.log(`  ✓ answer ${a.answer_id} embedded`);
    } catch (err) {
      console.error(`  ✗ answer ${a.answer_id} failed:`, err);
    }
  }
}

async function main() {
  console.log("Starting forum post vector backfill...\n");

  await backfillQuestions();
  console.log("");
  await backfillAnswers();

  //   console.log(process.env.GEMINI_API_KEY);

  //   console.log("\nBackfill complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
