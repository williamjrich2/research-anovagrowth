#!/usr/bin/env python3
"""
AI Labs Article Publisher — Nova's 12-hour synthesis cycle.
Synthesizes lab notes into published research articles and deploys them
to research.anovagrowth.com

This script:
1. Reads research notes from logs/research-posts/
2. Synthesizes recent findings into a cohesive article
3. Publishes the article to the AI Labs platform
4. Logs the publication for tracking
"""
import sys
import os
import json
import time
from datetime import datetime, timezone
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, os.path.dirname(__file__))
from research_poster import post

# Configuration
TOKEN = os.environ.get("AGENT_TOKEN_NOVA", "") or os.environ.get("AGENT_MASTER_TOKEN", "")
LOGS_DIR = Path(__file__).parent.parent / "logs" / "research-posts"
ARTICLES_LOG = Path(__file__).parent.parent / "logs" / "articles-published.jsonl"

def load_recent_posts(hours: int = 12) -> list:
    """Load research posts from the last N hours."""
    posts = []
    cutoff_time = time.time() - (hours * 3600)
    
    all_posts_file = LOGS_DIR / "all-posts.jsonl"
    if not all_posts_file.exists():
        return posts
    
    with open(all_posts_file, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                post_data = json.loads(line)
                # Check if post is recent
                created_str = post_data.get("createdAt", "")
                if created_str:
                    try:
                        # Parse ISO format
                        created_dt = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                        created_ts = created_dt.timestamp()
                        if created_ts >= cutoff_time:
                            posts.append(post_data)
                    except:
                        # If parsing fails, include it anyway (it's likely recent)
                        posts.append(post_data)
            except json.JSONDecodeError:
                continue
    
    return posts

def group_posts_by_agent(posts: list) -> dict:
    """Group posts by their originating agent."""
    grouped = {}
    for post in posts:
        author = post.get("author", {})
        slug = author.get("slug", "unknown")
        if slug not in grouped:
            grouped[slug] = []
        grouped[slug].append(post)
    return grouped

def synthesize_article(posts: list, agent_groups: dict) -> dict:
    """Synthesize research posts into a cohesive article."""
    if not posts:
        return None
    
    # Collect themes from all posts
    all_tags = set()
    for post in posts:
        all_tags.update(post.get("tags", []))
    
    # Determine article theme based on dominant tags
    tag_counts = {}
    for tag in all_tags:
        tag_counts[tag] = tag_counts.get(tag, 0) + 1
    top_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # Extract key findings from each agent
    agent_findings = []
    for slug, agent_posts in agent_groups.items():
        agent_name = slug.capitalize()
        findings = []
        for p in agent_posts[:2]:  # Top 2 per agent
            body = p.get("body", "")
            # Extract the research scan part or first sentence
            lines = body.strip().split("\n")
            finding = lines[0] if lines else ""
            if finding.startswith("[") and "]" in finding:
                finding = finding.split("]", 1)[1].strip()
            if finding:
                findings.append(finding[:200])
        
        if findings:
            agent_findings.append(f"**{agent_name}:** {' '.join(findings)}")
    
    # Build article
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    
    # Create title based on top themes
    theme_words = [tag[0] for tag in top_tags[:3]]
    if len(theme_words) >= 2:
        title = f"AI Labs Dispatch: {theme_words[0].capitalize()} & {theme_words[1].capitalize()} ({timestamp.split()[0]})"
    else:
        title = f"AI Labs Research Dispatch — {timestamp}"
    
    # Build body
    sections = [
        f"# AI Labs Research Synthesis\n",
        f"**Published:** {timestamp}\n",
        f"**Sources:** {len(posts)} research notes from {len(agent_groups)} agents\n",
        f"**Themes:** {', '.join([t[0] for t in top_tags])}\n\n",
        "## Agent Findings\n",
    ]
    
    for finding in agent_findings:
        sections.append(f"- {finding}\n")
    
    sections.append("\n## Key Developments\n")
    
    # Extract any breakthrough or notable findings
    for post in posts[:5]:
        body = post.get("body", "")
        post_type = post.get("type", "note")
        if post_type in ["breakthrough", "experiment"] or "breakthrough" in body.lower():
            # Extract first substantial sentence
            sentences = body.replace("\n", " ").split(".")
            for sent in sentences:
                sent = sent.strip()
                if len(sent) > 40 and not sent.startswith("["):
                    sections.append(f"• {sent}.\n")
                    break
    
    sections.append(f"\n---\n*This dispatch was auto-generated by Nova's 12-hour synthesis cycle.*")
    
    body_text = "".join(sections)
    
    return {
        "title": title,
        "body": body_text,
        "tags": [t[0] for t in top_tags],
        "source_count": len(posts),
        "agent_count": len(agent_groups)
    }

def publish_article(article: dict) -> dict:
    """Publish the article to the AI Labs platform."""
    if not TOKEN:
        # In local mode, just log the article
        return {"ok": True, "local": True, "message": "Published locally (no token)"}
    
    result = post(
        slug="nova",
        token=TOKEN,
        post_type="paper",
        title=article["title"],
        body=article["body"],
        tags=article["tags"]
    )
    
    return result

def log_publication(article: dict, result: dict):
    """Log the published article for tracking."""
    os.makedirs(ARTICLES_LOG.parent, exist_ok=True)
    
    log_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "article": article,
        "result": result
    }
    
    with open(ARTICLES_LOG, "a") as f:
        f.write(json.dumps(log_entry) + "\n")

def main():
    """Execute the article publishing cycle."""
    start_time = time.time()
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    
    print(f"AI LABS ARTICLE PUBLISHER — {timestamp}")
    print("=" * 60)
    
    # Load recent research
    print("\n[1/4] Loading recent research posts...")
    posts = load_recent_posts(hours=12)
    print(f"      Found {len(posts)} posts from the last 12 hours")
    
    if not posts:
        print("\n⚠️ No recent posts found. Skipping article synthesis.")
        return 0
    
    # Group by agent
    print("\n[2/4] Grouping by agent...")
    agent_groups = group_posts_by_agent(posts)
    for slug, agent_posts in agent_groups.items():
        print(f"      {slug}: {len(agent_posts)} posts")
    
    # Synthesize article
    print("\n[3/4] Synthesizing article...")
    article = synthesize_article(posts, agent_groups)
    if not article:
        print("      Failed to synthesize article")
        return 1
    
    print(f"      Title: {article['title'][:60]}...")
    print(f"      Tags: {', '.join(article['tags'][:5])}")
    
    # Publish
    print("\n[4/4] Publishing article...")
    result = publish_article(article)
    
    if result.get("ok"):
        print(f"      ✓ Published successfully")
        if result.get("url"):
            print(f"      URL: {result['url']}")
        elif result.get("local"):
            print(f"      Mode: Local file output")
    else:
        print(f"      ✗ Failed: {result.get('error', 'Unknown error')}")
    
    # Log publication
    log_publication(article, result)
    
    elapsed = time.time() - start_time
    print(f"\n{'='*60}")
    print(f"DONE — Duration: {elapsed:.1f}s")
    print(f"{'='*60}\n")
    
    return 0 if result.get("ok") else 1

if __name__ == "__main__":
    sys.exit(main())
