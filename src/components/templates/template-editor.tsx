'use client';

import { useState, useEffect, useRef } from 'react';
import { Template, Label, Image, Dataset } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/file-storage';
import { v4 as uuidv4 } from 'uuid';

// Define global variables for TypeScript
declare global {
  interface Window {
    __DRAG_ITEM?: { type: 'label' | 'image'; id: string };
  }
}

interface TemplateEditorProps {
  template: Template;
  onSave: (updatedTemplate: Template) => void;
  isSaving: boolean;
}

export default function TemplateEditor({
  template,
  onSave,
  isSaving,
}: TemplateEditorProps) {
  // Store a local copy of the template for editing
  const [editableTemplate, setEditableTemplate] = useState<Template>({
    ...template,
    labels: template.labels || [],
    images: template.images || [],
    baseTemplate: template.baseTemplate && !template.baseTemplate.includes('placehold.co')
      ? template.baseTemplate
      : '/assets/placeholders/certificate-template.png'
  });

  // Selection and UI state
  const [selectedItem, setSelectedItem] = useState<{ type: 'label' | 'image'; id: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [datasetFields, setDatasetFields] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [comments, setComments] = useState([
    "Use {{name}}, {{email}} etc. to insert data from your dataset. {{index}} adds a unique sequence number."
  ]);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Debugging - log template state changes
  useEffect(() => {
    console.log('Template state updated:', {
      labels: editableTemplate.labels.length,
      images: editableTemplate.images.length
    });
  }, [editableTemplate.labels, editableTemplate.images]);
  
  // Debugging - log drag state changes
  useEffect(() => {
    console.log('Drag state:', { 
      isDragging, 
      selectedItem: selectedItem ? `${selectedItem.type}-${selectedItem.id}` : 'none',
      dragOffset
    });
  }, [isDragging, selectedItem, dragOffset]);

  // Fetch datasets
  useEffect(() => {
    let isMounted = true;
    
    const fetchDatasets = async () => {
      try {
        const response = await fetch('/api/datasets/list');
        if (!response.ok) {
          throw new Error('Failed to fetch datasets');
        }
        
        const data = await response.json();
        if (isMounted) {
          setDatasets(data.datasets || []);
        }
      } catch (error) {
        console.error('Error fetching datasets:', error);
      }
    };
    
    fetchDatasets();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Update dataset fields when dataset changes
  useEffect(() => {
    if (selectedDataset && selectedDataset.data && selectedDataset.data.length > 0) {
      // Extract fields from the first row of data
      const firstRow = selectedDataset.data[0];
      const fields = Object.keys(firstRow);
      setDatasetFields(fields);

      // Create preview data from the first row
      setPreviewData(firstRow);
    } else {
      setDatasetFields([]);
      setPreviewData({});
    }
  }, [selectedDataset]);

  // Set dimensions based on template
  const getDimensions = () => {
    const dimensions = editableTemplate.dimensions;
    if (!dimensions) {
      return { width: 210, height: 297 }; // Default to A4
    }
    
    const dimensionsStr = dimensions.toString().toLowerCase();
    
    switch (dimensionsStr) {
      case 'a4':
        return { width: 210, height: 297 }; // mm
      case 'letter':
        return { width: 215.9, height: 279.4 }; // mm
      case 'custom':
        // Parse custom dimensions if available, otherwise default to A4
        try {
          const parsedDimensions = JSON.parse(dimensions.toString());
          return { width: parsedDimensions.width, height: parsedDimensions.height };
        } catch (e) {
          return { width: 210, height: 297 };
        }
      default:
        return { width: 210, height: 297 }; // Default to A4
    }
  };
  
  const { width, height } = getDimensions();

  // Calculate scale to fit editor container
  const calculateScale = () => {
    if (!editorRef.current) return 1;
    
    const containerWidth = editorRef.current.clientWidth;
    const scale = (containerWidth - 40) / width; // 40px for padding
    
    return Math.min(scale, 1); // Don't scale up beyond 100%
  };
  
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const handleResize = () => {
      setScale(calculateScale());
    };
    
    // Initial calculation with delay to ensure rendering
    const initTimer = setTimeout(() => {
      handleResize();
    }, 200);
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Helper function to update the template state
  const updateTemplateState = (updates: Partial<Template>) => {
    setEditableTemplate(current => ({
      ...current,
      ...updates
    }));
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      updateTemplateState({ baseTemplate: result.url });
      
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Upload the file using our storage utility
      const result = await uploadFile(file, 'images');
      
      if (result.error) {
        throw result.error;
      }
      
      // Add new image to the template
      const newImage: Image = {
        id: uuidv4(),
        url: result.url,
        x: 50, // Default position
        y: 50,
        width: 50,
        height: 50,
      };
      
      const updatedImages = [...editableTemplate.images, newImage];
      updateTemplateState({ images: updatedImages });
      setSelectedItem({ type: 'image', id: newImage.id });
      
      toast({
        title: 'Upload successful',
        description: 'Image has been added to the template',
      });
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

  const addStaticLabel = () => {
    const newLabel: Label = {
      id: uuidv4(),
      text: 'New Label',
      x: 50, // Default position
      y: 50,
      fontFamily: 'Arial',
      fontSize: 12,
      fontColor: '#000000',
      isBold: false,
      isItalic: false,
      alignment: 'left',
      isDynamic: false,
    };
    
    const updatedLabels = [...editableTemplate.labels, newLabel];
    updateTemplateState({ labels: updatedLabels });
    setSelectedItem({ type: 'label', id: newLabel.id });
  };

  const addDynamicLabel = (field: string) => {
    const newLabel: Label = {
      id: uuidv4(),
      text: `{{${field}}}`,
      x: 50, // Default position
      y: 50,
      fontFamily: 'Arial',
      fontSize: 12,
      fontColor: '#000000',
      isBold: false,
      isItalic: false,
      alignment: 'left',
      isDynamic: true,
      datasetField: field,
    };
    
    const updatedLabels = [...editableTemplate.labels, newLabel];
    updateTemplateState({ labels: updatedLabels });
    setSelectedItem({ type: 'label', id: newLabel.id });
  };

  const handleItemMouseDown = (type: 'label' | 'image', id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem({ type, id });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas (not on an item)
    // and we're not in the middle of a drag operation
    if (!isDragging) {
      setSelectedItem(null);
    }
  };
  
  // Mouse-based movement functions (more reliable than drag and drop)
  const handleMouseDown = (e: React.MouseEvent, type: 'label' | 'image', id: string) => {
    e.stopPropagation();
    
    // Select the item
    setSelectedItem({ type, id });
    
    // Start drag operation
    setIsDragging(true);
    
    // Find the element being dragged
    let item;
    if (type === 'label') {
      item = editableTemplate.labels.find(label => label.id === id);
    } else {
      item = editableTemplate.images.find(image => image.id === id);
    }
    
    if (!item) return;
    
    // Calculate the offset between mouse position and element position
    if (!editorRef.current) return;
    
    const canvasRect = editorRef.current.getBoundingClientRect();
    const cursorX = (e.clientX - canvasRect.left) / scale;
    const cursorY = (e.clientY - canvasRect.top) / scale;
    
    setDragOffset({
      x: cursorX - item.x,
      y: cursorY - item.y
    });
    
    // Add mouse move and mouse up event listeners to document
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !selectedItem || !editorRef.current) return;
    
    // Calculate new position
    const canvasRect = editorRef.current.getBoundingClientRect();
    const cursorX = (e.clientX - canvasRect.left) / scale;
    const cursorY = (e.clientY - canvasRect.top) / scale;
    
    // Apply offset to get element position
    const newX = Math.max(0, Math.min(width, cursorX - dragOffset.x));
    const newY = Math.max(0, Math.min(height, cursorY - dragOffset.y));
    
    // Update position based on item type
    if (selectedItem.type === 'label') {
      const updatedLabels = editableTemplate.labels.map(label => 
        label.id === selectedItem.id ? { ...label, x: newX, y: newY } : label
      );
      
      updateTemplateState({ labels: updatedLabels });
    } else {
      const updatedImages = editableTemplate.images.map(image => 
        image.id === selectedItem.id ? { ...image, x: newX, y: newY } : image
      );
      
      updateTemplateState({ images: updatedImages });
    }
  };
  
  const handleMouseUp = (e: MouseEvent) => {
    // Keep the item selected after drag completes
    // Only end the drag operation
    setIsDragging(false);
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleItemDragStart = (e: React.DragEvent, type: 'label' | 'image', id: string) => {
    // Store the drag data both in dataTransfer and as a global variable as a fallback
    e.dataTransfer.setData('text/plain', JSON.stringify({ type, id }));
    
    // Store in global variable as a backup in case dataTransfer data gets lost
    window.__DRAG_ITEM = { type, id };
    
    // Create a drag ghost image to improve drag visual feedback
    const dragIcon = document.createElement('div');
    dragIcon.style.width = '50px';
    dragIcon.style.height = '20px';
    dragIcon.style.background = 'rgba(99, 102, 241, 0.3)';
    dragIcon.style.border = '1px solid #6366f1';
    dragIcon.style.borderRadius = '4px';
    document.body.appendChild(dragIcon);
    e.dataTransfer.setDragImage(dragIcon, 25, 10);
    
    // Remove the drag ghost element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragIcon);
    }, 0);
    
    // Select the item being dragged
    setSelectedItem({ type, id });
    
    console.log(`Drag started: ${type} ${id}`);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    let type: 'label' | 'image' | undefined;
    let id: string | undefined;
    
    // Try to get the data from dataTransfer
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        type = data.type;
        id = data.id;
        console.log(`Drop data from dataTransfer: ${type} ${id}`);
      }
    } catch (err) {
      console.error('Error parsing drop data:', err);
    }
    
    // If dataTransfer failed, use our global backup
    if (!type || !id) {
      if (window.__DRAG_ITEM) {
        type = window.__DRAG_ITEM.type;
        id = window.__DRAG_ITEM.id;
        console.log(`Drop data from global: ${type} ${id}`);
      } else {
        console.error('No drag data available!');
        return;
      }
    }
    
    if (!editorRef.current) return;
    
    // Get canvas bounds
    const canvasRect = editorRef.current.getBoundingClientRect();
    
    // Calculate position in mm within the canvas
    // Ensure the position is within canvas boundaries
    const xPos = Math.max(0, Math.min(width, (e.clientX - canvasRect.left) / scale));
    const yPos = Math.max(0, Math.min(height, (e.clientY - canvasRect.top) / scale));
    
    console.log(`Dropping ${type} ${id} at position ${xPos}, ${yPos}`);
    
    if (type === 'label') {
      // Find the label to modify
      const labelToUpdate = editableTemplate.labels.find(label => label.id === id);
      
      if (!labelToUpdate) {
        console.error(`Label with ID ${id} not found`);
        return;
      }
      
      // Make a copy of the current labels array
      const updatedLabels = editableTemplate.labels.map(label => 
        label.id === id ? { ...label, x: xPos, y: yPos } : label
      );
      
      // Update the template state with the new labels array
      updateTemplateState({ labels: updatedLabels });
    } else if (type === 'image') {
      // Find the image to modify
      const imageToUpdate = editableTemplate.images.find(image => image.id === id);
      
      if (!imageToUpdate) {
        console.error(`Image with ID ${id} not found`);
        return;
      }
      
      // Make a copy of the current images array
      const updatedImages = editableTemplate.images.map(image => 
        image.id === id ? { ...image, x: xPos, y: yPos } : image
      );
      
      // Update the template state with the new images array
      updateTemplateState({ images: updatedImages });
    }
    
    // Clear the global backup after drop
    window.__DRAG_ITEM = undefined;
  };

  const updateSelectedLabel = (updates: Partial<Label>) => {
    if (!selectedItem || selectedItem.type !== 'label') return;
    
    const updatedLabels = editableTemplate.labels.map(label => 
      label.id === selectedItem.id ? { ...label, ...updates } : label
    );
    
    updateTemplateState({ labels: updatedLabels });
  };

  const updateSelectedImage = (updates: Partial<Image>) => {
    if (!selectedItem || selectedItem.type !== 'image') return;
    
    const updatedImages = editableTemplate.images.map(image => 
      image.id === selectedItem.id ? { ...image, ...updates } : image
    );
    
    updateTemplateState({ images: updatedImages });
  };
  
  // Rotate selected image by 90 degrees
  const rotateSelectedImage = () => {
    if (!selectedItem || selectedItem.type !== 'image') return;
    
    const selectedImage = editableTemplate.images.find(image => image.id === selectedItem.id);
    if (!selectedImage) return;
    
    // Update rotation
    const currentRotation = selectedImage.rotation || 0;
    const newRotation = (currentRotation + 90) % 360;
    
    updateSelectedImage({ rotation: newRotation });
  };

  const deleteSelectedItem = () => {
    if (!selectedItem) return;
    
    if (selectedItem.type === 'label') {
      const updatedLabels = editableTemplate.labels.filter(label => label.id !== selectedItem.id);
      updateTemplateState({ labels: updatedLabels });
    } else if (selectedItem.type === 'image') {
      const updatedImages = editableTemplate.images.filter(image => image.id !== selectedItem.id);
      updateTemplateState({ images: updatedImages });
    }
    
    setSelectedItem(null);
  };

  const getSelectedLabel = (): Label | undefined => {
    if (!selectedItem || selectedItem.type !== 'label') return undefined;
    return editableTemplate.labels.find(label => label.id === selectedItem.id);
  };

  const getSelectedImage = (): Image | undefined => {
    if (!selectedItem || selectedItem.type !== 'image') return undefined;
    return editableTemplate.images.find(image => image.id === selectedItem.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editableTemplate.title) {
      toast({
        title: 'Missing title',
        description: 'Please provide a title for your template',
        variant: 'destructive',
      });
      return;
    }

    if (!editableTemplate.fileNaming) {
      toast({
        title: 'Missing file naming pattern',
        description: 'Please provide a file naming pattern',
        variant: 'destructive',
      });
      return;
    }

    // Pass the updated template to the parent component
    onSave(editableTemplate);
  };

  // Get the currently selected item for editing
  const selectedLabel = getSelectedLabel();
  const selectedImage = getSelectedImage();

  console.log("Current labels:", editableTemplate.labels);
  console.log("Current images:", editableTemplate.images);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Canvas Area */}
      <div className="lg:col-span-2">
        <div className="bg-white shadow rounded-md p-6 h-full">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Template Editor</h2>
          
          <div className="mb-4 flex justify-between">
            <div>
              <button
                type="button"
                onClick={addStaticLabel}
                className="bg-blue-500 text-white px-3 py-1 rounded-md mr-2"
              >
                Add Text
              </button>
              
              <label className="bg-green-500 text-white px-3 py-1 rounded-md cursor-pointer">
                Add Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            {selectedItem && (
              <button
                type="button"
                onClick={deleteSelectedItem}
                className="bg-red-500 text-white px-3 py-1 rounded-md"
              >
                Delete Selected
              </button>
            )}
          </div>
          
          {/* Preview Canvas */}
          <div 
            ref={editorRef}
            className="relative border border-gray-300 shadow-sm mb-4 cursor-default"
            onClick={handleCanvasClick}
            style={{
              width: `${width * scale}mm`,
              height: `${height * scale}mm`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              overflow: 'hidden',
              position: 'relative', // Ensure proper positioning context
            }}
          >
            {/* Base template background */}
            {editableTemplate.baseTemplate && (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${editableTemplate.baseTemplate})`,
                  width: `${width}mm`,
                  height: `${height}mm`,
                }}
              ></div>
            )}
            
            {/* Labels */}
            {editableTemplate.labels.map((label) => {
              let displayText = label.text;
              
              if (label.isDynamic && label.datasetField && previewData) {
                displayText = previewData[label.datasetField] || `{{${label.datasetField}}}`;
              }
              
              const isSelected = selectedItem?.type === 'label' && selectedItem.id === label.id;
              
              return (
                <div
                  key={`label-${label.id}`}
                  className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'}`}
                  style={{
                    left: `${label.x}mm`,
                    top: `${label.y}mm`,
                    fontFamily: label.fontFamily || 'Arial',
                    fontSize: `${label.fontSize || 12}pt`,
                    fontWeight: label.isBold ? 'bold' : 'normal',
                    fontStyle: label.isItalic ? 'italic' : 'normal',
                    color: label.fontColor || '#000000',
                    textAlign: label.alignment || 'left',
                    padding: '4px',
                    minWidth: '30px',
                    minHeight: '20px',
                    zIndex: isSelected ? 100 : 10,
                    backgroundColor: isSelected ? 'rgba(219, 234, 254, 0.3)' : 'transparent',
                    pointerEvents: 'auto', // Ensure element can receive mouse events
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => handleMouseDown(e, 'label', label.id)}
                  draggable={false}
                >
                  {displayText || 'Sample Text'}
                </div>
              );
            })}
            
            {/* Images */}
            {editableTemplate.images.map((image) => {
              const isSelected = selectedItem?.type === 'image' && selectedItem.id === image.id;
              
              return (
                <div
                  key={`image-${image.id}`}
                  className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'}`}
                  style={{
                    left: `${image.x}mm`,
                    top: `${image.y}mm`,
                    width: `${image.width || 50}mm`,
                    height: `${image.height || 50}mm`,
                    backgroundImage: `url(${image.url && !image.url.includes('placehold.co') ? image.url : '/assets/placeholders/image-placeholder.png'})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    transform: image.rotation ? `rotate(${image.rotation}deg)` : 'none',
                    transformOrigin: 'center',
                    zIndex: isSelected ? 100 : 5,
                    backgroundColor: isSelected ? 'rgba(219, 234, 254, 0.1)' : 'transparent',
                    pointerEvents: 'auto', // Ensure element can receive mouse events
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => handleMouseDown(e, 'image', image.id)}
                  draggable={false}
                >
                </div>
              );
            })}
            
            {/* Show dimensions for reference */}
            <div className="absolute bottom-1 right-1 text-xs text-gray-400">
              {width} × {height} mm
            </div>
          </div>
        </div>
      </div>
      
      {/* Properties and Tools Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white shadow rounded-md p-6 h-full">
          {/* Basic Template Properties */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Template Properties</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Title
                </label>
                <input
                  type="text"
                  value={editableTemplate.title}
                  onChange={(e) => updateTemplateState({ title: e.target.value })}
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
                  value={editableTemplate.dimensions}
                  onChange={(e) => updateTemplateState({ dimensions: e.target.value })}
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
                  value={editableTemplate.fileNaming}
                  onChange={(e) => updateTemplateState({ fileNaming: e.target.value })}
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
                  Upload a PNG or JPG for the certificate background.
                </p>
                <div className="mt-2 flex flex-col items-center">
                  <div className="h-40 w-full bg-gray-100 border rounded flex items-center justify-center mb-3">
                    {editableTemplate.baseTemplate ? (
                      <img src={editableTemplate.baseTemplate} alt="Template preview" className="max-h-full" />
                    ) : (
                      <div className="text-gray-400">No template background</div>
                    )}
                  </div>
                  <label className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    {isUploading ? 'Uploading...' : 'Upload background'} 
                    <input
                      type="file"
                      accept=".png, .jpg, .jpeg"
                      onChange={handleBackgroundUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Selected Item Properties */}
          {selectedLabel && (
            <div className="mb-6 border-t pt-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Label Properties</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text
                  </label>
                  <input
                    type="text"
                    value={selectedLabel.text}
                    onChange={(e) => updateSelectedLabel({ text: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    disabled={selectedLabel.isDynamic}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      X Position (mm)
                    </label>
                    <input
                      type="number"
                      value={selectedLabel.x}
                      onChange={(e) => updateSelectedLabel({ x: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      step="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Y Position (mm)
                    </label>
                    <input
                      type="number"
                      value={selectedLabel.y}
                      onChange={(e) => updateSelectedLabel({ y: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      step="1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Family
                  </label>
                  <select
                    value={selectedLabel.fontFamily}
                    onChange={(e) => updateSelectedLabel({ fontFamily: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size (pt)
                    </label>
                    <input
                      type="number"
                      value={selectedLabel.fontSize}
                      onChange={(e) => updateSelectedLabel({ fontSize: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      min="6"
                      max="72"
                      step="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Color
                    </label>
                    <input
                      type="color"
                      value={selectedLabel.fontColor}
                      onChange={(e) => updateSelectedLabel({ fontColor: e.target.value })}
                      className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm p-1 border"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isBold"
                      checked={selectedLabel.isBold}
                      onChange={(e) => updateSelectedLabel({ isBold: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
                    />
                    <label htmlFor="isBold" className="text-sm font-medium text-gray-700">
                      Bold
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isItalic"
                      checked={selectedLabel.isItalic}
                      onChange={(e) => updateSelectedLabel({ isItalic: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
                    />
                    <label htmlFor="isItalic" className="text-sm font-medium text-gray-700">
                      Italic
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alignment
                  </label>
                  <select
                    value={selectedLabel.alignment}
                    onChange={(e) => updateSelectedLabel({ alignment: e.target.value as 'left' | 'center' | 'right' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDynamic"
                    checked={selectedLabel.isDynamic}
                    onChange={(e) => updateSelectedLabel({ 
                      isDynamic: e.target.checked,
                      text: e.target.checked ? (selectedLabel.datasetField ? `{{${selectedLabel.datasetField}}}` : '{{field}}') : 'Static Text'
                    })}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
                  />
                  <label htmlFor="isDynamic" className="text-sm font-medium text-gray-700">
                    Dynamic Field
                  </label>
                </div>
                
                {selectedLabel.isDynamic && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dataset Field
                    </label>
                    <select
                      value={selectedLabel.datasetField || ''}
                      onChange={(e) => updateSelectedLabel({ 
                        datasetField: e.target.value,
                        text: `{{${e.target.value}}}`
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    >
                      <option value="">Select a field</option>
                      {datasetFields.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {selectedImage && (
            <div className="mb-6 border-t pt-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Image Properties</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      X Position (mm)
                    </label>
                    <input
                      type="number"
                      value={selectedImage.x}
                      onChange={(e) => updateSelectedImage({ x: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      step="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Y Position (mm)
                    </label>
                    <input
                      type="number"
                      value={selectedImage.y}
                      onChange={(e) => updateSelectedImage({ y: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      step="1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width (mm)
                    </label>
                    <input
                      type="number"
                      value={selectedImage.width}
                      onChange={(e) => updateSelectedImage({ width: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      min="10"
                      step="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (mm)
                    </label>
                    <input
                      type="number"
                      value={selectedImage.height}
                      onChange={(e) => updateSelectedImage({ height: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      min="10"
                      step="1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rotation
                  </label>
                  <div className="flex items-center justify-between">
                    <input
                      type="number"
                      value={selectedImage.rotation || 0}
                      onChange={(e) => updateSelectedImage({ rotation: Number(e.target.value) })}
                      className="w-24 rounded-md border-gray-300 shadow-sm p-2 border"
                      min="0"
                      max="359"
                      step="1"
                    />
                    <div className="flex">
                      <button
                        type="button"
                        onClick={rotateSelectedImage}
                        className="bg-indigo-100 text-indigo-700 p-2 rounded ml-2"
                        title="Rotate 90° clockwise"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <path d="M21 2v6h-6"></path>
                          <path d="M21 13a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                          <path d="M21 8a9 9 0 0 0-9-9"></path>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSelectedImage({ rotation: 0 })}
                        className="bg-gray-100 text-gray-700 p-2 rounded ml-2"
                        title="Reset rotation"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <path d="M3 2v6h6"></path>
                          <path d="M21 12A9 9 0 0 0 3.86 8"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Replace Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      setIsUploading(true);
                      
                      try {
                        const result = await uploadFile(file, 'images');
                        
                        if (result.error) {
                          throw result.error;
                        }
                        
                        updateSelectedImage({ url: result.url });
                        
                        toast({
                          title: 'Upload successful',
                          description: 'Image has been replaced',
                        });
                      } catch (error) {
                        console.error('Error uploading file:', error);
                        toast({
                          title: 'Upload failed',
                          description: 'Failed to replace image',
                          variant: 'destructive',
                        });
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Dataset Selection */}
          <div className="mb-6 border-t pt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Dataset Fields</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Dataset for Preview
                </label>
                <select
                  value={selectedDataset?.id || ''}
                  onChange={(e) => {
                    const datasetId = e.target.value;
                    const dataset = datasets.find(d => d.id === datasetId) || null;
                    setSelectedDataset(dataset);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                >
                  <option value="">No dataset</option>
                  {datasets.map(dataset => (
                    <option key={dataset.id} value={dataset.id}>{dataset.title}</option>
                  ))}
                </select>
              </div>
              
              {datasetFields.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Available Fields</h3>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                    {datasetFields.map(field => (
                      <div 
                        key={field}
                        className="text-sm py-1 px-2 bg-indigo-50 rounded mb-1 cursor-pointer hover:bg-indigo-100"
                        onClick={() => addDynamicLabel(field)}
                      >
                        {field}
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Click a field to add it as a dynamic label
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300"
            >
              {isSaving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}