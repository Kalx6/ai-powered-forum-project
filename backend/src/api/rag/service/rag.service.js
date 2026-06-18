// backend/src/api/rag/service/rag.service.js
import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import { db, safeExecute } from "../../../../db/config.js";



const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Constants from env ────────────────────────
const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
const CHUNK_CHARS = parseInt(process.env.RAG_CHUNK_CHARS, 10) || 900;
const CHUNK_OVERLAP = parseInt(process.env.RAG_CHUNK_OVERLAP, 10) || 120;
const MAX_CHUNKS = parseInt(process.env.RAG_MAX_CHUNKS_PER_DOC, 10) || 1000;
const MAX_PDFS_PER_USER = parseInt(process.env.RAG_MAX_PDFS_PER_USER, 10) || 20;
const MIN_TEXT_CHARS = parseInt(process.env.RAG_MIN_TEXT_CHARS, 10) || 50;


function chunkText(text) {
  const chunks = [];
  const step = CHUNK_CHARS - CHUNK_OVERLAP;
  let start = 0;

  while (start < text.length && chunks.length < MAX_CHUNKS) {
    const end = Math.min(start + CHUNK_CHARS, text.length);
    const chunk = text.slice(start, end).trim();

    // Skip empty or whitespace-only chunks
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start += step;
  }

  return chunks;
}


async function embedChunk(text) {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { taskType: "RETRIEVAL_DOCUMENT" },
  });

  return response.embeddings[0].values;
}

async function insertDocument(userId, file) {
  const RAG_UPLOAD_DIR = process.env.RAG_UPLOAD_DIR || "uploads/rag";

  // storage_path is relative: userId/filename
  // This makes the path portable across machines
  const storagePath = path.join(String(userId), path.basename(file.path));

  const result = await safeExecute(
    `INSERT INTO documents
       (user_id, title, mime_type, storage_path, byte_size, status)
     VALUES (?, ?, ?, ?, ?, 'processing')`,
    [userId, file.originalname, file.mimetype, storagePath, file.size],
  );

  return result.insertId;
}


async function checkUserDocumentLimit(userId) {
  const rows = await safeExecute(
    `SELECT COUNT(*) AS total
     FROM documents
     WHERE user_id = ?
       AND status != 'failed'`,
    [userId],
  );

  const total = rows[0].total;

  if (total >= MAX_PDFS_PER_USER) {
    throw new Error(
      `Document limit reached. Maximum ${MAX_PDFS_PER_USER} documents per user.`,
    );
  }
}


async function updateDocumentStatus(documentId, status, errorMessage = null) {
  await safeExecute(
    `UPDATE documents
     SET status = ?, error_message = ?
     WHERE document_id = ?`,
    [status, errorMessage, documentId],
  );
}

async function fetchDocument(documentId) {
  const rows = await safeExecute(
    `SELECT * FROM documents WHERE document_id = ?`,
    [documentId],
  );
  return rows[0];
}


export async function createDocumentFromUploadService({ userId, file }) {
  // Step 1 — check document limit before doing anything
  await checkUserDocumentLimit(userId);

  // Step 2 — insert document record immediately
  const documentId = await insertDocument(userId, file);

  try {

    const fileBuffer = fs.readFileSync(file.path);

    const parser = new PDFParse({ data: fileBuffer });

    const result = await parser.getText();

    const rawText = result.text || "";

    // Step 4 — validate extracted text
    if (rawText.trim().length < MIN_TEXT_CHARS) {
      throw new Error(
        "PDF contains insufficient text. It may be scanned or image-based.",
      );
    }

    // Step 5 — chunk the text
    const chunks = chunkText(rawText);

    if (chunks.length === 0) {
      throw new Error("No text chunks could be extracted from this PDF.");
    }

   
    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];

      // Insert chunk row
      const chunkResult = await safeExecute(
        `INSERT INTO document_chunks
           (document_id, chunk_index, content)
         VALUES (?, ?, ?)`,
        [documentId, i, chunkContent],
      );

      const chunkId = chunkResult.insertId;

      // Generate embedding for this chunk
      const embedding = await embedChunk(chunkContent);

      // Store the embedding vector
      await safeExecute(
        `INSERT INTO document_chunk_vectors
           (chunk_id, source_text, embedding, status)
         VALUES (?, ?, ?, 'ready')`,
        [chunkId, chunkContent, JSON.stringify(embedding)],
      );
    }

    // Step 7 — mark document as ready
    await updateDocumentStatus(documentId, "ready");
  } catch (err) {
   
    await updateDocumentStatus(documentId, "failed", err.message);
    throw err;
  } finally {
   
    try {
      fs.unlinkSync(file.path);
    } catch (_) {
      // file already gone — not a problem
    }
  }

  // Step 8 — return the full document record
  return fetchDocument(documentId);
}
