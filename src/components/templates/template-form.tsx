'use client';

import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Template, Label, Image } from '@/types';
import TemplatePreview from './template-preview';
import TemplateLabels from './template-labels';
import TemplateImages from './template-images';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/file-storage';

interface TemplateFormProps {
  onSubmit: (templateData: Omit<Template, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  isSubmitting: boolean;
  initialData?: Partial<Template>;
}

export default function TemplateForm({
  onSubmit,
  isSubmitting,
  initialData,
}: TemplateFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [dimensions, setDimensions] = useState(initialData?.dimensions || 'A4');
  const [customWidth, setCustomWidth] = useState('210');
  const [customHeight, setCustomHeight] = useState('297');
  const [fileNaming, setFileNaming] = useState(initialData?.fileNaming || 'certificate_{{name}}_{{index}}');
  const [baseTemplate, setBaseTemplate] = useState(initialData?.baseTemplate || '');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [labels, setLabels] = useState<Label[]>(initialData?.labels as Label[] || []);
  const [images, setImages] = useState<Image[]>(initialData?.images as Image[] || []);
  const [activeTab, setActiveTab] = useState<'labels' | 'images'>('labels');
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, string>>({
    name: 'John Doe',
    email: 'john@example.com',
    date: '2025-03-13',
    course: 'Advanced Web Development',
  });
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropzone for PDF template upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        // Check if it's a PDF file
        if (file.type !== 'application/pdf') {
          toast({
            title: 'Invalid file type',
            description: 'Please upload a PDF file',
            variant: 'destructive',
          });
          return;
        }
        
        setUploadedFile(file);
        handleFileUpload(file);
      }
    },
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
  });

  const handleFileUpload = async (file: File) => {
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
      }
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

    if (!baseTemplate) {
      toast({
        title: 'Missing template background',
        description: 'Please upload a PDF template background',
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

    // Prepare dimensions value
    let dimensionsValue = dimensions;
    if (dimensions === 'Custom') {
      dimensionsValue = JSON.stringify({
        width: parseFloat(customWidth),
        height: parseFloat(customHeight),
      });
    }

    // Prepare template data
    const templateData = {
      title,
      dimensions: dimensionsValue,
      baseTemplate,
      fileNaming,
      labels,
      images,
    };

    onSubmit(templateData);
  };

  const addLabel = (label: Label) => {
    setLabels([...labels, label]);
  };

  const updateLabel = (index: number, updatedLabel: Label) => {
    const newLabels = [...labels];
    newLabels[index] = updatedLabel;
    setLabels(newLabels);
  };

  const removeLabel = (index: number) => {
    setLabels(labels.filter((_, i) => i !== index));
  };

  const addImage = (image: Image) => {
    setImages([...images, image]);
  };

  const updateImage = (index: number, updatedImage: Image) => {
    const newImages = [...images];
    newImages[index] = updatedImage;
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic information */}
          <div className="p-6 rounded-md border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Template Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., Certificate of Completion"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
                  Certificate Dimensions
                </label>
                <select
                  id="dimensions"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">Letter (8.5 × 11 in)</option>
                  <option value="Custom">Custom Dimensions</option>
                </select>
                
                {dimensions === 'Custom' && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label htmlFor="customWidth" className="block text-sm font-medium text-gray-700">
                        Width (mm)
                      </label>
                      <input
                        type="number"
                        id="customWidth"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
                        min="50"
                        max="1000"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="customHeight" className="block text-sm font-medium text-gray-700">
                        Height (mm)
                      </label>
                      <input
                        type="number"
                        id="customHeight"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
                        min="50"
                        max="1000"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="fileNaming" className="block text-sm font-medium text-gray-700">
                  File Naming Pattern
                </label>
                <input
                  type="text"
                  id="fileNaming"
                  value={fileNaming}
                  onChange={(e) => setFileNaming(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., certificate_{{name}}_{{index}}"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Use {{name}}, {{email}} etc. to insert data from your dataset. {{index}} adds a unique sequence number.
                </p>
              </div>
            </div>
          </div>
          
          {/* Template background */}
          <div className="bg-white p-6 rounded-md border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Template Background</h2>
            <div 
              {...getRootProps()} 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300'
              }`}
            >
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <input {...getInputProps()} ref={fileInputRef} />
                  <p className="pl-1">
                    {isUploading 
                      ? 'Uploading...' 
                      : baseTemplate 
                        ? 'Upload a new template background or drag and drop' 
                        : 'Upload a PDF template background or drag and drop'}
                  </p>
                </div>
                <p className="text-xs text-gray-500">PDF files only</p>
              </div>
            </div>
            
            {baseTemplate && (
              <div className="mt-3">
                <p className="text-sm text-indigo-600">
                  Template background uploaded
                </p>
              </div>
            )}
          </div>
          
          {/* Labels and images */}
          <div className="bg-white p-6 rounded-md border border-gray-200">
            <div className="mb-4">
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  className={`mr-4 pb-2 px-1 ${
                    activeTab === 'labels'
                      ? 'border-b-2 border-indigo-600 font-medium text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('labels')}
                >
                  Labels
                </button>
                <button
                  type="button"
                  className={`mr-4 pb-2 px-1 ${
                    activeTab === 'images'
                      ? 'border-b-2 border-indigo-600 font-medium text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('images')}
                >
                  Images
                </button>
              </div>
            </div>
            
            {activeTab === 'labels' ? (
              <TemplateLabels 
                labels={labels} 
                onAddLabel={addLabel} 
                onUpdateLabel={updateLabel} 
                onRemoveLabel={removeLabel} 
              />
            ) : (
              <TemplateImages 
                images={images} 
                onAddImage={addImage} 
                onUpdateImage={updateImage} 
                onRemoveImage={removeImage} 
              />
            )}
          </div>
        </div>
        
        {/* Preview pane */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-md border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sample Data for Preview
              </label>
              
              {Object.keys(previewData).map((key) => (
                <div key={key} className="flex items-center mb-2">
                  <span className="block w-24 text-sm text-gray-500">{key}:</span>
                  <input
                    type="text"
                    value={previewData[key]}
                    onChange={(e) => setPreviewData({ ...previewData, [key]: e.target.value })}
                    className="flex-1 rounded-md border-gray-300 shadow-sm p-1 text-sm border focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
            
            <div className="border rounded border-gray-200 bg-gray-50 p-2">
              {baseTemplate ? (
                <TemplatePreview 
                  template={{
                    id: 'preview',
                    userId: '',
                    title,
                    baseTemplate,
                    dimensions: dimensions === 'Custom' 
                      ? JSON.stringify({ width: parseFloat(customWidth), height: parseFloat(customHeight) }) 
                      : dimensions,
                    labels,
                    images,
                    fileNaming,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }}
                  previewData={previewData}
                />
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">Upload a template background to see the preview</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}