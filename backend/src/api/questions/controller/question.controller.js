import { StatusCodes } from "http-status-codes";
import {
  createQuestionService,
  listQuestionsService,
  getQuestionDetailsService,
} from "../service/question.service.js";

export const createQuestionController = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const result = await createQuestionService({
      title,
      content,
      userId: req.user.id, //authenticated user
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Question created successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const listQuestionsController = async (req, res, next) => {
  try {
    const { search, mine } = req.query;

    const questions = await listQuestionsService({
      search,
      mine,
      userId: req.user.id,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Questions fetched successfully",
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionDetailsController = async (req, res, next) => {
  try {
    const { questionHash } = req.params;

    const data = await getQuestionDetailsService(questionHash);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Question details fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};