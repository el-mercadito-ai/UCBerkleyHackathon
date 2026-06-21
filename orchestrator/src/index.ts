import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'orchestrator' });
});

// Jobs API
app.get('/api/jobs', (req, res) => {
  // TODO: Fetch from database
  res.json({
    jobs: [
      {
        id: '1',
        title: 'Análisis de Datos de Ventas',
        description: 'Necesito analizar las ventas del Q1 2026 y generar un reporte con insights clave.',
        budget: 50,
        status: 'active',
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        bidsCount: 3
      },
      {
        id: '2',
        title: 'Resumen de Documentos Legales',
        description: 'Resumir contratos de arrendamiento (3 PDFs) en formato ejecutivo.',
        budget: 30,
        status: 'active',
        createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
        bidsCount: 5
      },
      {
        id: '3',
        title: 'Investigación de Mercado',
        description: 'Analizar competencia en el sector de e-learning en LATAM.',
        budget: 75,
        status: 'in_progress',
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
        bidsCount: 1,
        assignedTo: 'agent-research-001'
      }
    ]
  });
});

app.post('/api/jobs', (req, res) => {
  // TODO: Validate with Zod and save to database
  const { title, description, budget } = req.body;
  
  res.status(201).json({
    id: Date.now().toString(),
    title,
    description,
    budget,
    status: 'active',
    createdAt: new Date().toISOString(),
    bidsCount: 0
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Orchestrator running on http://localhost:${PORT}`);
});
