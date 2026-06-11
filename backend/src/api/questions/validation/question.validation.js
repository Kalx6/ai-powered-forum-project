// src/api/questions/question.validation.js
import { query, param } from "express-validator";

// ── T-11: Semantic Search ───────────────────── 

const searchQuestionsValidation = [
  query("query")
    .trim()
    .exists({ checkFalsy: true })
    .withMessage("Search query is required")
    .isLength({ min: 5 })
    .withMessage("Search query must be at least 5 characters"),

  query("k")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("k must be an integer between 1 and 20")
    .toInt(),

  query("threshold")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("Threshold must be a number between 0 and 1")
    .toFloat(),
];

const similarQuestionsValidation = [
  param("questionHash")
    .trim()
    .exists({ checkFalsy: true })
    .withMessage("Question hash is required")
    .isHexadecimal()
    .withMessage("Question hash must be a valid hexadecimal string")
    .isLength({ min: 16, max: 16 })
    .withMessage("Question hash must be exactly 16 characters"),

  query("k")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("k must be an integer between 1 and 20")
    .toInt(),

  query("threshold")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("Threshold must be a number between 0 and 1")
    .toFloat(),
];

export { searchQuestionsValidation, similarQuestionsValidation };
