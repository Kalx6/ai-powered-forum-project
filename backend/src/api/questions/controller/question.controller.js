import { assessAnswerAgainstQuestionService } from "../service/geminiTextCoach.service.js";

const assessAnswerAgainstQuestionController = async (req, res, next) => {
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
    next(error); // handled by error-handler.js middleware
  }
};

export { assessAnswerAgainstQuestionController };
