'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import TemplateCard from '@/components/dashboard/template-card';
import DatasetCard from '@/components/dashboard/dataset-card';
import ExecutionCard from '@/components/dashboard/execution-card';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('templates');

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={session?.user} />
      <div className="flex">
        <DashboardSidebar activeItem="dashboard" />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-gray-600">
              Welcome back, {session?.user?.name || 'User'}
            </p>
          </div>

          <div className="mb-8">
            <div className="flex border-b border-gray-200">
              <button
                className={`mr-4 pb-2 px-1 ${
                  activeTab === 'templates'
                    ? 'border-b-2 border-indigo-600 font-medium text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('templates')}
              >
                Templates
              </button>
              <button
                className={`mr-4 pb-2 px-1 ${
                  activeTab === 'datasets'
                    ? 'border-b-2 border-indigo-600 font-medium text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('datasets')}
              >
                Datasets
              </button>
              <button
                className={`mr-4 pb-2 px-1 ${
                  activeTab === 'executions'
                    ? 'border-b-2 border-indigo-600 font-medium text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('executions')}
              >
                Executions
              </button>
            </div>
          </div>

          {activeTab === 'templates' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  My Templates
                </h2>
                <Link
                  href="/dashboard/templates/new"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Create Template
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder for actual template data */}
                <TemplateCard
                  id="placeholder-1"
                  title="Certificate of Achievement"
                  dimensions="A4"
                  createdAt={new Date().toISOString()}
                />
                <TemplateCard
                  id="placeholder-2"
                  title="Training Completion"
                  dimensions="Letter"
                  createdAt={new Date().toISOString()}
                />
                <TemplateCard
                  id="new"
                  title="Create New Template"
                  isCreateCard={true}
                />
              </div>
            </div>
          )}

          {activeTab === 'datasets' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  My Datasets
                </h2>
                <Link
                  href="/dashboard/datasets/new"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Create Dataset
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder for actual dataset data */}
                <DatasetCard
                  id="placeholder-1"
                  title="Course Participants"
                  recordCount={25}
                  createdAt={new Date().toISOString()}
                />
                <DatasetCard
                  id="placeholder-2"
                  title="Workshop Attendees"
                  recordCount={12}
                  createdAt={new Date().toISOString()}
                />
                <DatasetCard
                  id="new"
                  title="Create New Dataset"
                  isCreateCard={true}
                />
              </div>
            </div>
          )}

          {activeTab === 'executions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Recent Executions
                </h2>
                <Link
                  href="/dashboard/execute/new"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  New Execution
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {/* Placeholder for actual execution data */}
                <ExecutionCard
                  id="placeholder-1"
                  templateName="Certificate of Achievement"
                  datasetName="Course Participants"
                  status="Completed"
                  createdAt={new Date().toISOString()}
                  fileCount={25}
                />
                <ExecutionCard
                  id="placeholder-2"
                  templateName="Training Completion"
                  datasetName="Workshop Attendees"
                  status="Processing"
                  createdAt={new Date().toISOString()}
                  fileCount={0}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}