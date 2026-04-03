import {
  getRecentConversions,
  saveConversionRecord
} from "../services/historyService.js";

export const getHistory = async (_request, response, next) => {
  try {
    const history = await getRecentConversions();

    response.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

export const saveConversion = async (request, response, next) => {
  try {
    const savedItem = await saveConversionRecord(request.body);

    response.status(201).json({
      success: true,
      message: "Conversion saved successfully.",
      data: savedItem
    });
  } catch (error) {
    next(error);
  }
};
