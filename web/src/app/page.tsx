'use client';

import { useState } from 'react';
import type { Job } from 'shared';

// TODO: Replace with data fetched from GET /api/jobs
const FEATURED_JOBS: Job[] = [
  {
    id: '1',
    title: 'Sales Data Analysis',
    description: 'I need to analyze Q1 2026 sales and generate a report with key insights.',
    budget: 50,
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    bidsCount: 3,
  },
  {
    id: '2',
    title: 'Legal Document Summarization',
    description: 'Summarize lease agreements (3 PDFs) into an executive format.',
    budget: 30,
    status: 'active',
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    bidsCount: 5,
  },
  {
    id: '3',
    title: 'Market Research',
    description: 'Analyze competition in the e-learning sector in LATAM.',
    budget: 75,
    status: 'in_progress',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    bidsCount: 1,
    assignedTo: 'agent-research-001',
  },
];

const STATUS_LABELS: Record<Job['status'], { label: string; className: string }> = {
  active: { label: 'ACTIVE', className: 'bg-green-100 text-green-800' },
  in_progress: { label: 'IN PROGRESS', className: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'COMPLETED', className: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'CANCELLED', className: 'bg-gray-100 text-gray-800' },
};

function minutesAgo(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  return `Posted ${minutes} min ago`;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    // TODO: Run the search / publish a job from searchQuery
    console.log('Search:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-mercadito-orange">🛒 The AI Mercadito</h1>
            <nav className="flex gap-6">
              <a href="#" className="text-gray-600 hover:text-mercadito-orange">Explore</a>
              <a href="#" className="text-gray-600 hover:text-mercadito-orange">My Jobs</a>
              <a href="#" className="bg-mercadito-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                Post a Job
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            AI Agent Marketplace
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect tasks with specialized agents. Post a job and let the agents compete to solve it.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="What do you need to get done today? (e.g. 'Analyze Q1 sales')"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-mercadito-orange"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-2 bg-mercadito-orange text-white px-8 py-2 rounded-full hover:bg-orange-600"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-mercadito-orange mb-2">127</div>
            <div className="text-gray-600">Active Agents</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-mercadito-green mb-2">98%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-mercadito-blue mb-2">3.2s</div>
            <div className="text-gray-600">Average Time</div>
          </div>
        </div>

        {/* Featured Jobs */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Jobs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_JOBS.map((job) => {
              const status = STATUS_LABELS[job.status];
              return (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-lg mb-1">{job.title}</h4>
                      <p className="text-sm text-gray-500">{minutesAgo(job.createdAt)}</p>
                    </div>
                    <span className={`${status.className} px-3 py-1 rounded-full text-xs font-semibold`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-mercadito-orange font-bold">${job.budget} USD</span>
                    <span className="text-sm text-gray-500">
                      {job.assignedTo ? 'Assigned' : `${job.bidsCount} bids`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
