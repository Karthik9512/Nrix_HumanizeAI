import Conversion from "../models/Conversion.js";

export const saveConversionRecord = async ({
  originalText,
  humanizedText,
  tone,
  creativity
}) => {
  return Conversion.create({
    originalText,
    humanizedText,
    tone,
    creativity
  });
};

export const getRecentConversions = async () => {
  return Conversion.find().sort({ createdAt: -1 }).limit(20).lean();
};
