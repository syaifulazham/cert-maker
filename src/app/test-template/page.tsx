'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function TestTemplatePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Template Images</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Certificate Template</h2>
          <div className="bg-gray-100 p-2 rounded">
            <img 
              src="/assets/placeholders/certificate-template.png" 
              alt="Certificate Template"
              className="max-w-full h-auto"
            />
            <p className="mt-2 text-sm text-gray-500">
              Path: /assets/placeholders/certificate-template.png
            </p>
          </div>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Image Placeholder</h2>
          <div className="bg-gray-100 p-2 rounded">
            <img 
              src="/assets/placeholders/image-placeholder.png" 
              alt="Image Placeholder"
              className="max-w-full h-auto"
            />
            <p className="mt-2 text-sm text-gray-500">
              Path: /assets/placeholders/image-placeholder.png
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}