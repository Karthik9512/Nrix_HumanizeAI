import { generateHumanizedText } from "../services/openaiService.js";

export const humanizeText = async (request, response, next) => {
  try {
    const { text, tone, creativity } = request.body;
    const result = await generateHumanizedText({ text, tone, creativity });

    response.status(200).json({
      success: true,
      message:
        result.provider === "local-transformer"
          ? "Text humanized successfully using the local transformer model."
          : "Text humanized successfully using the built-in local rewrite engine.",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
