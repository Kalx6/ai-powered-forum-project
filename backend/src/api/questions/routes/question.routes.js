// src/api/questions/question.routes.js
import { Router } from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import { errorHandler } from "../../../middleware/error-handler.js";
import { searchQuestionsValidation } from "../validation/question.validation.js";
import { searchQuestionsSemanticController } from "../controller/question.controller.js";

const router = Router();

router.get(
  "/search",
  authenticateUser,
  searchQuestionsValidation,
  errorHandler,
  searchQuestionsSemanticController,
);

export default router;
