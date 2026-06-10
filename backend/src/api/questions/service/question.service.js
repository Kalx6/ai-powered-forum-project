import crypto from "crypto";
import { safeExecute } from "../../../../db/config.js";
import {
  normalizeQuestionText,
  generateQuestionEmbedding,
  storeQuestionVector,
} from "./vector.service.js";

const generateQuestionHash = () => crypto.randomBytes(8).toString("hex");

export const createQuestionService = async ({ title, content, userId }) => {
  const questionHash = generateQuestionHash();

  const result = await safeExecute(
    `INSERT INTO questions (question_hash, title, content, user_id)
     VALUES (?, ?, ?, ?)`,
    [questionHash, title, content, userId],
  );

  const questionId = result.insertId;

  const sourceText = normalizeQuestionText(title);

  try {
    const embedding = await generateQuestionEmbedding(sourceText);

    await storeQuestionVector({
      questionId,
      sourceText,
      embedding,
      status: "ready",
    });
  } catch (err) {
    await storeQuestionVector({
      questionId,
      sourceText,
      embedding: [],
      status: "failed",
    });
  }

  return {
    id: questionId,
    questionHash,
    title,
    content,
    userId,
  };
};

export const listQuestionsService = async ({ search, mine, userId }) => {
  let sql = `
    SELECT
      question_id,
      question_hash,
      title,
      content,
      user_id,
      created_at
    FROM questions
    WHERE 1=1
  `;

  const params = [];

  // Search by keyword
  if (search) {
    sql += `
      AND (
        title LIKE ?
        OR content LIKE ?
      )
    `;

    params.push(`%${search}%`);
    params.push(`%${search}%`);
  }

  // Mine filter
  if (mine === "true") {
    sql += ` AND user_id = ? `;
    params.push(userId);
  }

  sql += ` ORDER BY created_at DESC`;

  const questions = await safeExecute(sql, params);

  return questions;
};