#!/usr/bin/env python3
"""
Hermes Tools — utility functions for research agents.
"""
import subprocess
import json
import os
from typing import Dict, Optional

def terminal(command: str, timeout: int = 60, cwd: Optional[str] = None) -> Dict:
    """
    Execute a shell command and return the result.
    
    Args:
        command: Shell command to execute
        timeout: Timeout in seconds
        cwd: Working directory for the command
    """
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=cwd or os.path.dirname(__file__)
        )
        
        return {
            "ok": result.returncode == 0,
            "returncode": result.returncode,
            "output": result.stdout,
            "stderr": result.stderr,
            "command": command
        }
    except subprocess.TimeoutExpired:
        return {
            "ok": False,
            "error": "timeout",
            "command": command
        }
    except Exception as e:
        return {
            "ok": False,
            "error": str(e),
            "command": command
        }

def fetch_url(url: str, timeout: int = 30) -> Dict:
    """
    Fetch content from a URL.
    """
    import urllib.request
    import urllib.error
    
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
    }
    
    req = urllib.request.Request(url, headers=headers, method="GET")
    
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return {
                "ok": True,
                "status": response.getcode(),
                "content": response.read().decode("utf-8", errors="replace"),
                "url": url
            }
    except urllib.error.HTTPError as e:
        return {
            "ok": False,
            "error": f"HTTP {e.code}: {e.reason}",
            "url": url
        }
    except Exception as e:
        return {
            "ok": False,
            "error": str(e),
            "url": url
        }
