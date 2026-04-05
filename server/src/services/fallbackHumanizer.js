/**
 * Nrix HumanizeAI — Advanced Rule-Based Fallback Humanizer
 * ==========================================================
 * Used when the Python transformer pipeline is unavailable.
 * Implements: synonym replacement, sentence restructuring,
 * AI-giveaway removal, burstiness, tone/mode overlays,
 * natural connectors, and quality scoring.
 */

// ---------------------------------------------------------------------------
// AI-Giveaway Word Replacements (words AI detectors flag)
// ---------------------------------------------------------------------------
const AI_GIVEAWAY_REPLACEMENTS = [
  [/\bdelve(?:s)?\b/gi, "explore"],
  [/\btapestry\b/gi, "mix"],
  [/\blandscape\b/gi, "field"],
  [/\brealm\b/gi, "area"],
  [/\bpivotal\b/gi, "key"],
  [/\bcrucial\b/gi, "important"],
  [/\bfacilitate(?:s)?\b/gi, "help"],
  [/\bseamless(?:ly)?\b/gi, "smooth"],
  [/\brobust\b/gi, "strong"],
  [/\bleverage(?:s)?\b/gi, "use"],
  [/\bsynergy\b/gi, "teamwork"],
  [/\bparadigm\b/gi, "approach"],
  [/\bholistic\b/gi, "overall"],
  [/\bunlock(?:s)?\b/gi, "open up"],
  [/\bempower(?:s)?\b/gi, "help"],
  [/\btransformative\b/gi, "significant"],
  [/\bcutting-edge\b/gi, "modern"],
  [/\bstate-of-the-art\b/gi, "latest"],
  [/\bgroundbreaking\b/gi, "new"],
  [/\brevolutionary\b/gi, "major"],
  [/\binnovative\b/gi, "practical"],
  [/\badvanced\b/gi, "strong"],
  [/\boptimi[sz]e\b/gi, "improve"],
  [/\benhance(?:s)?\b/gi, "improve"],
  [/\bstreamline(?:s)?\b/gi, "simplify"],
  [/\butilize(?:s)?\b/gi, "use"],
  [/\bmission-critical\b/gi, "important"],
  [/\bplethora\b/gi, "lots"],
  [/\bmyriad\b/gi, "many"],
  [/\bfoster(?:s|ing)?\b/gi, "build"],
  [/\bnavigate(?:s|ing)?\b/gi, "work through"],
  [/\ba testament to\b/gi, "proof of"],
  [/\bin today's fast-paced world\b/gi, "today"],
  [/\bit is important to note that\b/gi, ""],
  [/\bit should be noted that\b/gi, ""],
  [/\bin order to\b/gi, "to"],
  [/\bin the realm of\b/gi, "in"],
  [/\bdeliver scalable outcomes\b/gi, "support growth"],
  [/\boperational efficiency\b/gi, "day-to-day efficiency"],
  [/\bmodern teams\b/gi, "today's teams"],
  [/\bmodern organizations\b/gi, "today's organizations"],
];

// ---------------------------------------------------------------------------
// Context-Aware Synonym Map (200+ pairs grouped by POS)
// ---------------------------------------------------------------------------
const SYNONYM_MAP = {
  // Verbs
  improve: ["enhance", "boost", "refine", "strengthen", "upgrade"],
  increase: ["raise", "grow", "expand", "elevate", "lift"],
  decrease: ["reduce", "lower", "shrink", "cut", "drop"],
  create: ["build", "develop", "design", "produce", "craft"],
  provide: ["offer", "supply", "deliver", "give", "furnish"],
  ensure: ["guarantee", "confirm", "verify", "make sure", "secure"],
  implement: ["apply", "carry out", "execute", "put in place", "roll out"],
  demonstrate: ["show", "illustrate", "display", "highlight", "reveal"],
  analyze: ["examine", "study", "review", "assess", "evaluate"],
  establish: ["set up", "found", "create", "introduce", "form"],
  maintain: ["keep", "sustain", "preserve", "uphold", "retain"],
  achieve: ["reach", "accomplish", "attain", "realize", "gain"],
  consider: ["think about", "weigh", "reflect on", "look at", "evaluate"],
  require: ["need", "demand", "call for", "involve", "expect"],
  suggest: ["recommend", "propose", "advise", "indicate", "hint at"],
  address: ["tackle", "handle", "deal with", "resolve", "manage"],
  identify: ["spot", "recognize", "pinpoint", "detect", "find"],
  contribute: ["add to", "support", "promote", "aid", "play a part in"],
  indicate: ["show", "suggest", "point to", "signal", "reveal"],
  develop: ["build", "create", "grow", "evolve", "advance"],
  // Adjectives
  significant: ["notable", "meaningful", "major", "considerable", "important"],
  important: ["key", "vital", "essential", "critical", "central"],
  effective: ["useful", "productive", "successful", "capable", "powerful"],
  various: ["different", "diverse", "several", "multiple", "a range of"],
  specific: ["particular", "definite", "precise", "exact", "certain"],
  comprehensive: ["thorough", "complete", "extensive", "wide-ranging", "detailed"],
  fundamental: ["basic", "core", "essential", "primary", "key"],
  substantial: ["large", "considerable", "significant", "major", "sizable"],
  consistent: ["steady", "reliable", "uniform", "regular", "constant"],
  relevant: ["related", "applicable", "fitting", "appropriate", "pertinent"],
  // Nouns
  approach: ["method", "strategy", "technique", "system", "way"],
  process: ["procedure", "method", "steps", "workflow", "routine"],
  framework: ["structure", "system", "model", "setup", "outline"],
  strategy: ["plan", "approach", "tactic", "method", "roadmap"],
  environment: ["setting", "context", "space", "surroundings", "conditions"],
  perspective: ["viewpoint", "angle", "outlook", "stance", "position"],
  opportunity: ["chance", "opening", "possibility", "prospect", "option"],
  challenge: ["obstacle", "difficulty", "issue", "hurdle", "problem"],
  component: ["part", "element", "piece", "section", "feature"],
  outcome: ["result", "effect", "consequence", "product", "finding"],
  // Adverbs
  significantly: ["notably", "considerably", "greatly", "meaningfully", "substantially"],
  effectively: ["efficiently", "successfully", "productively", "well", "capably"],
  particularly: ["especially", "notably", "specifically", "distinctly", "chiefly"],
  additionally: ["also", "plus", "on top of that", "besides", "as well"],
  consequently: ["as a result", "therefore", "so", "because of this", "thus"],
  furthermore: ["also", "in addition", "plus", "what's more", "besides"],
  moreover: ["also", "besides", "what's more", "in addition", "on top of that"],
  primarily: ["mainly", "chiefly", "mostly", "largely", "above all"],
};

// ---------------------------------------------------------------------------
// Contraction Maps
// ---------------------------------------------------------------------------
const CONTRACTION_RULES = [
  [/\bdo not\b/gi, "don't"],
  [/\bdoes not\b/gi, "doesn't"],
  [/\bdid not\b/gi, "didn't"],
  [/\bcannot\b/gi, "can't"],
  [/\bcould not\b/gi, "couldn't"],
  [/\bshould not\b/gi, "shouldn't"],
  [/\bwould not\b/gi, "wouldn't"],
  [/\bwill not\b/gi, "won't"],
  [/\bis not\b/gi, "isn't"],
  [/\bare not\b/gi, "aren't"],
  [/\bwas not\b/gi, "wasn't"],
  [/\bwere not\b/gi, "weren't"],
  [/\bhave not\b/gi, "haven't"],
  [/\bhas not\b/gi, "hasn't"],
  [/\bhad not\b/gi, "hadn't"],
  [/\bit is\b/gi, "it's"],
  [/\bthat is\b/gi, "that's"],
  [/\bwe are\b/gi, "we're"],
  [/\byou are\b/gi, "you're"],
  [/\bthey are\b/gi, "they're"],
  [/\bI am\b/gi, "I'm"],
  [/\blet us\b/gi, "let's"],
  [/\bI have\b/gi, "I've"],
  [/\byou have\b/gi, "you've"],
  [/\bwe have\b/gi, "we've"],
  [/\bthey have\b/gi, "they've"],
  [/\bI will\b/gi, "I'll"],
  [/\byou will\b/gi, "you'll"],
  [/\bwe will\b/gi, "we'll"],
  [/\bthey will\b/gi, "they'll"],
];

const EXPANSION_RULES = [
  [/\bdon't\b/gi, "do not"],
  [/\bdoesn't\b/gi, "does not"],
  [/\bdidn't\b/gi, "did not"],
  [/\bcan't\b/gi, "cannot"],
  [/\bcouldn't\b/gi, "could not"],
  [/\bshouldn't\b/gi, "should not"],
  [/\bwouldn't\b/gi, "would not"],
  [/\bwon't\b/gi, "will not"],
  [/\bisn't\b/gi, "is not"],
  [/\baren't\b/gi, "are not"],
  [/\bwasn't\b/gi, "was not"],
  [/\bweren't\b/gi, "were not"],
  [/\bhaven't\b/gi, "have not"],
  [/\bhasn't\b/gi, "has not"],
  [/\bhadn't\b/gi, "had not"],
  [/\bit's\b/gi, "it is"],
  [/\bthat's\b/gi, "that is"],
  [/\bwe're\b/gi, "we are"],
  [/\byou're\b/gi, "you are"],
  [/\bthey're\b/gi, "they are"],
  [/\bI'm\b/gi, "I am"],
  [/\blet's\b/gi, "let us"],
  [/\bI've\b/gi, "I have"],
  [/\byou've\b/gi, "you have"],
  [/\bwe've\b/gi, "we have"],
  [/\bthey've\b/gi, "they have"],
  [/\bI'll\b/gi, "I will"],
  [/\byou'll\b/gi, "you will"],
  [/\bwe'll\b/gi, "we will"],
  [/\bthey'll\b/gi, "they will"],
];

// ---------------------------------------------------------------------------
// Formal <-> Casual Lexicon
// ---------------------------------------------------------------------------
const FORMAL_UPGRADES = [
  [/\bhelp\b/gi, "assist"],
  [/\bget\b/gi, "obtain"],
  [/\bshow\b/gi, "demonstrate"],
  [/\bbig\b/gi, "substantial"],
  [/\bgood\b/gi, "favorable"],
  [/\bbad\b/gi, "adverse"],
  [/\btry\b/gi, "attempt"],
  [/\bneed\b/gi, "require"],
  [/\bstart\b/gi, "commence"],
  [/\bbuy\b/gi, "purchase"],
  [/\bgive\b/gi, "provide"],
  [/\bmake sure\b/gi, "ensure"],
  [/\bfind out\b/gi, "determine"],
  [/\blook at\b/gi, "examine"],
];

const CASUAL_DOWNGRADES = [
  [/\butilize\b/gi, "use"],
  [/\btherefore\b/gi, "so"],
  [/\bhowever\b/gi, "but"],
  [/\bfurthermore\b/gi, "plus"],
  [/\bmoreover\b/gi, "also"],
  [/\bconsequently\b/gi, "so"],
  [/\bapproximately\b/gi, "about"],
  [/\bnevertheless\b/gi, "still"],
  [/\bdemonstrate\b/gi, "show"],
  [/\bobtain\b/gi, "get"],
  [/\bcommence\b/gi, "start"],
  [/\bconclude\b/gi, "finish"],
  [/\brequire\b/gi, "need"],
  [/\bprovide\b/gi, "give"],
  [/\bassist\b/gi, "help"],
  [/\bpurchase\b/gi, "buy"],
  [/\binquire\b/gi, "ask"],
];

// ---------------------------------------------------------------------------
// Natural Connectors & Fillers
// ---------------------------------------------------------------------------
const NATURAL_CONNECTORS = [
  "That said,",
  "Still,",
  "On the other hand,",
  "Plus,",
  "Even so,",
  "Granted,",
  "Now,",
  "Here's the thing —",
  "Mind you,",
  "Then again,",
  "To put it simply,",
  "In practice,",
];

const FILLER_PHRASES = [
  "honestly",
  "in my experience",
  "from what I can tell",
  "when you think about it",
  "as it turns out",
  "interestingly enough",
  "truth be told",
  "to be fair",
  "if you ask me",
  "I'd say",
];

const ACADEMIC_HEDGES = [
  "It appears that",
  "Evidence suggests that",
  "One could argue that",
  "It is worth noting that",
  "Research indicates that",
  "This suggests that",
  "Broadly speaking,",
  "In principle,",
];

// ---------------------------------------------------------------------------
// Utility Helpers
// ---------------------------------------------------------------------------
const normalizeWhitespace = (text) =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const splitParagraphs = (text) =>
  normalizeWhitespace(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

const splitSentences = (paragraph) =>
  paragraph
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((s) => s.trim())
    .filter(Boolean) || [];

const titleCase = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
const lowerFirst = (t) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : t);
const ensurePunctuation = (t) => (/[.!?]$/.test(t) ? t : `${t}.`);
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomFloat = () => Math.random();

// ---------------------------------------------------------------------------
// Stage 1 — Remove AI Giveaway Patterns
// ---------------------------------------------------------------------------
const removeAIGiveaways = (sentence) => {
  let result = sentence;
  for (const [pattern, replacement] of AI_GIVEAWAY_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
};

// ---------------------------------------------------------------------------
// Stage 2 — Context-Aware Synonym Replacement
// ---------------------------------------------------------------------------
const applySynonymReplacement = (sentence, replaceProbability = 0.2) => {
  let result = sentence;
  const keys = Object.keys(SYNONYM_MAP);

  for (const word of keys) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    if (regex.test(result) && randomFloat() < replaceProbability) {
      const synonyms = SYNONYM_MAP[word];
      const chosen = randomFrom(synonyms);
      // Only replace the first occurrence to avoid over-substitution
      result = result.replace(regex, (match) => {
        if (match[0] === match[0].toUpperCase()) {
          return titleCase(chosen);
        }
        return chosen;
      });
    }
  }

  return result;
};

// ---------------------------------------------------------------------------
// Stage 3 — Sentence Restructuring
// ---------------------------------------------------------------------------
const restructureSentence = (sentence, creativity) => {
  if (creativity < 4) return sentence;

  const trimmed = sentence.replace(/[.!?]$/, "");

  // Move "because/since" clause to front (~30% of the time)
  const becauseMatch = trimmed.match(/^(.+?)\s+(because|since|as)\s+(.+)$/i);
  if (becauseMatch && randomFloat() < 0.3) {
    const [, main, conj, reason] = becauseMatch;
    return `${titleCase(conj)} ${reason.replace(/\.$/, "")}, ${lowerFirst(main)}.`;
  }

  // Split long comma-heavy sentences (~25% of the time)
  if (
    sentence.split(",").length >= 3 &&
    sentence.length > 100 &&
    randomFloat() < 0.25
  ) {
    const [first, ...rest] = trimmed.split(", ");
    const secondPart = rest.join(", ");
    if (secondPart.length > 30) {
      return `${first}. ${titleCase(secondPart)}.`;
    }
  }

  // Inverted conditional: "If X, then Y" → "Y — assuming X"
  const ifMatch = trimmed.match(/^if\s+(.+?),\s*(?:then\s+)?(.+)$/i);
  if (ifMatch && creativity >= 6 && randomFloat() < 0.2) {
    const [, condition, consequence] = ifMatch;
    return `${titleCase(consequence)} — assuming ${lowerFirst(condition)}.`;
  }

  return sentence;
};

// ---------------------------------------------------------------------------
// Stage 4 — Tone & Mode Application
// ---------------------------------------------------------------------------
const applyContractions = (text) => {
  let result = text;
  for (const [pattern, replacement] of CONTRACTION_RULES) {
    result = result.replace(pattern, replacement);
  }
  return result;
};

const expandContractions = (text) => {
  let result = text;
  for (const [pattern, replacement] of EXPANSION_RULES) {
    result = result.replace(pattern, replacement);
  }
  return result;
};

const applyToneAndMode = (sentence, tone, mode) => {
  let result = sentence;

  if (mode === "formal" || tone === "professional") {
    result = expandContractions(result);
    for (const [pattern, replacement] of FORMAL_UPGRADES) {
      result = result.replace(pattern, replacement);
    }
  } else if (mode === "simplify" || tone === "casual") {
    result = applyContractions(result);
    for (const [pattern, replacement] of CASUAL_DOWNGRADES) {
      result = result.replace(pattern, replacement);
    }
  } else if (tone === "friendly") {
    result = applyContractions(result);
    for (const [pattern, replacement] of CASUAL_DOWNGRADES.slice(0, 6)) {
      result = result.replace(pattern, replacement);
    }
  }

  if (mode === "academic") {
    result = expandContractions(result);
    for (const [pattern, replacement] of FORMAL_UPGRADES) {
      result = result.replace(pattern, replacement);
    }
  }

  return result;
};

// ---------------------------------------------------------------------------
// Stage 5 — Anti-Detection: Burstiness, Fillers, Connectors
// ---------------------------------------------------------------------------
const addBurstiness = (sentences) => {
  if (sentences.length < 3) return sentences;
  const result = [...sentences];

  for (let i = 0; i < result.length - 1; i++) {
    const currentWords = result[i].split(/\s+/).length;

    // After a long sentence, make the next one shorter
    if (currentWords > 20 && randomFloat() < 0.3) {
      const nextWords = result[i + 1].split(/\s+/);
      if (nextWords.length > 10) {
        const cut = Math.floor(nextWords.length / 2);
        const short = nextWords.slice(0, cut).join(" ").replace(/,$/, "") + ".";
        let remainder = nextWords.slice(cut).join(" ");
        if (remainder) {
          remainder = titleCase(remainder);
          if (!/[.!?]$/.test(remainder)) remainder += ".";
          result[i + 1] = short;
          result.splice(i + 2, 0, remainder);
        }
      }
    }

    // Merge two very short sentences
    if (currentWords < 8 && i + 1 < result.length) {
      const nextLen = result[i + 1].split(/\s+/).length;
      if (nextLen < 10 && randomFloat() < 0.25) {
        const merged =
          result[i].replace(/\.$/, "") +
          ", and " +
          lowerFirst(result[i + 1]);
        result[i] = ensurePunctuation(merged);
        result.splice(i + 1, 1);
      }
    }
  }

  return result;
};

const insertFillers = (sentences, mode, probability = 0.08) => {
  if (mode === "formal" || mode === "academic") return sentences;

  return sentences.map((s) => {
    if (randomFloat() < probability && s.split(/\s+/).length > 6) {
      const filler = randomFrom(FILLER_PHRASES);
      return `${titleCase(filler)}, ${lowerFirst(s)}`;
    }
    return s;
  });
};

const varyConnectors = (sentences, probability = 0.12) => {
  const blandStarts = new Set([
    "additionally",
    "furthermore",
    "moreover",
    "consequently",
    "subsequently",
    "in addition",
    "as a result",
  ]);

  return sentences.map((s) => {
    const firstPart = s.split(",")[0]?.trim().toLowerCase() || "";
    if (blandStarts.has(firstPart) && randomFloat() < probability) {
      const connector = randomFrom(NATURAL_CONNECTORS);
      const rest = s.replace(/^[^,]+,\s*/, "");
      return `${connector} ${rest}`;
    }
    return s;
  });
};

const addAcademicHedging = (sentences, probability = 0.15) => {
  return sentences.map((s, i) => {
    if (i > 0 && randomFloat() < probability && s.split(/\s+/).length > 8) {
      const hedge = randomFrom(ACADEMIC_HEDGES);
      return `${hedge} ${lowerFirst(s)}`;
    }
    return s;
  });
};

// ---------------------------------------------------------------------------
// Mode-Specific Transforms
// ---------------------------------------------------------------------------
const expandSentences = (sentences) => {
  const elaborations = [
    "This matters because it directly affects outcomes.",
    "In other words, the impact is significant.",
    "This is especially true when you consider the bigger picture.",
    "The implications of this are worth considering.",
    "And that can make all the difference.",
  ];

  const result = [];
  for (let i = 0; i < sentences.length; i++) {
    result.push(sentences[i]);
    if (i > 0 && i % 3 === 0 && randomFloat() < 0.4) {
      result.push(randomFrom(elaborations));
    }
  }
  return result;
};

const simplifySentences = (sentences) => {
  const result = [];
  for (const s of sentences) {
    const words = s.split(/\s+/);
    if (words.length > 25 && s.includes(",")) {
      const [first, ...rest] = s.replace(/[.!?]$/, "").split(", ");
      const second = rest.join(", ");
      if (second.length > 15) {
        result.push(ensurePunctuation(first));
        result.push(ensurePunctuation(titleCase(second)));
        continue;
      }
    }
    result.push(s);
  }
  return result;
};

// ---------------------------------------------------------------------------
// Stage 6 — Quality Scoring
// ---------------------------------------------------------------------------
const countSyllables = (word) => {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  const vowels = "aeiouy";
  let count = 0;
  let prevVowel = false;
  for (const char of w) {
    const isVowel = vowels.includes(char);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (w.endsWith("e") && count > 1) count--;
  return Math.max(1, count);
};

const computeReadability = (text) => {
  const sentences = splitSentences(text);
  const words = text.split(/\s+/).filter(Boolean);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const totalWords = Math.max(words.length, 1);
  const totalSentences = Math.max(sentences.length, 1);
  const avgSentenceLength = totalWords / totalSentences;
  const avgSyllables = syllables / totalWords;

  const flesch = Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllables)
  );

  const lengths = sentences.map((s) => s.split(/\s+/).length);
  const meanLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance =
    lengths.reduce((sum, l) => sum + (l - meanLen) ** 2, 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  return {
    fleschScore: Math.round(flesch * 10) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    sentenceLengthVariance: Math.round(stdDev * 10) / 10,
    wordCount: totalWords,
    sentenceCount: totalSentences,
  };
};

const qualityScore = (source, candidate) => {
  const metrics = computeReadability(candidate);

  const srcWords = new Set(source.toLowerCase().match(/[a-z']+/g) || []);
  const candWords = new Set(candidate.toLowerCase().match(/[a-z']+/g) || []);
  const intersection = [...srcWords].filter((w) => candWords.has(w));
  const overlap = intersection.length / Math.max(srcWords.size, 1);

  const repeated = (candidate.match(/\b(\w+)\s+\1\b/gi) || []).length;
  const lengthDelta =
    Math.abs(candidate.length - source.length) / Math.max(source.length, 1);

  let score = 100;
  score -= Math.abs(overlap - 0.62) * 35;
  score -= repeated * 12;
  score -= lengthDelta * 20;
  score += Math.min(metrics.sentenceLengthVariance, 8) * 2;
  score -= Math.abs(metrics.fleschScore - 55) * 0.15;

  return Math.max(1, score);
};

// ---------------------------------------------------------------------------
// Remove Repeated Sentence Openings
// ---------------------------------------------------------------------------
const deduplicateOpenings = (sentences) => {
  const seen = new Map();
  return sentences.map((s, i) => {
    const opening = s.split(/\s+/).slice(0, 2).join(" ").toLowerCase();
    const count = seen.get(opening) || 0;
    seen.set(opening, count + 1);
    if (count === 0 || i === 0) return s;
    // Try varying the opening
    const connector = NATURAL_CONNECTORS[i % NATURAL_CONNECTORS.length];
    const body = s.replace(/^[^,]+,\s*/, "");
    return body !== s ? `${connector} ${body}` : s;
  });
};

// ---------------------------------------------------------------------------
// Main Pipeline
// ---------------------------------------------------------------------------
const buildVariant = (text, tone, mode, creativity, shift = 0) => {
  const adjustedCreativity = Math.max(1, Math.min(10, creativity + shift));
  const replaceProbability = 0.12 + adjustedCreativity / 80;

  const rewrittenParagraphs = splitParagraphs(text).map((paragraph) => {
    let sentences = splitSentences(paragraph).map((sentence, index) => {
      // Stage 1: AI giveaway removal
      let revised = removeAIGiveaways(sentence);

      // Stage 2: Synonym replacement
      revised = applySynonymReplacement(revised, replaceProbability);

      // Stage 3: Restructuring
      revised = restructureSentence(revised, adjustedCreativity);

      // Stage 4: Tone & mode
      revised = applyToneAndMode(revised, tone, mode);

      // Clean up whitespace/punctuation
      revised = revised
        .replace(/\s{2,}/g, " ")
        .replace(/\s+([,.!?;:])/g, "$1")
        .trim();

      return ensurePunctuation(titleCase(revised));
    });

    // Stage 5: Anti-detection (paragraph-level)
    sentences = addBurstiness(sentences);
    sentences = varyConnectors(sentences);
    sentences = deduplicateOpenings(sentences);

    if (
      mode === "humanize" ||
      mode === "simplify" ||
      tone === "casual" ||
      tone === "friendly"
    ) {
      sentences = insertFillers(
        sentences,
        mode,
        0.06 + adjustedCreativity / 200
      );
    }

    if (mode === "academic") {
      sentences = addAcademicHedging(sentences);
    }

    if (mode === "expand") {
      sentences = expandSentences(sentences);
    }

    if (mode === "simplify") {
      sentences = simplifySentences(sentences);
    }

    return sentences.join(" ");
  });

  // Reduce repeated words
  let joined = rewrittenParagraphs.join("\n\n");
  joined = joined
    .replace(/\b(\w+)\s+\1\b/gi, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  return joined;
};

export const humanizeWithFallback = ({ text, tone, mode = "humanize", creativity }) => {
  const normalizedInput = normalizeWhitespace(text);
  const validMode = ["humanize", "formal", "simplify", "expand", "academic"].includes(mode)
    ? mode
    : "humanize";

  // Generate 3 variants with slight creativity shifts, pick best
  const candidates = [-1, 0, 1].map((shift) => {
    const candidateText = buildVariant(
      normalizedInput,
      tone,
      validMode,
      creativity,
      shift
    );
    return {
      text: candidateText,
      score: qualityScore(normalizedInput, candidateText),
    };
  });

  const sortedCandidates = candidates.sort((a, b) => b.score - a.score);
  const best = sortedCandidates[0].text;
  
  // Return up to 3 diverse variants
  const variants = sortedCandidates.slice(0, 3).map(c => c.text);
  const readability = computeReadability(best);

  return { humanizedText: variants, readability };
};
