import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import {
  searchDocumentController,
  queryDocumentController,
  getDocumentMetaController,
} from "../controller/rag.controller.js";
import { documentIdParamValidation } from "../validations/rag.validation.js";

const router = express.Router();

router.get(
  "/documents/:documentId/search",
  authenticateUser,
  searchDocumentController,
);

router.post(
  "/documents/:documentId/query",
  authenticateUser,
  queryDocumentController,
);

// T-24 - Get Document Metadata
router.get(
  "/documents/:documentId",
  authenticateUser,
  documentIdParamValidation,
  getDocumentMetaController,
);

export default router;
