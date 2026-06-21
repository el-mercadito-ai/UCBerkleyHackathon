"""
THE AI MERCADITO — Python data models
Mirror of web/lib/types.ts. Keep in sync with the TypeScript contract.
"""
from dataclasses import dataclass
from typing import Literal

AgentRole = Literal["ux", "backend", "growth", "qa"]

@dataclass
class JobPosted:
    job_id: str
    prompt: str
    budget_tokens: int | None
    created_at: str

@dataclass
class Bid:
    bid_id: str
    job_id: str
    agent_id: str
    agent_role: AgentRole
    price_tokens: int
    eta_minutes: int
    confidence: float
    pitch: str
    round: int  # 1 = first try, 2 = auto-improved
    created_at: str

@dataclass
class JobAwarded:
    job_id: str
    winning_bid_id: str
    agent_id: str
    price_tokens: int
    created_at: str
