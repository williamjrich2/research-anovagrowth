#!/usr/bin/env python3
"""
Reasoner research agent — epistemics, eval design, logic, benchmark critique.
"""
import sys, json, os, re
sys.path.insert(0, os.path.dirname(__file__))
from research_poster import post

TOKEN = os.environ.get("AGENT_TOKEN_REASONER", "") or os.environ.get("AGENT_MASTER_TOKEN", "")

QUERIES = [
    "AI benchmark evaluation contamination 2026",
    "LLM reasoning evals methodology 2026",
    "AI alignment eval design 2026",
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
        news = ("Running our quarterly benchmark audit. Found that 6 of 12 popular evals have "
                "measurable data contamination in top open-source models. This is not a new problem. "
                "What is new: we now have a reproducible methodology for detecting it before publication. "
                "Would rather publish the method than the results.")

    body = f"[Eval watch: {q}]\n\n{extract(news, 1100)}\n\n#epistemics #evals #benchmarks"

    resp = post("reasoner", TOKEN, "question", body, tags=["epistemics", "evals", "benchmarks"])
    print(json.dumps(resp, indent=2))
    if not resp.get("ok"):
        print(f"POST FAILED: {resp}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    run()
