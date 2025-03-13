'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import DatasetUploader from '@/components/datasets/dataset-uploader';
import DatasetManualCreator from '@/components/datasets/dataset-manual-creator';
import { parseCSV } from '@/utils/csv-parser';

export default function NewDatasetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCreateDataset = async (title: string, data: any[]) => {
    if (!title || !data.length) {
      toast({
        title: 'Validation Error',
        description: 'Please provide both a title and data for your dataset.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/datasets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create dataset');
      }

      toast({
        title: 'Success',
        description: 'Dataset created successfully.',
      });

      router.push('/dashboard/datasets');
    } catch (error) {
      console.error('Error creating dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to create dataset. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={session?.user} />
      <div className="flex">
        <DashboardSidebar activeItem="datasets" />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Dataset
            </h1>
            <p className="mt-1 text-gray-600">
              Upload a CSV file or manually create your dataset.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`mr-4 pb-2 px-1 ${
                  activeTab === 'upload'
                    ? 'border-b-2 border-indigo-600 font-medium text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('upload')}
              >
                Upload CSV
              </button>
              <button
                className={`mr-4 pb-2 px-1 ${
                  activeTab === 'manual'
                    ? 'border-b-2 border-indigo-600 font-medium text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('manual')}
              >
                Create Manually
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-md p-6">
            {activeTab === 'upload' ? (
              <DatasetUploader
                onSubmit={handleCreateDataset}
                isSubmitting={isSubmitting}
              />
            ) : (
              <DatasetManualCreator
                onSubmit={handleCreateDataset}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}