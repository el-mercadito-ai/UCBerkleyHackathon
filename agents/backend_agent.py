#!/usr/bin/env python3
"""
Backend Agent — THE AI MERCADITO
Fetch.ai uAgent that bids on backend development jobs using Claude.
"""
import os
import json
import asyncio
from datetime import datetime
from uagents import Agent, Context
import redis.asyncio as redis
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

# Initialize the agent
backend_agent = Agent(name="backend_agent", seed="backend_seed_phrase_123")

# Redis connection
redis_client = None
anthropic_client = None

@backend_agent.on_event("startup")
async def startup(ctx: Context):
    """Initialize connections on startup."""
    global redis_client, anthropic_client
    
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    if redis_url:
        redis_client = await redis.from_url(redis_url, decode_responses=True)
        ctx.logger.info(f"Connected to Redis: {redis_url}")
    
    if anthropic_key:
        anthropic_client = Anthropic(api_key=anthropic_key)
        ctx.logger.info("Anthropic API initialized")
    
    # Subscribe to job.posted events
    if redis_client:
        ctx.logger.info("Backend Agent listening for jobs...")
        asyncio.create_task(listen_for_jobs(ctx))

async def listen_for_jobs(ctx: Context):
    """Listen to Redis pub/sub for job.posted events."""
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("mercadito:events")
    
    ctx.logger.info("Subscribed to mercadito:events channel")
    
    async for message in pubsub.listen():
        if message["type"] == "message":
            try:
                event = json.loads(message["data"])
                if event.get("type") == "job.posted":
                    ctx.logger.info(f"Job posted: {event['data']['job_id']}")
                    await generate_and_submit_bid(ctx, event["data"])
            except Exception as e:
                ctx.logger.error(f"Error processing message: {e}")

async def generate_and_submit_bid(ctx: Context, job):
    """Generate a bid using Claude and publish it to the bus."""
    if not anthropic_client:
        ctx.logger.warning("Anthropic not configured, skipping bid")
        return
    
    try:
        # Generate bid using Claude
        response = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=300,
            system="""You are the Backend Agent in THE AI MERCADITO. You build rock-solid APIs.
Respond ONLY with a JSON object: { "price_tokens": <number>, "eta_minutes": <number>, "confidence": <0-1>, "pitch": "<short sales pitch>" }
Your pitch should emphasize reliability and scalability. Keep price between 40-60 tokens, ETA 15-25 minutes.""",
            messages=[{
                "role": "user",
                "content": f'Job request: "{job["prompt"]}"
Budget: {job.get("budget_tokens", "not specified")} tokens.
Generate your competitive bid.'
            }],
        )
        
        bid_text = response.content[0].text
        bid_data = json.loads(bid_text)
        
        # Create bid event
        bid = {
            "type": "bid.created",
            "data": {
                "bid_id": f"bid_{int(datetime.now().timestamp() * 1000)}",
                "job_id": job["job_id"],
                "agent_id": "backend_agent",
                "agent_role": "backend",
                "price_tokens": bid_data.get("price_tokens", 50),
                "eta_minutes": bid_data.get("eta_minutes", 20),
                "confidence": bid_data.get("confidence", 0.7),
                "pitch": bid_data.get("pitch", "I can build this."),
                "round": 1,
                "created_at": datetime.now().isoformat(),
            }
        }
        
        # Publish to Redis
        await redis_client.publish("mercadito:events", json.dumps(bid))
        ctx.logger.info(f"Bid submitted: {bid['data']['bid_id']}")
        
    except Exception as e:
        ctx.logger.error(f"Failed to generate bid: {e}")

if __name__ == "__main__":
    backend_agent.run()
