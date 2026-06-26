// backend/src/api/forum-chat/service/forum-post-vector.helper.js
import { safeExecute } from "../../../../db/config.js";
import {
  generateQuestionEmbedding,
  normalizeQuestionText,
} from "../../questions/service/vector.service.js";
// ↑ reuse existing embedding logic instead of duplicating it

// ─────────────────────────────────────────────
// embedForumPost(postType, postId, sourceText)
// ─────────────────────────────────────────────
export async function embedForumPost(postType, postId, sourceText) {
  const cleanText = normalizeQuestionText(sourceText);

  try {
    const embedding = await generateQuestionEmbedding(cleanText);

    await safeExecute(
      `INSERT INTO forum_post_vectors
         (post_type, post_id, source_text, embedding, status)
       VALUES (?, ?, ?, ?, 'ready')
       ON DUPLICATE KEY UPDATE
         source_text = VALUES(source_text),
         embedding = VALUES(embedding),
         status = 'ready'`,
      [postType, postId, cleanText, JSON.stringify(embedding)],
    );
  } catch (err) {
    console.error(
      `[embedForumPost] Failed to embed ${postType} ${postId}:`,
      err.message,
    );

    try {
      await safeExecute(
        `INSERT INTO forum_post_vectors
           (post_type, post_id, source_text, embedding, status)
         VALUES (?, ?, ?, '[]', 'failed')
         ON DUPLICATE KEY UPDATE status = 'failed'`,
        [postType, postId, cleanText],
      );
    } catch (_) {
      // even the failure-record insert failed — nothing more we can do
    }
  }
}
