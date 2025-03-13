'use client';

import { useState } from 'react';
import { Label } from '@/types';

interface TemplateLabelsProps {
  labels: Label[];
  onAddLabel: (label: Label) => void;
  onUpdateLabel: (index: number, label: Label) => void;
  onRemoveLabel: (index: number) => void;
}

export default function TemplateLabels({
  labels,
  onAddLabel,
  onUpdateLabel,
  onRemoveLabel,
}: TemplateLabelsProps) {
  const [text, setText] = useState('');
  const [x, setX] = useState('100');
  const [y, setY] = useState('100');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('14');
  const [fontColor, setFontColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [isDynamic, setIsDynamic] = useState(false);
  const [datasetField, setDatasetField] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!text) {
      alert('Text is required');
      return;
    }
    
    if (isDynamic && !datasetField) {
      alert('Dataset field is required for dynamic labels');
      return;
    }
    
    const newLabel: Label = {
      id: editingIndex !== null ? labels[editingIndex].id : Math.random().toString(),
      text,
      x: parseFloat(x),
      y: parseFloat(y),
      fontFamily,
      fontSize: parseFloat(fontSize),
      fontColor,
      isBold,
      isItalic,
      alignment,
      isDynamic,
      datasetField: isDynamic ? datasetField : undefined,
    };
    
    if (editingIndex !== null) {
      onUpdateLabel(editingIndex, newLabel);
      setEditingIndex(null);
    } else {
      onAddLabel(newLabel);
    }
    
    // Reset form
    setText('');
    setX('100');
    setY('100');
    setFontFamily('Arial');
    setFontSize('14');
    setFontColor('#000000');
    setIsBold(false);
    setIsItalic(false);
    setAlignment('left');
    setIsDynamic(false);
    setDatasetField('');
  };
  
  const handleEdit = (index: number) => {
    const label = labels[index];
    setText(label.text);
    setX(label.x.toString());
    setY(label.y.toString());
    setFontFamily(label.fontFamily);
    setFontSize(label.fontSize.toString());
    setFontColor(label.fontColor);
    setIsBold(label.isBold);
    setIsItalic(label.isItalic);
    setAlignment(label.alignment);
    setIsDynamic(label.isDynamic || false);
    setDatasetField(label.datasetField || '');
    setEditingIndex(index);
  };
  
  const handleCancel = () => {
    // Reset form
    setText('');
    setX('100');
    setY('100');
    setFontFamily('Arial');
    setFontSize('14');
    setFontColor('#000000');
    setIsBold(false);
    setIsItalic(false);
    setAlignment('left');
    setIsDynamic(false);
    setDatasetField('');
    setEditingIndex(null);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700">
              Text
            </label>
            <input
              type="text"
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
              placeholder={isDynamic ? "Placeholder text (optional)" : "Enter text"}
            />
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
          
          <div>
            <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700">
              Font Family
            </label>
            <select
              id="fontFamily"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Tahoma">Tahoma</option>
            </select>
          </div>
          
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700">
                Font Size (pt)
              </label>
              <input
                type="number"
                id="fontSize"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
                min="6"
                max="72"
                step="1"
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="fontColor" className="block text-sm font-medium text-gray-700">
                Font Color
              </label>
              <input
                type="color"
                id="fontColor"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="mt-1 block w-full h-9 rounded-md border-gray-300 shadow-sm border focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Font Style
            </label>
            <div className="mt-1 flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={isBold}
                  onChange={(e) => setIsBold(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Bold</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={isItalic}
                  onChange={(e) => setIsItalic(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Italic</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Text Alignment
            </label>
            <div className="mt-1 flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={alignment === 'left'}
                  onChange={() => setAlignment('left')}
                  className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Left</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={alignment === 'center'}
                  onChange={() => setAlignment('center')}
                  className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Center</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={alignment === 'right'}
                  onChange={() => setAlignment('right')}
                  className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Right</span>
              </label>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Dynamic Content
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="checkbox"
                checked={isDynamic}
                onChange={(e) => setIsDynamic(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                This label will be populated from dataset
              </span>
            </div>
          </div>
          
          {isDynamic && (
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="datasetField" className="block text-sm font-medium text-gray-700">
                Dataset Field
              </label>
              <input
                type="text"
                id="datasetField"
                value={datasetField}
                onChange={(e) => setDatasetField(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., name, email, date"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the field name from your dataset that will populate this label.
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex space-x-2">
          {editingIndex !== null ? (
            <>
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Update Label
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
              Add Label
            </button>
          )}
        </div>
      </form>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Labels ({labels.length})</h3>
        {labels.length > 0 ? (
          <ul className="border rounded divide-y overflow-hidden">
            {labels.map((label, index) => (
              <li key={label.id} className="px-4 py-3 bg-white hover:bg-gray-50 flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    {label.isDynamic ? (
                      <>
                        <span className="text-indigo-600">{`{{${label.datasetField}}}`}</span>
                        {label.text && <span className="text-gray-400 ml-2">({label.text})</span>}
                      </>
                    ) : (
                      label.text
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {`Position: (${label.x}mm, ${label.y}mm) • ${label.fontFamily}, ${label.fontSize}pt, ${label.alignment}`}
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
                    onClick={() => onRemoveLabel(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">No labels added yet</p>
        )}
      </div>
    </div>
  );
}