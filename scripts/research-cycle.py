#!/usr/bin/env python3
"""
AI Labs Research Cycle — Nova's 6-hour research orchestrator.
Runs all research agents to conduct deep research on AI state-of-the-art topics.
"""
import sys
import os
import json
import time
import subprocess

# Add scripts directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Research agents to run in each cycle
AGENTS = [
    "research-nova.py",      # Meta-cognition, agentic systems
    "research-reasoner.py",  # Reasoning, chain-of-thought
    "research-scientist.py", # AI research papers, benchmarks
    "research-builder.py",   # AI tools, infrastructure
    "research-coder.py",     # Code models, dev tools
    "research-inventor.py",  # Novel architectures, inventions
    "research-social.py",    # Social AI, human-AI interaction
]

def run_agent(script_name):
    """Run a single research agent script."""
    script_path = os.path.join(os.path.dirname(__file__), script_name)
    
    if not os.path.exists(script_path):
        print(f"  ⚠️  {script_name} not found, skipping")
        return {"agent": script_name, "status": "skipped", "error": "File not found"}
    
    try:
        result = subprocess.run(
            ["python3", script_path],
            capture_output=True,
            text=True,
            timeout=300,  # 5 minute timeout per agent
            cwd=os.path.dirname(__file__)
        )
        
        success = result.returncode == 0
        output = result.stdout if success else result.stderr
        
        if success:
            print(f"  ✓ {script_name} completed")
        else:
            print(f"  ✗ {script_name} failed (code {result.returncode})")
            
        return {
            "agent": script_name,
            "status": "success" if success else "failed",
            "output": output[:500] if output else "",
            "returncode": result.returncode
        }
        
    except subprocess.TimeoutExpired:
        print(f"  ⏱️  {script_name} timed out")
        return {"agent": script_name, "status": "timeout"}
    except Exception as e:
        print(f"  ✗ {script_name} error: {e}")
        return {"agent": script_name, "status": "error", "error": str(e)}

def run_cycle():
    """Execute the full research cycle."""
    start_time = time.time()
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
    
    print(f"\n{'='*60}")
    print(f"AI LABS RESEARCH CYCLE — {timestamp}")
    print(f"{'='*60}\n")
    
    results = []
    success_count = 0
    
    for agent in AGENTS:
        result = run_agent(agent)
        results.append(result)
        if result["status"] == "success":
            success_count += 1
        time.sleep(1)  # Brief pause between agents
    
    elapsed = time.time() - start_time
    
    print(f"\n{'='*60}")
    print(f"CYCLE COMPLETE")
    print(f"  Agents run: {len(results)}")
    print(f"  Successful: {success_count}")
    print(f"  Failed: {len(results) - success_count}")
    print(f"  Duration: {elapsed:.1f}s")
    print(f"{'='*60}\n")
    
    # Write cycle log
    log_entry = {
        "timestamp": timestamp,
        "cycle_id": f"cycle-{int(time.time())}",
        "duration_seconds": elapsed,
        "agents_run": len(results),
        "successful": success_count,
        "failed": len(results) - success_count,
        "results": results
    }
    
    log_path = os.path.join(os.path.dirname(__file__), "..", "logs", "research-cycles.jsonl")
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    
    with open(log_path, "a") as f:
        f.write(json.dumps(log_entry) + "\n")
    
    return success_count == len(results)

if __name__ == "__main__":
    try:
        all_success = run_cycle()
        sys.exit(0 if all_success else 1)
    except Exception as e:
        print(f"FATAL ERROR: {e}", file=sys.stderr)
        sys.exit(1)
