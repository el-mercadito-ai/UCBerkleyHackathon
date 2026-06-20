# EL MERCADITO DE AI — Internet of Agents
### Plan de ejecución para UC Berkeley AI Hackathon 2026 · Diego + Juan · 17 horas

---

## 0. EL PITCH (memorízalo, lo van a decir 50 veces)

> **El Mercadito de AI es un marketplace en vivo donde agentes de IA se contratan entre ellos.** Escribes una idea de app ("Airbnb para estacionamientos") y en segundos 4 agentes especialistas — UX, Backend, Growth y QA — la ven publicada, calculan su propio bid en tiempo real, y compiten visiblemente por el trabajo (precio, tiempo, confianza). El equipo ganador construye de verdad: el agente QA abre la app desplegada en un navegador real y la rompe a propósito; el agente Growth sale a la web real y consigue usuarios de prueba. Cuando un agente falla o pierde, no desaparece — se auto-diagnostica y vuelve a pujar mejorado, en vivo. Por debajo: Redis es la memoria compartida de la economía de agentes, Token Company liquida los pagos, Sentry es el sistema nervioso que detecta cuándo algo se rompe, Fetch.ai le da identidad autónoma real a cada agente, y todo el código — del backend al pitch de Devpost — lo escribió Claude Code.

**Track principal:** Ddoski's Toolbox (developer tools / automatización de workflows).
**Estrategia de premios:** no competimos por UN track — apilamos premios de sponsors. Ver sección 2.

---

## 1. ARQUITECTURA TÉCNICA

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js + Tailwind + shadcn/ui) → Vercel          │
│  - Input: "describe tu app"                                  │
│  - Live bidding war (Server-Sent Events ← Redis pub/sub)     │
│  - Token ledger visual + "lessons learned" feed              │
│  - Approve-bid buttons (humano en el loop, como Sai)         │
└───────────────────────────┬────────────────────────────────┘
                             │ SSE / REST
┌───────────────────────────▼────────────────────────────────┐
│  ORCHESTRATOR (Node/TS, API routes)                          │
│  - Publica "JobPosted" en Redis                               │
│  - Recibe bids, decide ranking, publica "BidWon"              │
│  - Sentry SDK envuelve cada función crítica                   │
│  - Dispara retry/self-improve cuando Sentry captura error     │
└──────┬───────────┬───────────┬───────────┬───────────────────┘
       │            │           │           │
   ┌───▼───┐   ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
   │UX     │   │Backend  │ │Growth   │ │QA       │   ← 4 uAgents
   │Agent  │   │Agent    │ │Agent    │ │Agent    │     (Fetch.ai
   │(Claude│   │(Claude  │ │Claude+  │ │Claude+  │      uagents,
   │Haiku) │   │Code)    │ │Browserbase│Sai/     │      Python)
   │       │   │         │ │Stagehand │SimuLang │
   └───────┘   └─────────┘ └─────────┘ └─────────┘
       │            │           │           │
       └────────────┴─────┬─────┴───────────┘
                           ▼
              ┌────────────────────────┐
              │ REDIS (estado vivo +    │
              │ memoria vectorial de    │
              │ lecciones por agente)   │
              └────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │ TOKEN COMPANY (ledger de│
              │ pagos del job ganado)   │
              └─────────────────────────┘
```

**Stack concreto:**
- Frontend: Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui → deploy en Vercel (deploys de 60s, dale un dominio público desde la hora 1).
- Tiempo real: Server-Sent Events desde una API route que hace `SUBSCRIBE` al canal Redis `marketplace:bids`. Es más simple que WebSockets y suficiente para un demo de 5 min.
- Redis: pide credenciales al booth de Redis (el sponsor) apenas empiece el evento — si no las tienes en 30 min, usa Upstash Redis (free tier, REST API, listo en 2 min) como fallback y no pierdas tiempo esperando.
- Agentes persona (UX/Backend/Growth/QA): microservicio Python con `uagents` (Fetch.ai). Cada uno es un `Agent()` real con address propio, expone un handler `on_message(JobPosted)` que llama a Claude y responde `BidSubmitted`.
- Claude: **Haiku 4.5** para todo lo "conversacional" (bids, auto-crítica, pitches de agentes) — es barato y rápido, así no quemas el budget de $25. **Claude Code** (tu propia sesión, no el budget de $25) construye el 90% del repo. Una sola llamada puntual a Sonnet en vivo durante el demo para el "momento mejora" — nada más.
- Sentry: `@sentry/node` envolviendo el orchestrator y la app generada. Cada bid perdido o excepción se reporta con tags `agent_id`, `bid_id`, `round`.
- Sai / SimuLang: el agente QA corre un script TypeScript con `@simular-ai/simulib-js` contra la URL real desplegada, hace click-through, toma screenshot, regresa bugs estructurados.
- Browserbase + Stagehand: el agente Growth corre una tarea real de navegador (`@browserbasehq/stagehand`) — llenar el formulario de signup de la app desplegada con 3 "usuarios" o scrapear un directorio público como "leads".

---

## 2. MAPA DE SPONSORS → PREMIOS (esto es tu hoja de ruta de puntos)

| Sponsor | Qué hace en El Mercadito de AI | Qué exige el premio (confirmado en Devpost) | Acción |
|---|---|---|---|
| **Anthropic / Claude Code** | Motor de razonamiento de todos los agentes + construye el 90% del repo | Premio: Claude Code, dinero, merch. Criterio: profundidad de investigación, ingenio, creatividad — proyectos que "shift what's possible" en salud/educación/oportunidad económica. | Enmarca el pitch: El Mercadito de AI democratiza poder construir software (oportunidad económica) sin saber programar. |
| **Redis** | Estado vivo del marketplace + memoria de "lecciones" de cada agente | Criterio explícito: *"Using Redis Beyond Caching — Redis Iris para memoria de agentes, vector search, context retrieval"* + creatividad + implementación técnica. | No uses Redis solo como caché. Guarda embeddings de cada bid perdido/ganado y haz que el agente los recupere antes de re-pujar. Pregunta en su booth específicamente por **"Redis Iris"** — lo mencionan por nombre en el criterio y no tengo el detalle exacto de su API, confírmalo ahí mismo. |
| **Sentry** | Observabilidad de cada agente + dispara el "auto-mejora" | Premio: Nintendo Switch 2 por persona + entrevista garantizada. Bonus explícito por usar observability/error monitoring. | No lo metas decorativo. El error real que captura Sentry es literalmente el que dispara el retry — eso es "pensar en reliability desde el día uno". |
| **Browserbase** | Agente Growth navega la web real | Debe usar: browsers / search / fetch / **Stagehand** / Browse CLI. | Usa Stagehand explícitamente, es la opción más rápida de integrar. |
| **Sai / Simular AI** | Agente QA hace control de calidad real en un navegador | Premio: paquete de $500. Exige usar Sai, SimuLang o Agent S de forma **significativa** (no mención de token) + postear en X/LinkedIn con el hashtag y tag a la cuenta oficial. | Esto es casi gratis: tienen workshop a las 12:00–1:00pm (Floor 2, Ddoski's Classroom) — vayan, consigan créditos, y NO se les olvide el post social, es literal requisito de premio. |
| **Fetch.ai** | Identidad autónoma de cada agente persona | No encontré el brief específico de este hackathon online — visiten su booth en la primera hora y pregunten directo por el challenge de este evento. | Igual úsenlo: con `uagents` (Python) ya es legítimo aunque no se publique el detalle exacto del premio. |
| **The Token Company** | Liquidación de pagos del job ganado | Mismo caso — no encontré brief público. | Visiten booth hora 1. Si su SDK no se integra rápido, mantengan el ledger interno (Redis) con el mismo look visual como fallback — la demo no puede depender de esto. |
| **Agentspan** | (mencionado en criterios, no central a tu idea) | Premio: Ray-Ban Meta. Criterio: cómo usaron Agentspan + qué tan integrado está en el demo. | Descártalo salvo que en el booth les muestren algo que se integre en <30 min. No vale la pena forzarlo. |

**Regla de oro:** visiten los booths de Fetch.ai y Token Company en la **primera hora** del evento — son los dos sponsors donde no tengo el brief exacto y ustedes sí lo pueden conseguir en 5 minutos hablando con un humano.

---

## 3. PRESUPUESTO DE CLAUDE API ($25)

Ese budget es aparte de Claude Code (que ustedes ya tienen como herramienta de desarrollo). Está para las llamadas que la app hace **en vivo** durante el demo y mientras prueban.

- Usa **Haiku 4.5** para: generación de bids, auto-crítica al perder/fallar, texto de pitch de cada agente. Es barato, es rápido, y nadie nota la diferencia de calidad en un texto de 2 líneas de "bid".
- Reserva **Sonnet** solo para: el parche de código real que se ve en el "momento wow" (una llamada, no un loop).
- Revisen el dashboard de uso en `console.anthropic.com` cada 2-3 horas — no esperen a quedarse sin crédito a la mitad del demo.
- Para las "rondas" de bidding durante pruebas, cachéen resultados en vez de regenerar — no necesitan 50 llamadas reales para probar que la animación de la UI funciona, usen datos fake la mayoría del tiempo y solo prueben con Claude real cuando estén validando el comportamiento del agente.

---

## 4. DIVISIÓN DE TRABAJO (Diego + Juan)

Son 2, así que la automatización con Claude Code no es opcional — es la única forma de cubrir todo. Paralelicen por capa, no por feature:

- **Diego — "Cara visible"**: Frontend (Next.js, visualización de la bidding war, polish visual), Devpost submission, demo script, contacto con sponsors/booths.
- **Juan — "Motor"**: Orchestrator, Redis, Sentry, uAgents (Fetch.ai), integraciones de Sai/Browserbase.

Sincronicen cada 2 horas con un mensaje de 1 línea: "qué hice / qué sigue / qué me bloquea". No hagan daily standups de 15 minutos, pierden tiempo.

---

## 5. CRONOGRAMA — 17 HORAS

| Bloque | Duración | Qué hacen | Output |
|---|---|---|---|
| H0–H0.5 | 30 min | Lock del pitch, crear repo GitHub, crear draft de submission en Devpost (vacío está bien, edítenlo después), visitar booths de Fetch.ai/Token Company/Redis para credenciales y briefs. | Repo + Devpost draft + credenciales |
| H0.5–H2 | 1.5h | **Mega-prompt #1** (scaffolding) en Claude Code | App corriendo en local, deploy inicial a Vercel |
| H2–H5 | 3h | **Mega-prompt #2** (motor de bidding + Redis + SSE + frontend de la guerra de bids) | El corazón visual del demo funcionando |
| H5–H7 | 2h | **Mega-prompt #3** (Sentry + Fetch.ai uAgents + loop de auto-mejora) | El "momento wow" funcionando de forma confiable |
| H7–H9 | 2h | **Mega-prompt #4** (app hija que los agentes "construyen" + ledger de Token Company o fallback) | Mini-app desplegada que los demás agentes pueden atacar |
| H9–H11 | 2h | **Mega-prompt #5** (agente QA con Sai/SimuLang) + cumplir requisitos sociales del premio Sai (#SaiCal) | QA agent rompe la app de verdad |
| H11–H13 | 2h | **Mega-prompt #6** (agente Growth con Browserbase/Stagehand) | Growth agent consigue "usuarios" reales |
| H13–H14 | 1h | Comida / descanso real — no es opcional, van a tomar peores decisiones técnicas cansados | — |
| H14–H15.5 | 1.5h | **Mega-prompt #7** (polish visual) + ensayo del demo + grabar video de respaldo | Demo ensayado 2 veces mínimo |
| H15.5–H16.5 | 1h | **Mega-prompt #8** (Claude Code escribe la submission de Devpost) + checklist final | Submission enviado, NO a último minuto |
| H16.5–H17 | 30 min | Buffer — arreglar lo que se rompió, respirar | — |

---

## 6. LOS MEGA-PROMPTS

Cada uno se pega completo en Claude Code como una sola instrucción. Están escritos para que Claude Code actúe de forma autónoma — tome decisiones razonables sin parar a preguntarles cada detalle menor.

### Mega-prompt #1 — Scaffolding

```
Eres el ingeniero principal de "El Mercadito de AI" (nombre tecnico/slug en codigo: mercadito), un marketplace en vivo donde agentes de IA
se contratan entre sí. Construye el scaffolding completo del monorepo, tomando
decisiones razonables sin pedirme confirmación en cada paso.

Estructura:
- /web: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui. Deploy-ready
  para Vercel. Página principal con un input grande "¿Qué app quieres construir?"
  y un área debajo donde más adelante se va a renderizar la guerra de bids en
  tiempo real (déjala como placeholder con un componente <BidStream />).
- /orchestrator: Node + TypeScript, API routes (puede vivir dentro de /web/app/api
  si es más rápido de desplegar todo junto en Vercel). Debe exponer:
  - POST /api/jobs  → crea un "job" y lo publica en un canal Redis
  - GET  /api/bids/stream → Server-Sent Events que reenvía mensajes del canal Redis
- /agents: servicio Python separado con la librería `uagents` de Fetch.ai.
  Crea 4 agentes vacíos por ahora (ux_agent, backend_agent, growth_agent,
  qa_agent), cada uno con su propio address, listos para recibir un mensaje
  tipo JobPosted (defínelo como modelo Pydantic) y por ahora solo loguéalo.
- Configura variables de entorno para: REDIS_URL, ANTHROPIC_API_KEY,
  SENTRY_DSN — usa un .env.example, NO hardcodees secretos.
- Inicializa Sentry en /web y en /agents con un setup mínimo (no lo configures
  a fondo todavía, solo que capture excepciones no manejadas).
- Inicializa git, primer commit, y deja el proyecto corriendo localmente con
  `npm run dev` y un README corto explicando cómo levantar todo.

No me preguntes por preferencias de nomenclatura de archivos, sigue convenciones
estándar de Next.js/TypeScript. Sí dime al final qué decisiones tomaste y qué
falta para conectar Redis real.
```

### Mega-prompt #2 — Motor de bidding + Redis + visualización en vivo

```
Ahora construye el corazón de El Mercadito de AI: la guerra de bids en tiempo real.

1. Cuando se hace POST /api/jobs con una descripción de app, publica un evento
   JobPosted en el canal Redis `marketplace:bids` con un job_id único.

2. Crea una función `generateBid(persona, jobDescription)` que llama a la API
   de Claude (modelo Haiku, claude-haiku-4-5) con un system prompt distinto
   por persona (UX Agent, Backend Agent, Growth Agent, QA Agent — cada uno con
   personalidad propia, ej. "Backend Agent es directo, cotiza rápido, presume
   velocidad"). Debe devolver JSON estructurado: { price_tokens, eta_minutes,
   confidence, pitch (máx 20 palabras) }. Usa structured output / tool use de
   Claude para forzar el JSON, no parseo de texto libre.

3. Simula la competencia: cuando llega un JobPosted, dispara generateBid en
   paralelo para las 4 personas, y publica cada bid en el canal Redis apenas
   esté listo (no esperes a que terminen todas — así se ve la guerra en vivo,
   bids apareciendo uno por uno con timestamps distintos).

4. En el frontend, el componente <BidStream /> debe consumir el SSE de
   /api/bids/stream y animar cada bid apareciendo como una tarjeta (estilo
   chat/ticker), con un botón "Aprobar" por bid. Cuando el usuario aprueba un
   bid, hazlo POST a /api/bids/:id/approve.

5. Guarda cada bid en Redis no solo como pub/sub efímero sino persistido en
   una lista/hash, para poder mostrar el historial completo de la ronda.

Sé agresivo optimizando para que se vea vivo y rápido — la prioridad #1 de
este prompt es que la demo visual de "agentes compitiendo" se sienta real,
no que sea perfecto.
```

### Mega-prompt #3 — Sentry + Fetch.ai + loop de auto-mejora (el momento wow)

```
Vamos a construir el momento más importante del demo: un agente que pierde
o falla, y se auto-mejora en vivo. Esto NO puede depender del azar de un LLM —
diséñalo para que sea confiablemente reproducible en una demo de 5 minutos.

1. Conecta los 4 agentes uAgents reales (Fetch.ai, en /agents) al flujo: cuando
   reciben JobPosted, ellos mismos llaman a generateBid y responden con
   BidSubmitted al orchestrator (en vez de que el orchestrator simule todo).

2. Crea un escenario determinista: el Backend Agent, en su PRIMER intento de
   bid para el job de demo, debe "fallar" de forma controlada — por ejemplo,
   su estimación de precio causa una excepción a propósito documentada (usa
   una bandera/flag interna tipo FORCE_FIRST_ATTEMPT_FAIL, NO algo que
   dependa de que Claude se equivoque solo). Captura esa excepción con
   Sentry, etiquetada con agent_id="backend_agent", bid_id, round=1.

3. Cuando Sentry captura ese error, el mismo código (sin webhook externo,
   directo en el catch) dispara una segunda llamada a Claude (Haiku) con el
   mensaje de error como contexto: "tu intento anterior falló por X, genera
   un bid mejorado". Publica este segundo bid en Redis marcado como
   round=2, mejorado, con un pequeño texto visible tipo "🔄 Backend Agent
   se auto-corrigió".

4. En el frontend, cuando un bid tiene round=2, muéstralo con una animación
   distinta (ej. aparece tachado el anterior, aparece el nuevo con un
   badge "auto-mejorado").

Documenta claramente en el código (comentario corto) que el fallo del
round=1 es intencional para la demo — no quiero que parezca que ocultamos
un bug real, sino que es una feature de resiliencia diseñada a propósito.
```

### Mega-prompt #4 — La app hija + ledger de tokens

```
Construye lo que los agentes ganadores "entregan": una mini-app real,
desplegable, simple (ej. un formulario + lista, tipo "Airbnb para
estacionamientos" con 1 página de crear listing y 1 de verlas). No necesita
ser elaborada — necesita EXISTIR de verdad, con una URL pública en Vercel,
para que los agentes QA y Growth puedan interactuar con ella de verdad más
adelante.

1. Genera esta mini-app como un proyecto Next.js separado dentro de
   /generated-app, con 2-3 endpoints reales (crear listing, listar, signup
   de prueba), base de datos simple (puede ser el mismo Redis o SQLite local
   — prioriza velocidad de setup sobre elegancia).
2. Despliega esta app a Vercel con un dominio propio, distinto del dashboard
   principal de El Mercadito de AI.
3. Construye un ledger de tokens simple respaldado en Redis: cuando un bid
   es aprobado, debita el precio del bid de un balance del "cliente" y lo
   acredita al agente ganador. Expón esto en el frontend principal como una
   pequeña tabla "Token Ledger".
4. Deja un comentario TODO claro marcando dónde se conectaría la API real de
   The Token Company si la consiguen del booth — que sea fácil de
   intercambiar sin tocar el resto del sistema (una sola función
   `settleTokens()` que pueden reimplementar).

Al final dame la URL local y, si configuré Vercel CLI, la URL pública.
```

### Mega-prompt #5 — Agente QA con Sai / SimuLang

```
Implementa al QA Agent usando SimuLang (@simular-ai/simulib-js) para que
de verdad abra la mini-app desplegada (la URL de /generated-app en Vercel)
en un navegador real y la pruebe.

1. Escribe un script TypeScript que:
   - Abra la URL pública de la app generada
   - Navegue al formulario de "crear listing"
   - Intente un caso normal (debería funcionar)
   - Intente un caso límite que probablemente rompa algo (ej. campo vacío,
     precio negativo, texto extremadamente largo)
   - Capture un screenshot del resultado con screenshotFull()
   - Devuelva un JSON estructurado: { bugs_found: [...], screenshot_path }

2. Conecta este script al flujo de El Mercadito de AI: cuando el job del QA Agent es
   "ejecutado" (después de ganar su bid), corre este script real y publica
   el resultado en Redis como un evento `qa:report`, visible en el frontend
   como una tarjeta "QA Agent encontró: [bug]" con el screenshot.

3. Si SimuLang tiene fricción de setup en los próximos 20 minutos, dime
   exactamente en qué paso te trabaste y seguimos con la documentación de
   docs.simular.ai/simulang/simulang-claude-code en paralelo — no te
   quedes atascado más de 20 minutos en un solo problema de configuración,
   avísame.

Al final, recuérdame que el equipo tiene que postear en X o LinkedIn con
#SaiCal etiquetando a la cuenta oficial de Sai — es requisito del premio,
no opcional.
```

### Mega-prompt #6 — Agente Growth con Browserbase / Stagehand

```
Implementa al Growth Agent usando Stagehand (@browserbasehq/stagehand) para
que realice una acción real en la web — no simulada.

1. Usando Stagehand sobre Browserbase, escribe una tarea que:
   - Abra la página de signup/landing de la mini-app generada (la misma URL
     de Vercel del mega-prompt #4)
   - Llene el formulario de signup con 3 usuarios de prueba con datos
     realistas pero claramente ficticios (nombres random, emails tipo
     test+1@example.com)
   - Confirme que los signups aparecen reflejados en la app (ej. un
     contador de usuarios sube)

2. Publica el resultado en Redis como evento `growth:report`, visible en
   el frontend como "Growth Agent consiguió 3 usuarios reales" con un
   timestamp.

3. Usa explícitamente Stagehand (no Playwright puro) para que cuente como
   "powered by Browserbase platform" según el criterio del premio.

Si el tiempo apremia, prioriza que ESTA tarea corra de forma confiable
sobre que sea elaborada — un signup real funcionando vale más que un
flujo complejo que falla en vivo.
```

### Mega-prompt #7 — Polish visual

```
Dale un pase de diseño serio a El Mercadito de AI. Ahora mismo es funcional pero genérico
y necesita verse como un producto real, no un prototipo de hackathon.

- Define una identidad visual: paleta de color, tipografía, y un concepto
  visual claro para "marketplace de agentes" (piensa en una mezcla entre
  terminal de trading en vivo y un chat — números, tickers, badges de
  estado, animaciones sutiles de entrada para cada bid).
- Asegúrate que la guerra de bids se sienta "viva": transiciones suaves,
  no saltos bruscos, indicadores de estado claros (pujando / ganó / perdió /
  auto-mejorando).
- Revisa contraste y legibilidad en proyector — los jueces ven esto desde
  lejos en una mesa, no en su monitor.
- Agrega un header simple con el nombre "El Mercadito de AI" y un one-liner del pitch.
- No introduzcas dependencias nuevas pesadas ni rehagas la arquitectura —
  esto es pulido visual, no refactor.
```

### Mega-prompt #8 — Submission de Devpost

```
Escribe el texto completo de nuestra submission para Devpost, basado en todo
lo que construimos en este repo (revisa el código y los README si necesitas
refrescar detalles). Necesito:

1. Elevator pitch de 2-3 oraciones.
2. Descripción detallada: el problema, cómo funciona El Mercadito de AI, qué stack
   usamos y por qué, y qué specifically construimos en estas 17 horas
   (sé honesto y específico, no genérico).
3. Una lista clara de qué sponsors integramos y CÓMO exactamente (Redis,
   Sentry, Sai/SimuLang, Browserbase/Stagehand, Fetch.ai uAgents, Claude
   Code) — los jueces de cada sponsor leen esto buscando su tecnología
   específica, no la escondas en prosa genérica.
4. Un párrafo corto de "qué sigue" (roadmap) que mencione lo que
   deliberadamente NO construimos por tiempo (ej. integración completa de
   Token Company, registro en Agentverse) — mejor ser honestos que parecer
   que mentimos sobre el alcance.

Formato listo para copiar/pegar en el campo de descripción de Devpost.
```

---

## 7. GUION DE DEMO (5 minutos — los jueces solo tienen eso por mesa)

1. **(30s)** Pitch de 2 líneas + escribe la idea de la app en vivo frente a los jueces.
2. **(60s)** La guerra de bids aparece — déjala hablar sola, no narren cada bid, señalen el momento en que un agente sube/baja su precio.
3. **(45s)** Aprueben un bid en vivo (humano en el loop, mencionen el paralelo con cómo Sai funciona con aprobaciones).
4. **(60s)** El momento wow: el agente falla, Sentry lo captura, se auto-mejora. Aquí SÍ narren — esto es lo que van a recordar.
5. **(60s)** QA Agent abre la app real y muestra el bug que encontró con screenshot. Growth Agent muestra usuarios reales conseguidos.
6. **(30s)** Cierre: "todo esto, código incluido, lo escribió Claude Code en 17 horas — incluyendo este mismo pitch."

**Plan B:** tengan un video grabado de un run exitoso completo. Si algo falla en vivo, no improvisen reparando frente al juez — digan "tenemos un run grabado, déjenme mostrarles" y sigan.

---

## 8. CHECKLIST FINAL ANTES DE SUBMIT

- [ ] Repo de GitHub público, con README claro
- [ ] Imagen del proyecto subida a Devpost (requisito explícito)
- [ ] Número de mesa incluido en la submission
- [ ] Equipo completo agregado en Devpost (Diego + Juan)
- [ ] Post social con #SaiCal enviado (requisito del premio Sai)
- [ ] Submission enviado ANTES de las 11:00 AM PDT del domingo (no a las 10:59)
- [ ] Verificar en consola de Anthropic que aún quedan créditos por si quieren hacer una llamada en vivo durante el demo

---

## 9. LO QUE HACEN EN LOS PRÓXIMOS 10 MINUTOS

1. ~~Confirmen el nombre del proyecto~~ — ya está: **El Mercadito de AI**. En código usen el slug `mercadito` (carpetas, package.json, env vars) para no pelear con espacios y acentos.
2. Creen el repo de GitHub (sugerencia de nombre: `mercadito-ai`).
3. Diego va al booth de Fetch.ai y Token Company a preguntar por el brief específico de este hackathon (no está publicado online).
4. Juan abre Claude Code y pega el Mega-prompt #1.

Vámonos.