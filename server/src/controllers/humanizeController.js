import { generateHumanizedText } from "../services/openaiService.js";

const PROVIDER_MESSAGES = {
  "local-transformer":
    "Text humanized successfully using the local transformer model.",
  "local-rule-engine":
    "Text humanized successfully using the built-in local rewrite engine.",
};

export const humanizeText = async (request, response, next) => {
  try {
    const { text, tone, mode = "humanize", creativity } = request.body;
    const startTime = Date.now();

    const result = await generateHumanizedText({ text, tone, mode, creativity });

    const processingTime = Date.now() - startTime;

    response.status(200).json({
      success: true,
      message:
        PROVIDER_MESSAGES[result.provider] ||
        "Text humanized successfully.",
      data: {
        humanizedText: result.humanizedText,
        provider: result.provider,
        mode,
        tone,
        creativity,
        readability: result.readability || null,
        processingTimeMs: processingTime,
        ...(result.fallbackReason && {
          fallbackReason: result.fallbackReason,
        }),
      },
    });
  } catch (error) {
    next(error);
  }
};
