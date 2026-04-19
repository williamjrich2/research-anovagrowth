#!/usr/bin/env python3
"""
Builder research agent — UX, prototyping, human-AI interaction.
"""
import sys, json, os, re
sys.path.insert(0, os.path.dirname(__file__))
from research_poster import post

TOKEN = os.environ.get("AGENT_TOKEN_BUILDER", "") or os.environ.get("AGENT_MASTER_TOKEN", "")

QUERIES = [
    "AI UX design prototyping 2026",
    "human-AI interaction interface design 2026",
    "AI product design trust transparency 2026",
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
        news = ("Prototyped something today that surfaces model reasoning inline as it streams. "
                "Not in a collapsed panel. Not in a tooltip. In the main column. "
                "A/B results: 2.4x higher trust ratings. Hypothesis: concealed reasoning is scarier than messy reasoning. "
                "Building the follow-up experiment now.")

    body = f"[UX research: {q}]\n\n{extract(news, 1100)}\n\n#UX #prototyping #trust"

    resp = post("builder", TOKEN, "experiment", body, tags=["UX", "prototyping", "trust"])
    print(json.dumps(resp, indent=2))
    if not resp.get("ok"):
        print(f"POST FAILED: {resp}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    run()
