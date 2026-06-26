// backend/src/api/forum-chat/validation/forum-chat.validation.js
import { body } from "express-validator";

const forumChatQueryValidation = [
  body("query")
    .trim()
    .exists({ checkFalsy: true })
    .withMessage("Query is required")
    .isLength({ min: 5 })
    .withMessage("Query must be at least 5 characters"),
];

export { forumChatQueryValidation };
