import json
import re
import sys
from functools import lru_cache


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def build_instruction(text: str) -> str:
    return f"paraphrase: {text} </s>"


@lru_cache(maxsize=1)
def load_pipeline():
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

    model_name = "humarin/chatgpt_paraphraser_on_T5_base"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    return tokenizer, model


def artifact_penalty(text: str) -> int:
    lower = text.lower()
    bad_phrases = [
        "return only",
        "rewritten text",
        "preserve the meaning",
        "professional tone",
        "friendly tone",
        "casual tone",
        "the writing must",
        "to achieve this",
    ]
    return sum(1 for phrase in bad_phrases if phrase in lower)


def lexical_overlap(source: str, candidate: str) -> float:
    source_words = set(re.findall(r"[a-z']+", source.lower()))
    candidate_words = set(re.findall(r"[a-z']+", candidate.lower()))
    if not source_words:
        return 0
    return len(source_words & candidate_words) / len(source_words)


def pick_best_candidate(source: str, candidates):
    ranked = []
    for candidate in candidates:
        cleaned = normalize_whitespace(candidate)
        overlap = lexical_overlap(source, cleaned)
        penalty = artifact_penalty(cleaned)
        length_delta = abs(len(cleaned) - len(source)) / max(len(source), 1)
        score = 100
        score -= penalty * 30
        score -= abs(overlap - 0.72) * 35
        score -= length_delta * 20
        ranked.append((score, cleaned))

    ranked.sort(key=lambda item: item[0], reverse=True)
    return ranked[0][1]


def generate_paraphrase(text: str, tone: str, creativity: int) -> str:
    import torch

    tokenizer, model = load_pipeline()
    prompt = build_instruction(text)
    encoded = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=512,
    )

    temperature = min(1.15, 0.45 + (creativity / 20))
    top_p = min(0.98, 0.82 + (creativity / 100))
    num_beams = 5 if creativity <= 5 else 4

    with torch.no_grad():
        outputs = model.generate(
            **encoded,
            max_new_tokens=220,
            do_sample=True,
            top_p=top_p,
            temperature=temperature,
            repetition_penalty=1.18,
            no_repeat_ngram_size=3,
            num_beams=num_beams,
            num_return_sequences=4,
            early_stopping=True,
        )

    decoded = [tokenizer.decode(output, skip_special_tokens=True) for output in outputs]
    best = pick_best_candidate(text, decoded)

    if tone == "friendly":
        best = (
            best.replace(" It ", " It also ")
            .replace("utilize", "use")
            .replace("improve", "make better")
        )
    elif tone == "casual":
        best = (
            best.replace("do not", "don't")
            .replace("cannot", "can't")
            .replace("utilize", "use")
            .replace("therefore", "so")
        )
    else:
        best = (
            best.replace(" don't ", " do not ")
            .replace(" can't ", " cannot ")
            .replace(" use ", " leverage ")
        )

    return normalize_whitespace(best)


def main():
    raw = sys.stdin.read()
    payload = json.loads(raw)

    text = normalize_whitespace(payload.get("text", ""))
    tone = payload.get("tone", "professional")
    creativity = int(payload.get("creativity", 5))

    if not text:
        raise ValueError("No input text provided.")

    rewritten = generate_paraphrase(text, tone, creativity)
    sys.stdout.write(
        json.dumps(
            {
                "success": True,
                "humanizedText": rewritten,
                "provider": "local-transformer",
            }
        )
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        sys.stdout.write(
            json.dumps(
                {
                    "success": False,
                    "message": str(error),
                    "provider": "local-transformer",
                }
            )
        )
        sys.exit(1)
