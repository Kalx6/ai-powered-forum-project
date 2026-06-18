// backend/src/api/rag/routes/rag.routes.js
import { Router } from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import {
  ragUpload,
  createDocumentMulterErrorHandler,
} from "../config/rag.upload.config.js";
import { createDocumentController } from "../controller/rag.controller.js";

const router = Router();


router.post(
  "/documents",
  authenticateUser,
  ragUpload.single("file"),
  createDocumentMulterErrorHandler,
  createDocumentController,
);

export default router;
