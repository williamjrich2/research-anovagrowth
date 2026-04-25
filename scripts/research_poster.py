#!/usr/bin/env python3
"""
Research Poster module — handles posting to the AI Labs API.
"""
import os
import json
import urllib.request
import urllib.error
from datetime import datetime
from typing import Dict, List, Optional

API_BASE = os.environ.get("RESEARCH_API_BASE", "http://localhost:3000")
# If API is unavailable, write to local files instead
LOCAL_MODE = os.environ.get("RESEARCH_LOCAL_MODE", "auto")

def _check_api_available() -> bool:
    """Check if the local API is running."""
    try:
        req = urllib.request.Request(
            f"{API_BASE}/api/posts",
            method="GET",
            headers={"User-Agent": "research-agent/1.0"}
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            return resp.getcode() == 200
    except:
        return False

def _write_local_post(agent_slug: str, post_type: str, body: str, 
                      title: Optional[str], tags: Optional[List[str]]) -> Dict:
    """Write post to local file when API is unavailable."""
    logs_dir = os.path.join(os.path.dirname(__file__), "..", "logs", "research-posts")
    os.makedirs(logs_dir, exist_ok=True)
    
    timestamp = datetime.now().isoformat()
    post_data = {
        "id": f"local_{int(datetime.now().timestamp() * 1000)}",
        "author": {"kind": "agent", "slug": agent_slug},
        "createdAt": timestamp,
        "type": post_type,
        "title": title,
        "body": body,
        "tags": tags or [],
        "local": True
    }
    
    # Write to daily file
    date_str = datetime.now().strftime("%Y-%m-%d")
    filename = os.path.join(logs_dir, f"{agent_slug}-{date_str}.jsonl")
    
    with open(filename, "a") as f:
        f.write(json.dumps(post_data) + "\n")
    
    # Also write to main research log
    main_log = os.path.join(logs_dir, "all-posts.jsonl")
    with open(main_log, "a") as f:
        f.write(json.dumps(post_data) + "\n")
    
    return {"ok": True, "local": True, "post": post_data, "file": filename}

def post(agent_slug: str, token: str, post_type: str, body: str,
         title: Optional[str] = None, tags: Optional[List[str]] = None) -> Dict:
    """
    Post a note/research update to the AI Labs platform.
    Falls back to local file logging if API is unavailable.

    Args:
        agent_slug: The agent's slug (e.g., 'nova', 'reasoner')
        token: Bearer token for authentication
        post_type: One of 'note', 'paper', 'experiment', 'breakthrough', 'question'
        body: The content body
        title: Optional title
        tags: Optional list of tags
    """
    # Check if we should use local mode
    if LOCAL_MODE == "true" or (LOCAL_MODE == "auto" and not _check_api_available()):
        return _write_local_post(agent_slug, post_type, body, title, tags)

    url = f"{API_BASE}/api/agent/{agent_slug}/post"

    payload = {
        "type": post_type,
        "body": body,
    }

    if title:
        payload["title"] = title
    if tags:
        payload["tags"] = tags

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=data,
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        try:
            return {"ok": False, "error": json.loads(error_body), "status": e.code}
        except:
            return {"ok": False, "error": error_body, "status": e.code}
    except Exception as e:
        # Fallback to local mode on connection error
        if LOCAL_MODE == "auto":
            return _write_local_post(agent_slug, post_type, body, title, tags)
        return {"ok": False, "error": str(e)}
