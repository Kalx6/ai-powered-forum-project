// src/api/questions/question.controller.js
import { searchQuestionsSemanticService } from "../service/questions.service.js";

async function searchQuestionsSemanticController(req, res, next) {
  try {
    const { query, k, threshold } = req.query;

    const { results, meta } = await searchQuestionsSemanticService({
      query,
      k,
      threshold,
    });

    return res.status(200).json({
      success: true,
      message: "Semantic search completed successfully",
      data: results,
      meta,
    });
  } catch (error) {
    next(error);
  }
}

export { searchQuestionsSemanticController };
