/**
 * Nrix HumanizeAI — Orchestrator Service
 * ========================================
 * Routes requests through the multi-stage NLP pipeline:
 *   1. Try Python transformer pipeline (T5 + NLTK + WordNet)
 *   2. Fall back to JS rule-based engine if Python unavailable
 *   3. Apply final tone refinement pass
 *   4. Return humanized text + readability metrics
 */

import { generateHumanizedTextWithLocalModel } from "./localModelService.js";
import { humanizeWithFallback } from "./fallbackHumanizer.js";

/**
 * Final tone refinement pass — light touch after main pipeline.
 * Only fixes edge cases that slip through the main processing.
 */
const applyFinalTonePass = (text, tone) => {
  let revised = text.trim();

  // Remove any double-applied fillers or artifacts
  revised = revised
    .replace(/\s{2,}/g, " ")
    .replace(/\.\s*\./g, ".")
    .replace(/,\s*,/g, ",")
    .replace(/\s+([,.!?;:])/g, "$1");

  if (tone === "professional") {
    // Ensure no contractions leaked through
    revised = revised
      .replace(/\bdon't\b/gi, "do not")
      .replace(/\bcan't\b/gi, "cannot")
      .replace(/\bit's\b/gi, "it is")
      .replace(/\bwon't\b/gi, "will not")
      .replace(/\bdidn't\b/gi, "did not");
  }

  if (tone === "casual") {
    // Ensure contractions are present
    revised = revised
      .replace(/\bdo not\b/gi, "don't")
      .replace(/\bcannot\b/gi, "can't")
      .replace(/\bit is\b/gi, "it's")
      .replace(/\bwill not\b/gi, "won't")
      .replace(/\bdid not\b/gi, "didn't");
  }

  return revised;
};

/**
 * Main humanization entrypoint.
 * @param {object} params
 * @param {string} params.text       - Input text to humanize
 * @param {string} params.tone       - professional | friendly | casual
 * @param {string} params.mode       - humanize | formal | simplify | expand | academic
 * @param {number} params.creativity - 1–10 creativity level
 * @returns {Promise<object>} { humanizedText, provider, readability, fallbackReason? }
 */
export const generateHumanizedText = async ({ text, tone, mode = "humanize", creativity }) => {
  const localModelEnabled = process.env.ENABLE_LOCAL_TRANSFORMER !== "false";

  if (localModelEnabled) {
    try {
      const result = await generateHumanizedTextWithLocalModel({
        text,
        tone,
        mode,
        creativity,
      });

      if (result?.humanizedText?.trim()) {
        // The Python pipeline already does full processing,
        // just apply a light final tone pass
        const finalText = applyFinalTonePass(result.humanizedText.trim(), tone);

        return {
          humanizedText: finalText,
          provider: result.provider || "local-transformer",
          readability: result.readability || null,
        };
      }
    } catch (error) {
      console.warn(
        `[HumanizeAI] Transformer pipeline failed, falling back to rule engine: ${error.message}`
      );

      // Fall through to rule-based engine
      const fallbackResult = humanizeWithFallback({ text, tone, mode, creativity });

      return {
        humanizedText: applyFinalTonePass(fallbackResult.humanizedText, tone),
        provider: "local-rule-engine",
        readability: fallbackResult.readability || null,
        fallbackReason: error.message,
      };
    }
  }

  // Rule-based engine only
  const fallbackResult = humanizeWithFallback({ text, tone, mode, creativity });

  return {
    humanizedText: applyFinalTonePass(fallbackResult.humanizedText, tone),
    provider: "local-rule-engine",
    readability: fallbackResult.readability || null,
  };
};
