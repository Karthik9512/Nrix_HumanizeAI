import { generateHumanizedTextWithLocalModel } from "./localModelService.js";
import { humanizeWithFallback } from "./fallbackHumanizer.js";

export const generateHumanizedText = async ({ text, tone, creativity }) => {
  const localModelEnabled = process.env.ENABLE_LOCAL_TRANSFORMER !== "false";

  if (localModelEnabled) {
    try {
      const result = await generateHumanizedTextWithLocalModel({
        text,
        tone,
        creativity
      });

      if (result?.humanizedText?.trim()) {
        const refinedText = humanizeWithFallback({
          text: result.humanizedText.trim(),
          tone,
          creativity: Math.min(creativity, 3)
        });

        return {
          humanizedText: refinedText,
          provider: result.provider || "local-transformer"
        };
      }
    } catch (error) {
      return {
        humanizedText: humanizeWithFallback({ text, tone, creativity }),
        provider: "local-rule-engine",
        fallbackReason: error.message
      };
    }
  }

  return {
    humanizedText: humanizeWithFallback({ text, tone, creativity }),
    provider: "local-rule-engine"
  };
};
