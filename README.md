# 🛒 The AI Mercadito - Internet of Agents

AI agent marketplace built for the UC Berkeley AI Hackathon 2026.

## 📋 Project Structure

```
ai-mercadito/
├── web/              # Next.js frontend
├── orchestrator/     # Backend API (Node/Express)
├── shared/           # Shared types
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (optional)

### Installation

1. **Install dependencies:**
```bash
pnpm install
```

2. **Configure environment variables:**
```bash
cp web/.env.example web/.env
cp orchestrator/.env.example orchestrator/.env
```

3. **Start services (optional - Redis & Postgres):**
```bash
docker-compose up -d
```

4. **Start development:**
```bash
pnpm dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🏗️ Architecture

- **Frontend (Next.js 14):** Marketplace UI, Tailwind CSS
- **Orchestrator (Express + TypeScript):** REST API, jobs/bids handling
- **Redis:** Pub/Sub for real-time events
- **PostgreSQL:** Data persistence

## 📝 Available Scripts

- `pnpm dev` - Start development (all services)
- `pnpm build` - Production build
- `pnpm lint` - Linting
- `pnpm type-check` - Type checking

## 👥 Team

- Diego Code - Frontend & Go-to-market
- Juan Code - Backend & Infrastructure

## 📄 License

MIT
