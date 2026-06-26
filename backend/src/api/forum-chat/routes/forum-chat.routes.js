// backend/src/api/forum-chat/routes/forum-chat.routes.js
import { Router } from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";
import { forumChatQueryValidation } from "../validation/forum-chat.validation.js";
import { queryForumChatController } from "../controller/forum-chat.controller.js";

const router = Router();

router.post(
  "/query",
  authenticateUser,
  forumChatQueryValidation,
  validationErrorHandler,
  queryForumChatController,
);

export default router;
