import { StatusCodes } from "http-status-codes";
import {
  searchDocumentService,
  queryDocumentService,
  getDocumentMetaService,
} from "../service/rag.service.js";

export const searchDocumentController = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { query, k = 5 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "query is required",
      });
    }

    const results = await searchDocumentService({
      documentId,
      query,
      k: Number(k),
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Document search completed successfully",
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

export const queryDocumentController = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { query } = req.body;

    const result = await queryDocumentService({
      documentId,
      query,
      userId: req.user.id,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "AI grounded answer generated successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// suud's part
export const getDocumentMetaController = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id; // set by authenticateUser middleware

    const document = await getDocumentMetaService(Number(documentId), userId);

    return res.status(200).json({
      success: true,
      message: "Document fetched successfully.",
      data: {
        document_id: document.document_id,
        title: document.title,
        mime_type: document.mime_type,
        byte_size: document.byte_size,
        status: document.status,
        error_message: document.error_message,
        created_at: document.created_at,
        updated_at: document.updated_at,
        user_id: document.user_id,
        storage_path: document.storage_path,
      },
    });
  } catch (error) {
    next(error); // NotFoundError handled by error-handler.js
  }
};