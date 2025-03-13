'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import DatasetCard from '@/components/dashboard/dataset-card';
import { Dataset } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function DatasetsPage() {
  const { data: session, status } = useSession();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Create a local variable to track if the component is mounted
    let isMounted = true;
    
    async function fetchDatasets() {
      if (status !== 'authenticated') return;
      
      try {
        const response = await fetch('/api/datasets/list');
        if (!response.ok) {
          throw new Error('Failed to fetch datasets');
        }
        const data = await response.json();
        
        // Only update state if the component is still mounted
        if (isMounted) {
          setDatasets(data.datasets || []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching datasets:', error);
        // Only show toast and update state if the component is still mounted
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'Failed to load datasets. Please try again.',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      }
    }

    fetchDatasets();
    
    // Clean up function to set isMounted to false when the component unmounts
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={session?.user} />
      <div className="flex">
        <DashboardSidebar activeItem="datasets" />
        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
            <Link
              href="/dashboard/datasets/new"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Create Dataset
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {datasets.length > 0 ? (
              datasets.map((dataset) => (
                <DatasetCard
                  key={dataset.id}
                  id={dataset.id}
                  title={dataset.title}
                  recordCount={(dataset.data as any[]).length}
                  createdAt={dataset.createdAt}
                />
              ))
            ) : (
              <>
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900">
                    No datasets found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first dataset to get started.
                  </p>
                </div>
                <DatasetCard
                  id="new"
                  title="Create New Dataset"
                  isCreateCard={true}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}