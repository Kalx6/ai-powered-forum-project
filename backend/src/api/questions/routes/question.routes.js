import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import {
  validateQuestionHash,
  validateAnswerFitBody,
} from "../validations/question.validation.js";
import { assessAnswerAgainstQuestionController } from "../controller/question.controller.js";

const router = express.Router();

router.post(
  "/:questionHash/answer-fit",
  authenticateUser,
  validateQuestionHash,
  validateAnswerFitBody,
  assessAnswerAgainstQuestionController,
);

export default router;
