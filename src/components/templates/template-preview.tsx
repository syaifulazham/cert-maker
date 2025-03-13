'use client';

import { useState, useEffect, useRef } from 'react';
import { Template, Label, Image } from '@/types';

interface TemplatePreviewProps {
  template: Template;
  previewData?: Record<string, string>;
}

export default function TemplatePreview({ 
  template, 
  previewData = {} 
}: TemplatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Set dimensions based on template
  const getDimensions = () => {
    if (!template.dimensions) {
      return { width: 210, height: 297 }; // Default to A4
    }
    
    const dimensionsStr = template.dimensions.toString().toLowerCase();
    
    switch (dimensionsStr) {
      case 'a4':
        return { width: 210, height: 297 }; // mm
      case 'letter':
        return { width: 215.9, height: 279.4 }; // mm
      case 'custom':
        // Parse custom dimensions if available, otherwise default to A4
        try {
          const dimensions = JSON.parse(template.dimensions.toString());
          return { width: dimensions.width, height: dimensions.height };
        } catch (e) {
          return { width: 210, height: 297 };
        }
      default:
        return { width: 210, height: 297 }; // Default to A4
    }
  };
  
  const { width, height } = getDimensions();
  
  // Calculate scale to fit preview container
  const calculateScale = () => {
    if (!containerRef.current) return 1;
    
    const containerWidth = containerRef.current.clientWidth;
    const scale = (containerWidth - 40) / width; // 40px for padding
    
    return Math.min(scale, 1); // Don't scale up beyond 100%
  };
  
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const handleResize = () => {
      setScale(calculateScale());
    };
    
    // Calculate initial scale
    setScale(calculateScale());
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [template, containerRef.current]);
  
  return (
    <div className="relative" ref={containerRef}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
          <svg 
            className="animate-spin h-8 w-8 text-indigo-600" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div 
        className="relative overflow-hidden border border-gray-300 shadow-sm mx-auto"
        style={{
          width: `${width * scale}mm`,
          height: `${height * scale}mm`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Base template (PDF background) */}
        {template.baseTemplate && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${template.baseTemplate.includes('placehold.co') ? '/assets/placeholders/certificate-template.png' : template.baseTemplate})`,
              width: `${width}mm`,
              height: `${height}mm`,
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError('Failed to load template background');
              setIsLoading(false);
            }}
          ></div>
        )}
        
        {/* Images */}
        {(template.images as Image[] || []).map((image, index) => {
          if (!image) return null;
          
          return (
            <div
              key={`image-${index}`}
              className="absolute"
              style={{
                left: `${image.x || 0}mm`,
                top: `${image.y || 0}mm`,
                width: `${image.width || 50}mm`,
                height: `${image.height || 50}mm`,
                backgroundImage: `url(${image.url && !image.url.includes('placehold.co') ? image.url : '/assets/placeholders/image-placeholder.png'})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            ></div>
          );
        })}
        
        {/* Labels */}
        {(template.labels as Label[] || []).map((label, index) => {
          if (!label) return null;
          
          // Replace dynamic content with preview data if available
          let text = label.text;
          if (label.isDynamic && label.datasetField && previewData) {
            text = previewData[label.datasetField] || `{{${label.datasetField}}}`;
          }
          
          return (
            <div
              key={`label-${index}`}
              className="absolute"
              style={{
                left: `${label.x}mm`,
                top: `${label.y}mm`,
                fontFamily: label.fontFamily || 'Arial',
                fontSize: `${label.fontSize || 12}pt`,
                fontWeight: label.isBold ? 'bold' : 'normal',
                fontStyle: label.isItalic ? 'italic' : 'normal',
                color: label.fontColor || '#000000',
                textAlign: label.alignment || 'left',
              }}
            >
              {text || 'Sample Text'}
            </div>
          );
        })}
        
        {/* Show dimensions for reference */}
        <div className="absolute bottom-1 right-1 text-xs text-gray-400">
          {width} × {height} mm
        </div>
      </div>
    </div>
  );
}