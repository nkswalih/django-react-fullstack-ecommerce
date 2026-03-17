import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

const VariantSelector = ({ type, label, options, selectedValue, onSelect }) => {
  const getColorClass = (color) => {
    const colorMap = {
      'black': 'bg-gray-900',
      'blue': 'bg-blue-500',
      'white': 'bg-white border border-gray-300',
      'gold': 'bg-amber-200',
      'green': 'bg-green-500',
      'graphite': 'bg-gray-700',
      'silver': 'bg-gray-300',
      'sky': 'bg-sky-400',
      'pink': 'bg-pink-400',
      'orange': 'bg-orange-500',
      'deep blue': 'bg-blue-700',
      'lavender': 'bg-purple-300',
      'sage': 'bg-green-300',
      'mist blue': 'bg-blue-200',
      'light gold': 'bg-amber-100',
      'teal': 'bg-teal-500'
    };
    return colorMap[color.toLowerCase()] || 'bg-gray-200';
  };

  if (type === 'color') {
    return (
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-900 mb-4">{label}</h3>
        <div className="flex gap-3">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => onSelect(option)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                selectedValue === option 
                  ? 'bg-gray-100 ring-2 ring-gray-900' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${getColorClass(option)} ring-1 ring-gray-300`} />
              <span className="text-xs text-gray-600">{option}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-900 mb-4">{label}</h3>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`p-4 border-2 rounded-xl text-left transition-all ${
              selectedValue === option 
                ? 'border-gray-900 bg-gray-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{option}</span>
              {selectedValue === option && (
                <CheckIcon className="size-4 text-gray-900" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VariantSelector;