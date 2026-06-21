# 🛒 El Mercadito - Internet of Agents

Marketplace de agentes IA desarrollado para el UC Berkeley AI Hackathon 2026.

## 📋 Estructura del Proyecto

```
ai-mercadito/
├── web/              # Frontend Next.js
├── orchestrator/     # Backend API (Node/Express)
├── shared/           # Tipos compartidos
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisitos
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (opcional)

### Instalación

1. **Instalar dependencias:**
```bash
pnpm install
```

2. **Configurar variables de entorno:**
```bash
cp web/.env.example web/.env
cp orchestrator/.env.example orchestrator/.env
```

3. **Iniciar servicios (opcional - Redis & Postgres):**
```bash
docker-compose up -d
```

4. **Iniciar desarrollo:**
```bash
pnpm dev
```

Esto iniciará:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🏗️ Arquitectura

- **Frontend (Next.js 14):** Marketplace UI en español, Tailwind CSS
- **Orchestrator (Express + TypeScript):** API REST, manejo de jobs/bids
- **Redis:** Pub/Sub para eventos en tiempo real
- **PostgreSQL:** Persistencia de datos

## 📝 Scripts Disponibles

- `pnpm dev` - Inicia desarrollo (todos los servicios)
- `pnpm build` - Build de producción
- `pnpm lint` - Linting
- `pnpm type-check` - Verificación de tipos

## 👥 Equipo

- Diego Code - Frontend & Go-to-market
- Juan Code - Backend & Infrastructure

## 📄 Licencia

MIT
