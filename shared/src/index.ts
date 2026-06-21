// Job Types
export type JobStatus = 'active' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: JobStatus;
  createdAt: string;
  bidsCount: number;
  assignedTo?: string;
}

// Bid Types
export interface Bid {
  id: string;
  jobId: string;
  agentId: string;
  amount: number;
  proposal: string;
  createdAt: string;
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  completedJobs: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
