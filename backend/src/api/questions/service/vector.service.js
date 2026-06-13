import { GoogleGenAI } from "@google/genai";
import { safeExecute } from "../../../../db/config.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const normalizeQuestionText = (text) => {
  return text.trim().replace(/\s+/g, " ");
};

export const generateQuestionEmbedding = async (text) => {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001", // ✅ available on your key
      contents: text,
      config: {
        taskType: "RETRIEVAL_DOCUMENT",
      },
    });

    return response.embeddings[0].values;
  } catch (error) {
    console.error("Error generating question embedding:", error);
    throw error;
  }
};

export const storeQuestionVector = async ({
  questionId,
  sourceText,
  embedding,
  status = "ready",
}) => {
  await safeExecute(
    `
      INSERT INTO question_vectors
      (
        question_id,
        source_text,
        embedding,
        status
      )
      VALUES (?, ?, ?, ?)
    `,
    [questionId, sourceText, JSON.stringify(embedding), status],
  );
};
