'use client';

import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/file-storage';

interface TemplateImagesProps {
  images: Image[];
  onAddImage: (image: Image) => void;
  onUpdateImage: (index: number, image: Image) => void;
  onRemoveImage: (index: number) => void;
}

export default function TemplateImages({
  images,
  onAddImage,
  onUpdateImage,
  onRemoveImage,
}: TemplateImagesProps) {
  const [url, setUrl] = useState('');
  const [x, setX] = useState('100');
  const [y, setY] = useState('100');
  const [width, setWidth] = useState('50');
  const [height, setHeight] = useState('50');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropzone for image upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        // Check if it's an image file
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file type',
            description: 'Please upload an image file',
            variant: 'destructive',
          });
          return;
        }
        
        setUploadedFile(file);
        handleFileUpload(file);
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    maxFiles: 1,
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      // Upload the file using our storage utility
      const result = await uploadFile(file, 'images');
      
      if (result.error) {
        throw result.error;
      }
      
      // Set the URL
      setUrl(result.url);
        toast({
          title: 'Upload successful',
          description: 'Image has been uploaded',
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: 'Missing image',
        description: 'Please upload an image or provide a URL',
        variant: 'destructive',
      });
      return;
    }

    const newImage: Image = {
      id: editingIndex !== null ? images[editingIndex].id : Math.random().toString(),
      url,
      x: parseFloat(x),
      y: parseFloat(y),
      width: parseFloat(width),
      height: parseFloat(height),
    };
    
    if (editingIndex !== null) {
      onUpdateImage(editingIndex, newImage);
      setEditingIndex(null);
    } else {
      onAddImage(newImage);
    }
    
    // Reset form
    setUrl('');
    setX('100');
    setY('100');
    setWidth('50');
    setHeight('50');
    setUploadedFile(null);
  };
  
  const handleEdit = (index: number) => {
    const image = images[index];
    setUrl(image.url);
    setX(image.x.toString());
    setY(image.y.toString());
    setWidth(image.width.toString());
    setHeight(image.height.toString());
    setEditingIndex(index);
  };
  
  const handleCancel = () => {
    // Reset form
    setUrl('');
    setX('100');
    setY('100');
    setWidth('50');
    setHeight('50');
    setUploadedFile(null);
    setEditingIndex(null);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
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
                      : url 
                        ? 'Upload a new image or drag and drop' 
                        : 'Upload an image or drag and drop'}
                  </p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG, GIF, SVG up to 10MB</p>
              </div>
            </div>
            
            {url && (
              <div className="mt-3 flex items-center">
                <div className="h-16 w-16 border rounded overflow-hidden mr-2">
                  <img src={url} alt="Preview" className="h-full w-full object-contain" />
                </div>
                <span className="text-sm text-indigo-600">Image uploaded</span>
              </div>
            )}
            
            <div className="mt-3">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                Image URL (optional)
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="https://example.com/image.png"
              />
              <p className="mt-1 text-xs text-gray-500">
                You can upload an image or provide a direct URL to an image
              </p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="x" className="block text-sm font-medium text-gray-700">
                X Position (mm)
              </label>
              <input
                type="number"
                id="x"
                value={x}
                onChange={(e) => setX(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                step="1"
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="y" className="block text-sm font-medium text-gray-700">
                Y Position (mm)
              </label>
              <input
                type="number"
                id="y"
                value={y}
                onChange={(e) => setY(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                step="1"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="width" className="block text-sm font-medium text-gray-700">
                Width (mm)
              </label>
              <input
                type="number"
                id="width"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
                min="1"
                step="1"
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                Height (mm)
              </label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
                min="1"
                step="1"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          {editingIndex !== null ? (
            <>
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Update Image
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Add Image
            </button>
          )}
        </div>
      </form>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Images ({images.length})</h3>
        {images.length > 0 ? (
          <ul className="border rounded divide-y overflow-hidden">
            {images.map((image, index) => (
              <li key={image.id} className="px-4 py-3 bg-white hover:bg-gray-50 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-12 w-12 border rounded overflow-hidden mr-3">
                    <img src={image.url} alt={`Image ${index + 1}`} className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">
                      {`Position: (${image.x}mm, ${image.y}mm) • Size: ${image.width}mm × ${image.height}mm`}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(index)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">No images added yet</p>
        )}
      </div>
    </div>
  );
}