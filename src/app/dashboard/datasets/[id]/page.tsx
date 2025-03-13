'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import DatasetViewer from '@/components/datasets/dataset-viewer';
import DatasetExport from '@/components/datasets/dataset-export';
import { Dataset } from '@/types';
import { formatDate } from '@/lib/utils';

export default function DatasetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Create a local variable to track if the component is mounted
    let isMounted = true;
    
    async function fetchDataset() {
      if (status !== 'authenticated') return;
      
      try {
        const response = await fetch(`/api/datasets/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dataset');
        }
        const data = await response.json();
        
        // Only update state if the component is still mounted
        if (isMounted) {
          setDataset(data.dataset);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching dataset:', error);
        // Only show toast and update state if the component is still mounted
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'Failed to load dataset. Please try again.',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      }
    }

    fetchDataset();
    
    // Clean up function to set isMounted to false when the component unmounts
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this dataset?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/datasets/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete dataset');
      }

      toast({
        title: 'Success',
        description: 'Dataset deleted successfully.',
      });

      router.push('/dashboard/datasets');
    } catch (error) {
      console.error('Error deleting dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete dataset. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader user={session?.user} />
        <div className="flex">
          <DashboardSidebar activeItem="datasets" />
          <main className="flex-1 p-6">
            <div className="bg-white shadow rounded-md p-6">
              <h2 className="text-xl font-semibold text-red-600">
                Dataset not found
              </h2>
              <p className="mt-2">
                The dataset you are looking for does not exist or you do not have
                permission to view it.
              </p>
              <button
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500"
                onClick={() => router.push('/dashboard/datasets')}
              >
                Back to Datasets
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 ">
      <DashboardHeader user={session?.user} />
      <div className="flex">
        <DashboardSidebar activeItem="datasets" />
        <main className="flex-1 p-6 ">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {dataset.title}
              </h1>
              <p className="text-sm text-gray-500">
                Created on {formatDate(new Date(dataset.createdAt))}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/dashboard/datasets/${params.id}/edit`)}
                className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500"
              >
                Edit Dataset
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-red-400"
              >
                {isDeleting ? 'Deleting...' : 'Delete Dataset'}
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-md p-6 mb-6">
            <DatasetViewer dataset={dataset} />
          </div>
          
          <DatasetExport dataset={dataset} />
        </main>
      </div>
    </div>
  );
}