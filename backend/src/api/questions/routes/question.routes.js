import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import {
  createQuestionController,
  listQuestionsController,
  getQuestionDetailsController,
} from "../controller/question.controller.js";
import { createQuestionValidation } from "../validations/question.validation.js";

const router = express.Router();

// POST /api/questions
router.post(
  "/",
  authenticateUser,
  createQuestionValidation,
  createQuestionController,
);

// Get/api/questions
router.get(
  "/", 
  authenticateUser, 
  listQuestionsController
);

router.get(
  "/:questionHash", 
  authenticateUser,
  getQuestionDetailsController
);

export default router;
