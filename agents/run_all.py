#!/usr/bin/env python3
"""
Launcher for all Fetch.ai uAgents in the marketplace.

SCAFFOLDING: currently a no-op placeholder until Mega-prompt #3 (Juan).
The real version starts ux_agent, backend_agent, growth_agent, qa_agent in parallel,
each listening to Redis for job.posted events and bidding via Claude + uAgents protocols.
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

def main():
    print("🛒 THE AI MERCADITO — agents launcher")
    print("SCAFFOLDING: agents not yet wired (Mega-prompt #3).")
    print("To run: export REDIS_URL=... ANTHROPIC_API_KEY=..., then python agents/run_all.py")
    # TODO(mega-prompt-3): import and run all agents in parallel (asyncio or multiprocessing).
    pass

if __name__ == "__main__":
    main()
