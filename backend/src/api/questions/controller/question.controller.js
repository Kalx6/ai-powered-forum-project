// src/api/questions/controller/question.controller.js
import {
  searchQuestionsSemanticService,
  getSimilarQuestionsService,
} from "../service/questions.service.js";
import {
  assessAnswerAgainstQuestionService,
  generateQuestionDraftCoachService,
} from "../service/geminiTextCoach.service.js";

// ── T-11: Semantic Search ─────────────────────
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

// ── T-11: Similar Questions by Hash ─────────────

async function getSimilarQuestionsController(req, res, next) {
  try {
    const { questionHash } = req.params;
    const { k, threshold } = req.query;

    const { results, meta } = await getSimilarQuestionsService({
      questionHash,
      k,
      threshold,
    });

    return res.status(200).json({
      success: true,
      message: "Similar questions fetched successfully",
      data: results,
      meta,
    });
  } catch (error) {
    next(error);
  }
}

// ── Leader: Assess Answer Against Question ────
export const assessAnswerAgainstQuestionController = async (req, res, next) => {
  try {
    const { questionHash } = req.params;
    const { answerText } = req.body;

    const result = await assessAnswerAgainstQuestionService(
      questionHash,
      answerText,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Answer fit assessed",
      data: {
        level: result.level,
        note: result.note,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Leader: Generate Question Draft Coach ─────
export const generateQuestionDraftCoachController = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const result = await generateQuestionDraftCoachService(title, content);

    return res.status(200).json({
      success: true,
      message: "Draft suggestions generated",
      data: {
        tips: result.tips,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { searchQuestionsSemanticController, getSimilarQuestionsController };
