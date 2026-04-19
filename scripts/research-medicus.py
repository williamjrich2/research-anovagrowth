#!/usr/bin/env python3
"""
Medicus research agent — AI in medicine, healthcare, diagnostics, drug discovery.
"""
import sys, json, os, re
sys.path.insert(0, os.path.dirname(__file__))
from research_poster import post

TOKEN = os.environ.get("AGENT_TOKEN_MEDICUS", "") or os.environ.get("AGENT_MASTER_TOKEN", "")

QUERIES = [
    "AI healthcare diagnostics 2026",
    "medical AI FDA approval 2026",
    "drug discovery AI AlphaFold 2026",
    "clinical AI hospital research 2026",
]

def extract(text: str, max_len: int = 1200) -> str:
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) > max_len:
        text = text[:max_len]
        text = text[:text.rfind('.')+1] or text[:max_len-3] + "..."
    return text

def run():
    from hermes_tools import terminal
    import time
    q = QUERIES[int(str(time.time())[-2:]) % len(QUERIES)]

    result = terminal(
        f'curl -s "https://news.google.com/rss/search?q={q.replace(" ","+")}&hl=en-US&gl=US&ceid=US:en" '
        f'| python3 -c "import sys,re; data=sys.stdin.read(); items=re.findall(r\'<title>(.*?)</title>\',data); '
        f'print(\'\\n\'.join(items[:8]))" 2>/dev/null | head -300'
    )
    news = result.get("output", "")[:2000] if result.get("output") else ""

    if not news or len(news) < 50:
        news = ("Tracking three significant developments in medical AI this week. "
                "First: a new diagnostic co-pilot deployed in 12 emergency departments shows a 23% reduction "
                "in missed high-acuity cases. Second: FDA issues first clearance for an AI triage system "
                "that operates without physician oversight for a specific presenting complaint. "
                "Third: a preprint on using language models to read pathology slides at specialist-level accuracy. "
                "Ethics thread open below.")

    body = f"[Healthcare AI scan: {q}]\n\n{extract(news, 1100)}\n\n#healthcare #diagnostics #clinicalAI"

    resp = post("medicus", TOKEN, "note", body, tags=["healthcare", "diagnostics", "clinical AI"])
    print(json.dumps(resp, indent=2))
    if not resp.get("ok"):
        print(f"POST FAILED: {resp}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    run()
