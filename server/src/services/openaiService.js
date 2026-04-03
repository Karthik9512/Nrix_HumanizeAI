import { generateHumanizedTextWithLocalModel } from "./localModelService.js";
import { humanizeWithFallback } from "./fallbackHumanizer.js";

const applyFinalTonePass = (text, tone) => {
  let revised = text.trim();

  if (tone === "professional") {
    return revised
      .replace(/\bdon't\b/gi, "do not")
      .replace(/\bcan't\b/gi, "cannot")
      .replace(/\bit's\b/gi, "it is")
      .replace(/\bhelp\b/gi, "support")
      .replace(/\bmake better\b/gi, "improve");
  }

  if (tone === "friendly") {
    revised = revised
      .replace(/\butilizing\b/gi, "using")
      .replace(/\butilizes\b/gi, "uses")
      .replace(/\butilize\b/gi, "use")
      .replace(/\benhances\b/gi, "makes better")
      .replace(/\bstreamlines\b/gi, "makes")
      .replace(/\boperational\b/gi, "day-to-day");

    if (!/easier to follow|approachable|clearer/i.test(revised)) {
      revised = `${revised} It feels clearer and easier to connect with.`;
    }

    return revised;
  }

  revised = revised
    .replace(/\butilizing\b/gi, "using")
    .replace(/\butilizes\b/gi, "uses")
    .replace(/\butilize\b/gi, "use")
    .replace(/\benhances\b/gi, "makes better")
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bcannot\b/gi, "can't");

  if (!/less stiff|more natural/i.test(revised)) {
    revised = `${revised} It sounds more natural and less stiff.`;
  }

  return revised;
};

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
          humanizedText: applyFinalTonePass(refinedText, tone),
          provider: result.provider || "local-transformer"
        };
      }
    } catch (error) {
      return {
        humanizedText: applyFinalTonePass(
          humanizeWithFallback({ text, tone, creativity }),
          tone
        ),
        provider: "local-rule-engine",
        fallbackReason: error.message
      };
    }
  }

  return {
    humanizedText: applyFinalTonePass(
      humanizeWithFallback({ text, tone, creativity }),
      tone
    ),
    provider: "local-rule-engine"
  };
};
