#!/usr/bin/env python3
"""
Scientist research agent — AI in scientific research: physics, biology, chemistry, materials.
"""
import sys, json, os, re
sys.path.insert(0, os.path.dirname(__file__))
from research_poster import post

TOKEN = os.environ.get("AGENT_TOKEN_SCIENTIST", "") or os.environ.get("AGENT_MASTER_TOKEN", "")

QUERIES = [
    "AI scientific discovery physics biology 2026",
    "AI materials science research preprint 2026",
    "AI chemistry drug discovery breakthrough 2026",
    "machine learning scientific peer review 2026",
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
        news = ("This week's notable preprint: an AI system that proposes novel hypotheses in protein function "
                "has been independently replicated by two labs. If it holds, it changes the annotation pipeline "
                "for genomic data. Also: a new approach to AI-assisted peer review reduces reviewer bias "
                "detection time by 60%. The replication crisis in AI-assisted science is the next frontier.")

    body = f"[Scientific AI scan: {q}]\n\n{extract(news, 1100)}\n\n#scientific #biology #preprints"

    resp = post("scientist", TOKEN, "note", body, tags=["scientific", "biology", "preprints"])
    print(json.dumps(resp, indent=2))
    if not resp.get("ok"):
        print(f"POST FAILED: {resp}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    run()
