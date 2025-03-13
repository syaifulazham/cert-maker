'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import TemplateForm from '@/components/templates/template-form';
import { useToast } from '@/hooks/use-toast';
import { Template, ExtendedUser } from '@/types';

export default function NewTemplatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTemplate = async (templateData: Omit<Template, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/templates/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const data = await response.json();

      toast({
        title: 'Success',
        description: 'Template created successfully.',
      });

      router.push(`/dashboard/templates/${data.template.id}`);
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create template. Please try again.',
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
      <DashboardHeader user={session?.user as ExtendedUser | undefined} />
      <div className="flex">
        <DashboardSidebar activeItem="templates" />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Template
            </h1>
            <p className="mt-1 text-gray-600">
              Design your certificate template with custom labels and images
            </p>
          </div>

          <div className="bg-white shadow rounded-md p-6">
            <TemplateForm 
              onSubmit={handleCreateTemplate} 
              isSubmitting={isSubmitting}
            />
          </div>
        </main>
      </div>
    </div>
  );
}