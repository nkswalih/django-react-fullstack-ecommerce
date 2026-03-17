import React from 'react';

const ProductFeatures = ({ features }) => {
  if (!features || features.length === 0) return null;

  return (
    <div className="border-t border-gray-200 pt-8">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Key Features</h3>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductFeatures;