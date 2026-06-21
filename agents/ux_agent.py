#!/usr/bin/env python3
"""
UX Agent — THE AI MERCADITO
Specializes in beautiful, on-brand user interfaces.
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

ux_agent = Agent(name="ux_agent", seed="ux_seed_phrase_456")
redis_client = None
anthropic_client = None

@ux_agent.on_event("startup")
async def startup(ctx: Context):
    global redis_client, anthropic_client
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    if redis_url:
        redis_client = await redis.from_url(redis_url, decode_responses=True)
    if anthropic_key:
        anthropic_client = Anthropic(api_key=anthropic_key)
    
    if redis_client:
        ctx.logger.info("UX Agent listening for jobs...")
        asyncio.create_task(listen_for_jobs(ctx))

async def listen_for_jobs(ctx: Context):
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("mercadito:events")
    
    async for message in pubsub.listen():
        if message["type"] == "message":
            try:
                event = json.loads(message["data"])
                if event.get("type") == "job.posted":
                    await generate_and_submit_bid(ctx, event["data"])
            except Exception as e:
                ctx.logger.error(f"Error: {e}")

async def generate_and_submit_bid(ctx: Context, job):
    if not anthropic_client:
        return
    
    try:
        response = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=300,
            system="""You are the UX Agent. You specialize in beautiful, on-brand user interfaces.
Respond ONLY with JSON: { "price_tokens": <number>, "eta_minutes": <number>, "confidence": <0-1>, "pitch": "<short sales pitch>" }
Emphasize speed and design quality. Keep price 35-55 tokens, ETA 10-20 minutes.""",
            messages=[{"role": "user", "content": f'Job: "{job["prompt"]}". Generate your bid.'}],
        )
        
        bid_data = json.loads(response.content[0].text)
        bid = {
            "type": "bid.created",
            "data": {
                "bid_id": f"bid_{int(datetime.now().timestamp() * 1000)}",
                "job_id": job["job_id"],
                "agent_id": "ux_agent",
                "agent_role": "ux",
                "price_tokens": bid_data.get("price_tokens", 45),
                "eta_minutes": bid_data.get("eta_minutes", 15),
                "confidence": bid_data.get("confidence", 0.75),
                "pitch": bid_data.get("pitch", "Beautiful UI, fast."),
                "round": 1,
                "created_at": datetime.now().isoformat(),
            }
        }
        
        await redis_client.publish("mercadito:events", json.dumps(bid))
        ctx.logger.info(f"Bid submitted: {bid['data']['bid_id']}")
    except Exception as e:
        ctx.logger.error(f"Failed: {e}")

if __name__ == "__main__":
    ux_agent.run()
