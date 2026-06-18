// backend/src/api/rag/controller/rag.controller.js
import { createDocumentFromUploadService } from "../service/rag.service.js";

export async function createDocumentController(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please attach a PDF file.",
      });
    }

    const userId = req.user.id;

    const document = await createDocumentFromUploadService({
      userId,
      file: req.file,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded and processed.",
      data: document,
    });
  } catch (error) {
    next(error);
  }
}
