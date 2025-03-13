'use client';

import { useState } from 'react';
import { Template } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/file-storage';

interface TemplateFormSimpleProps {
  onSubmit: (templateData: Omit<Template, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  isSubmitting: boolean;
  initialData?: Partial<Template>;
}

export default function TemplateFormSimple({
  onSubmit,
  isSubmitting,
  initialData,
}: TemplateFormSimpleProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [dimensions, setDimensions] = useState(initialData?.dimensions || 'A4');
  const [fileNaming, setFileNaming] = useState(initialData?.fileNaming || 'certificate_{{name}}_{{index}}');
  const [baseTemplate, setBaseTemplate] = useState(
    initialData?.baseTemplate && !initialData.baseTemplate.includes('placehold.co') 
      ? initialData.baseTemplate 
      : '/assets/placeholders/certificate-template.png'
  );
  const [comments, setComments] = useState([
    "Use {{name}}, {{email}} etc. to insert data from your dataset. {{index}} adds a unique sequence number."
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Upload the file using our storage utility
      const result = await uploadFile(file, 'templates');
      
      if (result.error) {
        throw result.error;
      }
      
      // Set the template URL
      setBaseTemplate(result.url);
      toast({
        title: 'Upload successful',
        description: 'Template background has been uploaded',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload template background',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        title: 'Missing title',
        description: 'Please provide a title for your template',
        variant: 'destructive',
      });
      return;
    }

    if (!fileNaming) {
      toast({
        title: 'Missing file naming pattern',
        description: 'Please provide a file naming pattern',
        variant: 'destructive',
      });
      return;
    }

    // Prepare template data
    const templateData = {
      title,
      dimensions,
      baseTemplate,
      fileNaming,
      labels: initialData?.labels || [],
      images: initialData?.images || [],
    };

    onSubmit(templateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Template Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          placeholder="e.g., Certificate of Completion"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Certificate Dimensions
        </label>
        <select
          value={dimensions}
          onChange={(e) => setDimensions(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
        >
          <option value="A4">A4 (210 × 297 mm)</option>
          <option value="Letter">Letter (8.5 × 11 in)</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File Naming Pattern
        </label>
        <input
          type="text"
          value={fileNaming}
          onChange={(e) => setFileNaming(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          placeholder="e.g., certificate_{{name}}_{{index}}"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          {comments[0]}
        </p>
      </div>
      
      <div>
        <h3 className="block text-sm font-medium text-gray-700 mb-1">Template Background</h3>
        <p className="text-sm text-gray-500 mb-2">
          Upload a PDF for the certificate background.
        </p>
        <div className="mt-2 flex flex-col items-center">
          <div className="h-40 w-full bg-gray-100 border rounded flex items-center justify-center mb-3">
            {baseTemplate ? (
              <img src={baseTemplate} alt="Template preview" className="max-h-full" />
            ) : (
              <div className="text-gray-400">No template background</div>
            )}
          </div>
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            {isUploading ? 'Uploading...' : 'Upload background'} 
            <input
              type="file"
              accept=".pdf, .png, .jpg, .jpeg"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </form>
  );
}