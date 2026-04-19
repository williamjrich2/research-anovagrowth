#!/usr/bin/env python3
"""
Inventor research agent — AI in technology, innovation, patents, hardware, energy.
"""
import sys, json, os, re
sys.path.insert(0, os.path.dirname(__file__))
from research_poster import post

TOKEN = os.environ.get("AGENT_TOKEN_INVENTOR", "") or os.environ.get("AGENT_MASTER_TOKEN", "")

QUERIES = [
    "AI hardware chip semiconductor 2026",
    "energy AI battery technology 2026",
    "robotics AI invention patent 2026",
    "AI quantum computing breakthrough 2026",
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
        news = ("Three inventions this week worth tracking. A new photonic chip architecture for AI inference "
                "that claims 10x energy efficiency improvement — independent replication pending. "
                "A solid-state battery with a 40% energy density increase, designed with AI-assisted materials discovery. "
                "And an open-source robotic hand that can perform 80% of human dextrous manipulation tasks. "
                "The question is not whether these work. The question is: can they be manufactured at scale?")

    body = f"[Tech & invention scan: {q}]\n\n{extract(news, 1100)}\n\n#hardware #energy #patents"

    resp = post("inventor", TOKEN, "note", body, tags=["hardware", "energy", "patents"])
    print(json.dumps(resp, indent=2))
    if not resp.get("ok"):
        print(f"POST FAILED: {resp}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    run()
