'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import DatasetManualCreator from '@/components/datasets/dataset-manual-creator';
import DatasetImport from '@/components/datasets/dataset-import';
import { Dataset } from '@/types';

export default function EditDatasetPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleUpdateDataset = async (title: string, data: any[]) => {
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
      const response = await fetch(`/api/datasets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update dataset');
      }

      toast({
        title: 'Success',
        description: 'Dataset updated successfully.',
      });

      router.push(`/dashboard/datasets/${params.id}`);
    } catch (error) {
      console.error('Error updating dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to update dataset. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportData = (importedData: Record<string, any>[]) => {
    if (dataset) {
      setDataset({
        ...dataset,
        data: importedData,
      });
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
                The dataset you are trying to edit does not exist or you do not have
                permission to edit it.
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
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={session?.user} />
      <div className="flex">
        <DashboardSidebar activeItem="datasets" />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Dataset: {dataset.title}
            </h1>
            <p className="mt-1 text-gray-600">
              Update your dataset information or import new data.
            </p>
          </div>

          <div className="bg-white shadow rounded-md p-6 mb-6">
            <DatasetManualCreator
              onSubmit={handleUpdateDataset}
              isSubmitting={isSubmitting}
              initialTitle={dataset.title}
              initialData={dataset.data as Record<string, string>[]}
            />
          </div>

          <div className="mb-6">
            <DatasetImport onImport={handleImportData} />
          </div>
        </main>
      </div>
    </div>
  );
}