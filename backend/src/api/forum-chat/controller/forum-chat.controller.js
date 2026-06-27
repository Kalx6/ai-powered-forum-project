// backend/src/api/forum-chat/controller/forum-chat.controller.js
import { queryForumChatService } from "../service/forum-chat.service.js";

export async function queryForumChatController(req, res, next) {
  try {
    const { query } = req.body;
    const userId = req.user.id;

    const result = await queryForumChatService({ query, userId });

    return res.status(200).json({
      success: true,
      message: "Chatbot response generated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
