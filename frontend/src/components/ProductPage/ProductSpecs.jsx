import React from 'react';

const ProductSpecs = ({ specs }) => {
  if (!specs) return null;

  return (
    <div className="border-t border-gray-200 pt-8 mt-8">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Specifications</h3>
      <div className="space-y-3">
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
            <span className="text-gray-900 font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSpecs;