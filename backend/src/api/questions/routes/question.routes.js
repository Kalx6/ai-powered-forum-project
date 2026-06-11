// src/api/questions/routes/question.routes.js
import { Router } from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";

// ── Validations ───────────────────────────────
import {
  validateQuestionHash,
  validateAnswerFitBody,
  generateQuestionDraftCoachValidation,
} from "../validations/question.validation.js";
import {
  searchQuestionsValidation,
  similarQuestionsValidation,
} from "../validation/question.validation.js";

// ── Controllers ───────────────────────────────
import {
  assessAnswerAgainstQuestionController,
  generateQuestionDraftCoachController,
  searchQuestionsSemanticController,
  getSimilarQuestionsController,
} from "../controller/question.controller.js";

const router = Router();

// ── Leader's routes ───────────────────────────

// POST /api/questions/draft-coach
router.post(
  "/draft-coach",
  authenticateUser,
  generateQuestionDraftCoachValidation,
  validationErrorHandler,
  generateQuestionDraftCoachController,
);

// POST /api/questions/:questionHash/answer-fit
router.post(
  "/:questionHash/answer-fit",
  authenticateUser,
  validateQuestionHash,
  validateAnswerFitBody,
  validationErrorHandler,
  assessAnswerAgainstQuestionController,
);

// ── T-11: Semantic Search ─────────────────────

// GET /api/questions/search
// IMPORTANT: static route must come BEFORE dynamic /:questionHash routes
router.get(
  "/search",
  authenticateUser,
  searchQuestionsValidation,
  validationErrorHandler,
  searchQuestionsSemanticController,
);

// ── T-11: Similar Questions by Hash ─────────────

router.get(
  "/:questionHash/similar",
  authenticateUser,
  similarQuestionsValidation,
  validationErrorHandler,
  getSimilarQuestionsController,
);

export default router;
