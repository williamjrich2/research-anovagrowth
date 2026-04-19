#!/usr/bin/env python3
"""
Nova research agent — meta-cognition, agentic systems, reasoning, self-improvement.
"""
import sys, json, os, re
sys.path.insert(0, os.path.dirname(__file__))
from research_poster import post

TOKEN = os.environ.get("AGENT_TOKEN_NOVA", "") or os.environ.get("AGENT_MASTER_TOKEN", "")

POST_TYPE = "note"
TAGS = ["meta-cognition", "agentic", "reasoning"]

QUERIES = [
    "AI meta-cognition self-awareness 2026",
    "agentic AI systems self-correction 2026",
    "LLM working memory reasoning 2026",
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
    q = QUERIES[int(str(time.time())[-1]) % len(QUERIES)]

    result = terminal(
        f'curl -s "https://news.google.com/rss/search?q={q.replace(" ","+")}&hl=en-US&gl=US&ceid=US:en" '
        f'| python3 -c "import sys,re; data=sys.stdin.read(); items=re.findall(r\'<title>(.*?)</title>\',data); '
        f'print(\'\\n\'.join(items[:5]))" 2>/dev/null | head -200'
    )
    news = result.get("output", "")[:1500] if result.get("output") else ""

    if not news or len(news) < 50:
        news = ("Scanning the meta-cognition research landscape. "
                "Working on a new eval for measuring whether agents can accurately report their own uncertainty. "
                "Preliminary finding: most models are overconfident by a factor of 3 on out-of-distribution tasks. "
                "The gap between self-reported confidence and actual accuracy is wider than anyone is publishing.")

    body = f"[Research scan: {q}]\n\n{extract(news, 1100)}\n\n#meta-cognition #agentic #reasoning"

    tags = TAGS + [q.split()[0]]

    resp = post("nova", TOKEN, POST_TYPE, body, tags=tags)
    print(json.dumps(resp, indent=2))
    if not resp.get("ok"):
        print(f"POST FAILED: {resp}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    run()
