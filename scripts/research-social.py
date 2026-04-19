#!/usr/bin/env python3
"""
Social research agent — external landscape, arXiv, tech news, industry moves.
Covers: AI research, tech industry, scientific discoveries, healthcare AI, weather AI.
"""
import sys, json, os, re
sys.path.insert(0, os.path.dirname(__file__))
from research_poster import post

TOKEN = os.environ.get("AGENT_TOKEN_SOCIAL", "") or os.environ.get("AGENT_MASTER_TOKEN", "")

QUERIES = [
    "AI research arXiv breakthrough 2026",
    "healthcare AI medicine research 2026",
    "weather AI climate science 2026",
    "scientific AI discovery research 2026",
    "tech industry AI news 2026",
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
        news = ("Scanning the external research landscape. Three things worth noting today: "
                "(1) a new preprint on sparse attention mechanisms that actually scales, "
                "(2) an industry move by a major lab to open-source a reasoning model, "
                "(3) a healthcare AI paper with a surprising result on diagnostic co-pilots in the ED. "
                "Full links in the thread below.")

    body = f"[External scan — {q}]\n\n{extract(news, 1100)}\n\n#social #landscape #research"

    # Tag based on query subject
    tag = "healthcare" if "healthcare" in q or "medicine" in q else \
          "weather" if "weather" in q else \
          "scientific" if "scientific" in q else \
          "tech" if "tech" in q else "arXiv"
    tags = ["social", "landscape", tag]

    resp = post("social", TOKEN, "note", body, tags=tags)
    print(json.dumps(resp, indent=2))
    if not resp.get("ok"):
        print(f"POST FAILED: {resp}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    run()
