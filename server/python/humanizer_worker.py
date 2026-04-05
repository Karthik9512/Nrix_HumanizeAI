"""
Nrix HumanizeAI — Advanced Multi-Stage NLP Pipeline
====================================================
Stages:
  1. Preprocessing    → sentence splitting, normalization
  2. Paraphrasing     → T5-base transformer with diverse beam search
  3. NLP Enhancement  → synonym replacement (WordNet), restructuring
  4. Tone & Mode      → register adjustment, contractions, lexicon
  5. Anti-Detection   → burstiness, natural imperfections, variance
  6. Quality Scoring  → pick best candidate from N variants
"""

import json
import math
import random
import re
import sys
from functools import lru_cache

# ---------------------------------------------------------------------------
# NLP bootstrap (download data on first run, silently)
# ---------------------------------------------------------------------------
def _ensure_nlp_data():
    import nltk
    for pkg in ("punkt", "punkt_tab", "averaged_perceptron_tagger",
                "averaged_perceptron_tagger_eng", "wordnet", "omw-1.4"):
        try:
            nltk.data.find(f"tokenizers/{pkg}" if "punkt" in pkg
                           else f"taggers/{pkg}" if "tagger" in pkg
                           else f"corpora/{pkg}")
        except LookupError:
            nltk.download(pkg, quiet=True)
    
    try:
        import spacy
        if not spacy.util.is_package("en_core_web_sm"):
            import subprocess
            subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], check=True)
    except ImportError:
        pass

_ensure_nlp_data()

import nltk
from nltk.corpus import wordnet
from nltk.tokenize import sent_tokenize, word_tokenize

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except (ImportError, Exception):
    nlp = None

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MODES = ("humanize", "formal", "simplify", "expand", "academic")

FILLER_PHRASES = [
    "honestly", "in my experience", "from what I can tell",
    "at the end of the day", "when you think about it",
    "as it turns out", "interestingly enough", "truth be told",
    "if you ask me", "I'd say", "to be fair",
]

NATURAL_CONNECTORS = [
    "That said,", "Still,", "On the other hand,", "Plus,",
    "And yet,", "Even so,", "Granted,", "Now,",
    "Look,", "Here's the thing —", "Mind you,", "Then again,",
]

ACADEMIC_HEDGE = [
    "It appears that", "Evidence suggests that", "One could argue that",
    "It is worth noting that", "Research indicates that",
    "This suggests that", "Broadly speaking,", "In principle,",
]

AI_GIVEAWAY_PATTERNS = [
    (r"\bdelve\b", "explore"),
    (r"\bdelves\b", "explores"),
    (r"\btapestry\b", "mix"),
    (r"\blandscape\b", "field"),
    (r"\brealm\b", "area"),
    (r"\bpivotal\b", "important"),
    (r"\bcrucial\b", "important"),
    (r"\bfacilitate\b", "help"),
    (r"\bfacilitates\b", "helps"),
    (r"\bseamless(?:ly)?\b", "smooth"),
    (r"\brobust\b", "strong"),
    (r"\bleverage\b", "use"),
    (r"\bleverages\b", "uses"),
    (r"\bsynergy\b", "teamwork"),
    (r"\bparadigm\b", "approach"),
    (r"\bholistic\b", "overall"),
    (r"\bunlock\b", "open up"),
    (r"\bunlocks\b", "opens up"),
    (r"\bempower\b", "help"),
    (r"\bempowers\b", "helps"),
    (r"\btransformative\b", "significant"),
    (r"\bcutting-edge\b", "modern"),
    (r"\bstate-of-the-art\b", "latest"),
    (r"\bin today's fast-paced world\b", "today"),
    (r"\bit is important to note that\b", ""),
    (r"\bit should be noted that\b", ""),
    (r"\bin order to\b", "to"),
    (r"\bin the realm of\b", "in"),
    (r"\ba testament to\b", "proof of"),
    (r"\bplethora\b", "lots"),
    (r"\bmyriad\b", "many"),
    (r"\bfostering\b", "building"),
    (r"\bfoster\b", "build"),
    (r"\bnavigating\b", "working through"),
    (r"\bnavigate\b", "work through"),
    (r"\benhance\b", "improve"),
    (r"\benhances\b", "improves"),
    (r"\boptimi[sz]e\b", "improve"),
    (r"\bstreamline\b", "simplify"),
    (r"\binnovative\b", "new"),
    (r"\bgroundbreaking\b", "new"),
    (r"\brevolutionary\b", "major"),
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def split_sentences(text: str) -> list[str]:
    """NLTK-based sentence splitting with fallback."""
    try:
        return [s.strip() for s in sent_tokenize(text) if s.strip()]
    except Exception:
        return [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]


def split_paragraphs(text: str) -> list[str]:
    cleaned = re.sub(r"\r\n", "\n", text)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return [p.strip() for p in cleaned.split("\n\n") if p.strip()]


# ---------------------------------------------------------------------------
# Stage 1 — Preprocessing
# ---------------------------------------------------------------------------
def preprocess(text: str) -> list[list[str]]:
    """Return list of paragraphs, each a list of sentences."""
    paragraphs = split_paragraphs(text)
    return [split_sentences(p) for p in paragraphs]


# ---------------------------------------------------------------------------
# Stage 2 — Transformer Paraphrasing
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def load_pipeline():
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    model_name = "humarin/chatgpt_paraphraser_on_T5_base"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    return tokenizer, model


def paraphrase_sentence(sentence: str, creativity: int, num_candidates: int = 4) -> list[str]:
    """Generate N paraphrase candidates for a single sentence."""
    import torch
    tokenizer, model = load_pipeline()

    prompt = f"paraphrase: {sentence} </s>"
    encoded = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=256)

    temperature = min(1.2, 0.4 + creativity / 18)
    top_p = min(0.97, 0.78 + creativity / 80)
    num_beams = max(3, 6 - creativity // 3)

    with torch.no_grad():
        outputs = model.generate(
            **encoded,
            max_new_tokens=180,
            do_sample=True,
            top_p=top_p,
            temperature=temperature,
            repetition_penalty=1.22,
            no_repeat_ngram_size=3,
            num_beams=num_beams,
            num_return_sequences=num_candidates,
            early_stopping=True,
        )

    return [tokenizer.decode(o, skip_special_tokens=True) for o in outputs]


def pick_best_paraphrase(source: str, candidates: list[str]) -> str:
    """Score each candidate on overlap, length, and artifact penalty."""
    src_words = set(re.findall(r"[a-z']+", source.lower()))

    def _score(c: str) -> float:
        c_clean = normalize_whitespace(c)
        c_words = set(re.findall(r"[a-z']+", c_clean.lower()))
        overlap = len(src_words & c_words) / max(len(src_words), 1)
        length_delta = abs(len(c_clean) - len(source)) / max(len(source), 1)
        # Penalise prompt leakage
        leakage = sum(1 for p in ("paraphrase:", "rewrite:", "return only")
                       if p in c_clean.lower())
        score = 100.0
        score -= abs(overlap - 0.65) * 40
        score -= length_delta * 25
        score -= leakage * 50
        return score

    ranked = sorted(candidates, key=_score, reverse=True)
    return normalize_whitespace(ranked[0])


# ---------------------------------------------------------------------------
# Stage 3 — NLP Enhancement (WordNet synonyms, restructuring)
# ---------------------------------------------------------------------------
_POS_MAP = {"NN": wordnet.NOUN, "NNS": wordnet.NOUN,
            "VB": wordnet.VERB, "VBD": wordnet.VERB, "VBG": wordnet.VERB,
            "VBN": wordnet.VERB, "VBP": wordnet.VERB, "VBZ": wordnet.VERB,
            "JJ": wordnet.ADJ, "JJR": wordnet.ADJ, "JJS": wordnet.ADJ,
            "RB": wordnet.ADV, "RBR": wordnet.ADV, "RBS": wordnet.ADV}

# Words that should NOT be replaced (function words, common stop words, etc.)
_SYNONYM_BLOCKLIST = {
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "shall", "may",
    "might", "can", "must", "the", "a", "an", "and", "but", "or", "nor",
    "not", "no", "if", "then", "else", "when", "where", "what", "which",
    "who", "that", "this", "these", "those", "it", "its", "my", "your",
    "our", "their", "his", "her", "i", "you", "we", "they", "he", "she",
    "me", "us", "them", "to", "of", "in", "on", "at", "by", "for", "with",
    "from", "up", "about", "into", "through", "during", "before", "after",
    "above", "below", "between", "out", "off", "over", "under", "again",
    "very", "really", "just", "also", "so", "too", "more", "most", "much",
    "many", "some", "any", "all", "each", "every", "both", "few", "other",
    "new", "old", "big", "small", "good", "bad", "first", "last", "long",
    "great", "little", "own", "right", "same", "only", "still", "even",
    "here", "there", "now", "how", "than", "because", "as", "while",
}


def get_synonym(word: str, pos_tag: str) -> str | None:
    """Return a contextual synonym via WordNet, or None."""
    if word.lower() in _SYNONYM_BLOCKLIST or len(word) < 4:
        return None

    wn_pos = _POS_MAP.get(pos_tag)
    if not wn_pos:
        return None

    synsets = wordnet.synsets(word, pos=wn_pos)
    candidates = set()
    for syn in synsets[:3]:
        for lemma in syn.lemmas():
            name = lemma.name().replace("_", " ")
            if name.lower() != word.lower() and len(name) > 2:
                candidates.add(name)

    if not candidates:
        return None

    # Pick the shortest synonym that isn't identical
    candidates = sorted(candidates, key=len)
    return candidates[0]


def synonym_replace_sentence(sentence: str, replace_prob: float = 0.18) -> str:
    """Replace ~18% of eligible words with WordNet synonyms."""
    words = word_tokenize(sentence)
    tagged = nltk.pos_tag(words)
    result = []

    for word, tag in tagged:
        if random.random() < replace_prob:
            syn = get_synonym(word, tag)
            if syn:
                # Match capitalisation
                if word[0].isupper():
                    syn = syn[0].upper() + syn[1:]
                result.append(syn)
                continue
        result.append(word)

    # Reconstruct — fix spacing around punctuation
    text = " ".join(result)
    text = re.sub(r"\s+([,.!?;:'\"])", r"\1", text)
    text = re.sub(r"(``|'')", '"', text)
    return text


def restructure_sentence(sentence: str) -> str:
    """Occasional restructuring: move prepositional phrases, invert clauses."""
    # Use spaCy for dependency-based restructuring if available
    if nlp and len(sentence) > 40 and random.random() < 0.4:
        doc = nlp(sentence)
        clauses = [sent for sent in doc.sents]
        if clauses:
            # Look for ADVCL (adverbial clause modifier) attached to main root
            for token in doc:
                if token.dep_ == "advcl" and token.head.dep_ == "ROOT":
                    # If the advcl is at the end, try to move it to the front
                    subtree = list(token.subtree)
                    start_idx = min(t.i for t in subtree)
                    if start_idx > doc[len(doc)//2].i:
                        advcl_text = "".join(t.text_with_ws for t in subtree).strip()
                        main_text = "".join(t.text_with_ws for t in doc if t not in subtree).strip()
                        main_text = main_text.rstrip(",.")
                        return f"{advcl_text.capitalize()}, {main_text[0].lower()}{main_text[1:]}."
    
    # Fallback to regex-based heuristics
    m = re.match(r"^(.+?)\s+(because|since|as)\s+(.+)$", sentence, re.I)
    if m and random.random() < 0.35:
        main, conj, reason = m.groups()
        main = main.rstrip(".")
        reason = reason.rstrip(".")
        return f"{conj.capitalize()} {reason}, {main[0].lower()}{main[1:]}."

    if sentence.count(",") >= 2 and len(sentence) > 100 and random.random() < 0.25:
        parts = sentence.rstrip(".").split(", ", 1)
        if len(parts) == 2 and len(parts[1]) > 30:
            return f"{parts[0]}. {parts[1][0].upper()}{parts[1][1:]}."

    return sentence


# ---------------------------------------------------------------------------
# Stage 4 — Tone & Mode Application
# ---------------------------------------------------------------------------
CONTRACTION_MAP = {
    "do not": "don't", "does not": "doesn't", "did not": "didn't",
    "cannot": "can't", "could not": "couldn't", "should not": "shouldn't",
    "would not": "wouldn't", "will not": "won't", "is not": "isn't",
    "are not": "aren't", "was not": "wasn't", "were not": "weren't",
    "have not": "haven't", "has not": "hasn't", "had not": "hadn't",
    "it is": "it's", "that is": "that's", "we are": "we're",
    "you are": "you're", "they are": "they're", "I am": "I'm",
    "let us": "let's", "I have": "I've", "you have": "you've",
    "we have": "we've", "they have": "they've", "I will": "I'll",
    "you will": "you'll", "we will": "we'll", "they will": "they'll",
    "it will": "it'll", "he will": "he'll", "she will": "she'll",
    "I would": "I'd", "you would": "you'd", "we would": "we'd",
    "they would": "they'd", "he would": "he'd", "she would": "she'd",
}

EXPANSION_MAP = {v: k for k, v in CONTRACTION_MAP.items()}

FORMAL_UPGRADES = [
    (r"\bhelp\b", "assist"), (r"\bget\b", "obtain"), (r"\buse\b", "employ"),
    (r"\bshow\b", "demonstrate"), (r"\bbig\b", "substantial"),
    (r"\bgood\b", "favorable"), (r"\bbad\b", "adverse"),
    (r"\btry\b", "attempt"), (r"\bneed\b", "require"),
    (r"\bstart\b", "commence"), (r"\bend\b", "conclude"),
    (r"\bbuy\b", "purchase"), (r"\bgive\b", "provide"),
    (r"\bmake sure\b", "ensure"), (r"\bfind out\b", "determine"),
    (r"\blook at\b", "examine"), (r"\bgo up\b", "increase"),
]

CASUAL_DOWNGRADES = [
    (r"\butilize\b", "use"), (r"\btherefore\b", "so"),
    (r"\bhowever\b", "but"), (r"\bfurthermore\b", "plus"),
    (r"\bmoreover\b", "also"), (r"\bconsequently\b", "so"),
    (r"\bapproximately\b", "about"), (r"\bnevertheless\b", "still"),
    (r"\bdemonstrate\b", "show"), (r"\bobtain\b", "get"),
    (r"\bcommence\b", "start"), (r"\bconclude\b", "finish"),
    (r"\brequire\b", "need"), (r"\bprovide\b", "give"),
    (r"\bassist\b", "help"), (r"\battain\b", "reach"),
    (r"\bpurchase\b", "buy"), (r"\binquire\b", "ask"),
]


def apply_contractions(text: str) -> str:
    for full, short in CONTRACTION_MAP.items():
        text = re.sub(r"\b" + full + r"\b", short, text, flags=re.I)
    return text


def expand_contractions(text: str) -> str:
    for short, full in EXPANSION_MAP.items():
        pattern = re.escape(short)
        text = re.sub(r"\b" + pattern + r"\b", full, text, flags=re.I)
    return text


def apply_tone(sentence: str, tone: str, mode: str) -> str:
    """Apply tone + mode lexicon adjustments."""
    result = sentence

    if mode == "formal" or tone == "professional":
        result = expand_contractions(result)
        for pattern, replacement in FORMAL_UPGRADES:
            result = re.sub(pattern, replacement, result, flags=re.I)

    elif mode == "simplify" or tone == "casual":
        result = apply_contractions(result)
        for pattern, replacement in CASUAL_DOWNGRADES:
            result = re.sub(pattern, replacement, result, flags=re.I)

    elif tone == "friendly":
        result = apply_contractions(result)
        # Keep vocabulary accessible but not too informal
        for pattern, replacement in CASUAL_DOWNGRADES[:6]:
            result = re.sub(pattern, replacement, result, flags=re.I)

    if mode == "academic":
        result = expand_contractions(result)
        for pattern, replacement in FORMAL_UPGRADES:
            result = re.sub(pattern, replacement, result, flags=re.I)

    return result


# ---------------------------------------------------------------------------
# Stage 5 — Anti-Detection Pass
# ---------------------------------------------------------------------------
def remove_ai_giveaways(text: str) -> str:
    """Strip words/phrases commonly flagged by AI detectors."""
    for pattern, replacement in AI_GIVEAWAY_PATTERNS:
        text = re.sub(pattern, replacement, text, flags=re.I)
    return text


def add_burstiness(sentences: list[str]) -> list[str]:
    """
    Vary sentence length to mimic human writing patterns.
    Humans write in bursts — a long sentence followed by a short one.
    AI tends to keep sentences uniformly mid-length.
    """
    if len(sentences) < 3:
        return sentences

    result = list(sentences)
    i = 0
    while i < len(result) - 1:
        words_current = len(result[i].split())
        # If current sentence is long (>20 words), consider shortening the next
        if words_current > 20 and random.random() < 0.3:
            next_words = result[i + 1].split()
            if len(next_words) > 10:
                # Truncate next sentence by splitting at a comma or mid-point
                cut = len(next_words) // 2
                short = " ".join(next_words[:cut]).rstrip(",") + "."
                remainder = " ".join(next_words[cut:])
                if remainder:
                    remainder = remainder[0].upper() + remainder[1:]
                    if not remainder.endswith("."):
                        remainder += "."
                    result[i + 1] = short
                    result.insert(i + 2, remainder)
        # Occasionally merge two short sentences
        elif words_current < 8 and i + 1 < len(result):
            next_words_count = len(result[i + 1].split())
            if next_words_count < 10 and random.random() < 0.25:
                merged = result[i].rstrip(".") + ", and " + result[i + 1][0].lower() + result[i + 1][1:]
                result[i] = merged
                result.pop(i + 1)
                continue
        i += 1
    return result


def insert_natural_fillers(sentences: list[str], mode: str, prob: float = 0.08) -> list[str]:
    """Insert occasional filler phrases to sound more human."""
    if mode in ("formal", "academic"):
        return sentences  # Don't add fillers to formal text

    result = []
    for s in sentences:
        if random.random() < prob and len(s.split()) > 6:
            filler = random.choice(FILLER_PHRASES)
            # Insert filler at the start
            s_body = s[0].lower() + s[1:] if s else s
            result.append(f"{filler.capitalize()}, {s_body}")
        else:
            result.append(s)
    return result


def vary_connectors(sentences: list[str], prob: float = 0.12) -> list[str]:
    """Replace bland transitional openings with natural connectors."""
    bland = {"additionally", "furthermore", "moreover", "consequently",
             "subsequently", "in addition", "as a result"}
    result = []
    for s in sentences:
        first_word = s.split(",")[0].strip().lower() if "," in s[:30] else ""
        if first_word in bland and random.random() < prob:
            connector = random.choice(NATURAL_CONNECTORS)
            rest = re.sub(r"^[^,]+,\s*", "", s)
            result.append(f"{connector} {rest}")
        else:
            result.append(s)
    return result


def add_academic_hedging(sentences: list[str], prob: float = 0.15) -> list[str]:
    """Add scholarly hedging phrases for academic mode."""
    result = []
    for i, s in enumerate(sentences):
        if i > 0 and random.random() < prob and len(s.split()) > 8:
            hedge = random.choice(ACADEMIC_HEDGE)
            s_body = s[0].lower() + s[1:]
            result.append(f"{hedge} {s_body}")
        else:
            result.append(s)
    return result


# ---------------------------------------------------------------------------
# Stage 6 — Quality Scoring
# ---------------------------------------------------------------------------
def compute_readability(text: str) -> dict:
    """Compute basic readability metrics."""
    sentences = split_sentences(text)
    words = text.split()
    syllable_count = sum(_count_syllables(w) for w in words)

    total_words = max(len(words), 1)
    total_sentences = max(len(sentences), 1)
    avg_sentence_len = total_words / total_sentences
    avg_syllables = syllable_count / total_words

    # Flesch Reading Ease
    flesch = 206.835 - 1.015 * avg_sentence_len - 84.6 * avg_syllables
    flesch = max(0, min(100, flesch))

    # Sentence length variance (higher = more human-like)
    lengths = [len(s.split()) for s in sentences]
    mean_len = sum(lengths) / len(lengths)
    variance = sum((l - mean_len) ** 2 for l in lengths) / len(lengths)
    std_dev = math.sqrt(variance)

    return {
        "fleschScore": round(flesch, 1),
        "avgSentenceLength": round(avg_sentence_len, 1),
        "sentenceLengthVariance": round(std_dev, 1),
        "wordCount": total_words,
        "sentenceCount": total_sentences,
    }


def _count_syllables(word: str) -> int:
    word = word.lower().strip(".,!?;:'\"")
    if not word:
        return 0
    vowels = "aeiouy"
    count = 0
    prev_vowel = False
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel
    if word.endswith("e") and count > 1:
        count -= 1
    return max(1, count)


def quality_score(source: str, candidate: str) -> float:
    """Score a candidate against the source for overall quality."""
    metrics = compute_readability(candidate)

    src_words = set(re.findall(r"[a-z']+", source.lower()))
    cand_words = set(re.findall(r"[a-z']+", candidate.lower()))
    overlap = len(src_words & cand_words) / max(len(src_words), 1)

    # Repetition penalty
    repeated = len(re.findall(r"\b(\w+)\s+\1\b", candidate, re.I))

    # Length similarity
    length_delta = abs(len(candidate) - len(source)) / max(len(source), 1)

    score = 100.0
    # Ideal overlap is ~55-70% (enough change but preserving meaning)
    score -= abs(overlap - 0.62) * 35
    # Penalise repetitions
    score -= repeated * 12
    # Penalise extreme length changes
    score -= length_delta * 20
    # Reward sentence length variance (human-like burstiness)
    score += min(metrics["sentenceLengthVariance"], 8) * 2
    # Reward moderate Flesch score (not too simple, not too complex)
    score -= abs(metrics["fleschScore"] - 55) * 0.15

    return max(1, score)


# ---------------------------------------------------------------------------
# Main Pipeline — Orchestrate All Stages
# ---------------------------------------------------------------------------
def run_pipeline(text, tone, mode, creativity):
    paragraphs = preprocess(text)
    processed_paragraphs = []
    for para_sentences in paragraphs:
        rewritten_sentences = []
        for sentence in para_sentences:
            sentence = normalize_whitespace(sentence)
            if len(sentence) < 5:
                rewritten_sentences.append(sentence)
                continue
            try:
                candidates = paraphrase_sentence(sentence, creativity, num_candidates=4)
                # Randomly pick from top 2 to create variations across runs
                best = pick_best_paraphrase(sentence, candidates)
            except Exception:
                best = sentence

            replace_prob = 0.10 + (creativity / 100)
            best = synonym_replace_sentence(best, replace_prob=replace_prob)
            if creativity >= 4:
                best = restructure_sentence(best)
            best = remove_ai_giveaways(best)
            best = apply_tone(best, tone, mode)
            best = best.strip()
            if best and not best[-1] in ".!?":
                best += "."
            if best:
                best = best[0].upper() + best[1:]
            rewritten_sentences.append(best)

        rewritten_sentences = add_burstiness(rewritten_sentences)
        rewritten_sentences = vary_connectors(rewritten_sentences)
        if mode in ("humanize", "casual") or tone in ("casual", "friendly"):
            rewritten_sentences = insert_natural_fillers(rewritten_sentences, mode, prob=0.06 + (creativity / 200))
        if mode == "academic":
            rewritten_sentences = add_academic_hedging(rewritten_sentences)
        if mode == "expand":
            rewritten_sentences = _expand_sentences(rewritten_sentences)
        if mode == "simplify":
            rewritten_sentences = _simplify_sentences(rewritten_sentences)

        processed_paragraphs.append(" ".join(rewritten_sentences))

    final_text = "\n\n".join(processed_paragraphs)
    final_text = re.sub(r"  +", " ", final_text).strip()
    return re.sub(r"\s+([,.!?;:])", r"\1", final_text)

def humanize_text(text: str, tone: str = "professional", mode: str = "humanize", creativity: int = 5) -> dict:
    # Generate 2 distinct variants
    v1 = run_pipeline(text, tone, mode, max(1, creativity - 1))
    v2 = run_pipeline(text, tone, mode, min(10, creativity + 1))

    metrics = compute_readability(v1)
    
    return {
        "success": True,
        "humanizedText": [v1, v2],
        "provider": "local-transformer",
        "readability": metrics,
    }


# ---------------------------------------------------------------------------
# Mode helpers
# ---------------------------------------------------------------------------
def _expand_sentences(sentences: list[str]) -> list[str]:
    """Add elaboration/supporting phrases for Expand mode."""
    elaborations = [
        "This matters because it directly affects outcomes.",
        "In other words, the impact is significant.",
        "This is especially true when you consider the bigger picture.",
        "The implications of this are worth considering.",
        "And that can make all the difference.",
    ]
    result = []
    for i, s in enumerate(sentences):
        result.append(s)
        if i > 0 and i % 3 == 0 and random.random() < 0.4:
            result.append(random.choice(elaborations))
    return result


def _simplify_sentences(sentences: list[str]) -> list[str]:
    """Break complex sentences into simpler ones for Simplify mode."""
    result = []
    for s in sentences:
        words = s.split()
        if len(words) > 25 and "," in s:
            # Split at the first comma after 10 words
            parts = s.split(", ", 1)
            if len(parts) == 2 and len(parts[1]) > 15:
                first = parts[0].rstrip(".") + "."
                second = parts[1][0].upper() + parts[1][1:]
                if not second.endswith("."):
                    second += "."
                result.extend([first, second])
                continue
        result.append(s)
    return result


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------
def main():
    raw = sys.stdin.read()
    payload = json.loads(raw)

    text = normalize_whitespace(payload.get("text", ""))
    tone = payload.get("tone", "professional")
    mode = payload.get("mode", "humanize")
    creativity = int(payload.get("creativity", 5))

    if mode not in MODES:
        mode = "humanize"
    if not text:
        raise ValueError("No input text provided.")

    result = humanize_text(text, tone, mode, creativity)
    sys.stdout.write(json.dumps(result))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        sys.stdout.write(json.dumps({
            "success": False,
            "message": str(error),
            "provider": "local-transformer",
        }))
        sys.exit(1)
