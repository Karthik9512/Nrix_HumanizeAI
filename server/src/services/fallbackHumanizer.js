const phraseReplacements = [
  [/\b(?:leverages|utilizes)\b/gi, "uses"],
  [/\butilize\b/gi, "use"],
  [/\binnovative\b/gi, "practical"],
  [/\badvanced\b/gi, "strong"],
  [/\bcutting-edge\b/gi, "modern"],
  [/\bstate-of-the-art\b/gi, "modern"],
  [/\boptimi[sz]e\b/gi, "improve"],
  [/\benhance\b/gi, "improve"],
  [/\bstreamline\b/gi, "simplify"],
  [/\bfacilitate\b/gi, "support"],
  [/\bempower\b/gi, "help"],
  [/\bunlock\b/gi, "create"],
  [/\brobust\b/gi, "reliable"],
  [/\bseamless\b/gi, "smooth"],
  [/\btransform\b/gi, "improve"],
  [/\bmodern teams\b/gi, "today's teams"],
  [/\bmodern organizations\b/gi, "today's organizations"],
  [/\boperational efficiency\b/gi, "day-to-day efficiency"],
  [/\bdeliver scalable outcomes\b/gi, "support growth"],
  [/\bmission-critical\b/gi, "important"],
  [/\bin order to\b/gi, "to"],
  [/\bit is important to note that\b/gi, ""],
  [/\bit should be noted that\b/gi, ""],
  [/\bin today's fast-paced world\b/gi, "today"],
  [/\bat the end of the day\b/gi, "ultimately"],
  [/\badditionally\b/gi, "also"],
  [/\bfurthermore\b/gi, "also"],
  [/\bmoreover\b/gi, "also"]
];

const contractions = {
  friendly: [
    [/\bdo not\b/gi, "don't"],
    [/\bcannot\b/gi, "can't"],
    [/\bit is\b/gi, "it's"],
    [/\bthat is\b/gi, "that's"],
    [/\bwe are\b/gi, "we're"],
    [/\byou are\b/gi, "you're"]
  ],
  casual: [
    [/\bdo not\b/gi, "don't"],
    [/\bcannot\b/gi, "can't"],
    [/\bit is\b/gi, "it's"],
    [/\bthat is\b/gi, "that's"],
    [/\bwe are\b/gi, "we're"],
    [/\byou are\b/gi, "you're"],
    [/\bthey are\b/gi, "they're"]
  ]
};

const fillerStarts = [/^overall,\s*/i, /^basically,\s*/i, /^in conclusion,\s*/i, /^to summarize,\s*/i];

const transitionByTone = {
  professional: ["As a result", "In practice", "That means", "Because of that"],
  friendly: ["That means", "On top of that", "What stands out is", "Because of that"],
  casual: ["So", "That means", "The big thing is", "Because of that"]
};

const toneRules = {
  professional: {
    trimWords: ["really", "very", "quite"],
    allowContractions: false
  },
  friendly: {
    trimWords: ["very"],
    allowContractions: true
  },
  casual: {
    trimWords: ["very", "quite"],
    allowContractions: true
  }
};

const normalizeWhitespace = (text) =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const splitParagraphs = (text) =>
  normalizeWhitespace(text)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const splitIntoSentences = (paragraph) =>
  paragraph
    .match(/[^.!?]+[.!?]*|[^.!?]+$/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) || [];

const titleCaseFirst = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

const lowercaseFirst = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : text);

const ensureSentencePunctuation = (text) => (/[.!?]$/.test(text) ? text : `${text}.`);

const cleanSentence = (sentence) => {
  let result = sentence.trim();

  fillerStarts.forEach((pattern) => {
    result = result.replace(pattern, "");
  });

  phraseReplacements.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });

  return ensureSentencePunctuation(
    result
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([,.!?;:])/g, "$1")
      .replace(/,\s*,/g, ",")
      .replace(/\bAI-generated\b/gi, "AI-written")
      .trim()
  );
};

const trimToneWords = (sentence, tone) => {
  let revised = sentence;

  toneRules[tone].trimWords.forEach((word) => {
    revised = revised.replace(new RegExp(`\\b${word}\\b`, "gi"), "");
  });

  return revised.replace(/\s{2,}/g, " ").replace(/\s+([,.!?])/g, "$1").trim();
};

const applyContractions = (sentence, tone) => {
  if (!toneRules[tone].allowContractions) {
    return sentence;
  }

  let revised = sentence;
  (contractions[tone] || []).forEach(([pattern, replacement]) => {
    revised = revised.replace(pattern, replacement);
  });

  return revised;
};

const rewriteLongSentence = (sentence, tone, creativity) => {
  const commaParts = sentence
    .replace(/[.?!]$/, "")
    .split(/,\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (commaParts.length < 2 || creativity < 6) {
    return sentence;
  }

  const [first, ...rest] = commaParts;
  const followUp = rest.join(", ");

  if (followUp.length < 30) {
    return sentence;
  }

  const transition = transitionByTone[tone][creativity % transitionByTone[tone].length];
  const normalizedFollowUp = followUp.replace(/^,\s*/, "").replace(/,\s+and\b/i, " and");
  const hasExplicitSubject = /^(it|this|that|these|those|they|we|you|the)\b/i.test(followUp);
  const secondClause = hasExplicitSubject
    ? `${transition}, ${lowercaseFirst(normalizedFollowUp)}.`
    : `${transition}, it also helps ${lowercaseFirst(normalizedFollowUp)}.`;

  return `${ensureSentencePunctuation(first)} ${secondClause}`;
};

const softenEnding = (sentence, tone, creativity) => {
  if (tone !== "friendly" || creativity < 7 || sentence.includes("easier to follow")) {
    return sentence;
  }

  return sentence.replace(/\.$/, ", which makes it easier to follow.");
};

const diversifyStructure = (sentence, tone, creativity, index) => {
  if (creativity < 5) {
    return sentence;
  }

  const trimmed = sentence.replace(/[.?!]$/, "");
  const words = trimmed.split(/\s+/);

  if (words.length < 10 || index % 2 !== 0) {
    return sentence;
  }

  const transition = transitionByTone[tone][index % transitionByTone[tone].length];

  if (/^(to|by|with)\b/i.test(trimmed)) {
    return `${transition}, ${lowercaseFirst(trimmed)}.`;
  }

  if (/\bwhile\b/i.test(trimmed) && creativity >= 7) {
    const parts = trimmed.split(/\bwhile\b/i).map((part) => part.trim());
    if (parts.length === 2 && parts[0] && parts[1]) {
      return `${titleCaseFirst(parts[1])} while ${lowercaseFirst(parts[0])}.`;
    }
  }

  return sentence;
};

const removeRepeatedOpenings = (sentences) => {
  const seen = new Map();

  return sentences.map((sentence, index) => {
    const opening = sentence.split(/\s+/).slice(0, 2).join(" ").toLowerCase();
    const count = seen.get(opening) || 0;
    seen.set(opening, count + 1);

    if (count === 0 || index === 0) {
      return sentence;
    }

    return sentence.replace(/^[^,]+,\s*/, "");
  });
};

const reduceRepeatedPhrases = (text) =>
  text
    .replace(/\b(\w+)\s+\1\b/gi, "$1")
    .replace(/\b(clear|natural|smooth|improve)\b(?:\s+\1\b)+/gi, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

const rewriteSentence = (sentence, tone, creativity, index) => {
  let revised = cleanSentence(sentence);
  revised = trimToneWords(revised, tone);
  revised = rewriteLongSentence(revised, tone, creativity);
  revised = diversifyStructure(revised, tone, creativity, index);
  revised = applyContractions(revised, tone);
  revised = softenEnding(revised, tone, creativity);
  revised = revised.replace(/\s{2,}/g, " ").replace(/\s+([,.!?])/g, "$1").trim();

  return ensureSentencePunctuation(titleCaseFirst(revised));
};

const scoreCandidate = (text, originalText) => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const avgSentenceLength =
    sentences.reduce((sum, sentence) => sum + sentence.split(/\s+/).length, 0) / sentences.length;
  const repetitionPenalty = text.match(/\b(\w+)(?:\s+\1\b)+/gi)?.length || 0;
  const lengthDelta = Math.abs(text.length - originalText.length) / Math.max(originalText.length, 1);

  let score = 100;
  score -= Math.abs(avgSentenceLength - 17) * 1.2;
  score -= repetitionPenalty * 10;
  score -= lengthDelta * 20;

  return Math.max(1, Math.round(score));
};

const buildVariant = (text, tone, creativity, shift = 0) => {
  const rewrittenParagraphs = splitParagraphs(text).map((paragraph) => {
    const sentences = splitIntoSentences(paragraph).map((sentence, index) =>
      rewriteSentence(sentence, tone, Math.max(1, Math.min(10, creativity + shift)), index)
    );

    return removeRepeatedOpenings(sentences).join(" ");
  });

  return reduceRepeatedPhrases(rewrittenParagraphs.join("\n\n"));
};

export const humanizeWithFallback = ({ text, tone, creativity }) => {
  const normalizedInput = normalizeWhitespace(text);
  const candidates = [-1, 0, 1].map((shift) => {
    const candidateText = buildVariant(normalizedInput, tone, creativity, shift);
    return { text: candidateText, score: scoreCandidate(candidateText, normalizedInput) };
  });

  return candidates.sort((left, right) => right.score - left.score)[0].text;
};
