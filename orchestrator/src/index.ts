import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import type { Job } from 'shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Allowed origins for CORS. Defaults to the local web dev server; override with
// CORS_ORIGINS (comma-separated) in production / on the deployed URL.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

// Middleware
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'orchestrator' });
});

// Jobs API
app.get('/api/jobs', (req, res) => {
  // TODO: Fetch from database
  const jobs: Job[] = [
    {
      id: '1',
      title: 'Sales Data Analysis',
      description: 'I need to analyze Q1 2026 sales and generate a report with key insights.',
      budget: 50,
      status: 'active',
      createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      bidsCount: 3
    },
    {
      id: '2',
      title: 'Legal Document Summarization',
      description: 'Summarize lease agreements (3 PDFs) into an executive format.',
      budget: 30,
      status: 'active',
      createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      bidsCount: 5
    },
    {
      id: '3',
      title: 'Market Research',
      description: 'Analyze competition in the e-learning sector in LATAM.',
      budget: 75,
      status: 'in_progress',
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      bidsCount: 1,
      assignedTo: 'agent-research-001'
    }
  ];
  res.json({ jobs });
});

// Validation schema for new jobs.
const createJobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  budget: z.number().positive()
});

app.post('/api/jobs', (req, res) => {
  // TODO: Persist to database
  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { title, description, budget } = parsed.data;
  const job: Job = {
    id: Date.now().toString(),
    title,
    description,
    budget,
    status: 'active',
    createdAt: new Date().toISOString(),
    bidsCount: 0
  };

  return res.status(201).json(job);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Orchestrator running on http://localhost:${PORT}`);
});
