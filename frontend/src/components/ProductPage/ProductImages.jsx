import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ProductImages = ({ product, selectedColor }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (!validImages.length) return;
    setCurrentImageIndex((prev) => 
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!validImages.length) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Filter out empty image URLs
  const validImages = product.images?.filter(img => img && img.trim() !== '') || [];

  return (
    <div className="lg:w-1/2">
      <div className="relative bg-gray-50 rounded-2xl p-8">
        {/* Main Image */}
        <div className="relative aspect-square mb-6">
          {validImages.length > 0 ? (
            <img
              src={validImages[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
          
          {/* Navigation Arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-all"
              >
                <ChevronLeftIcon className="size-5 text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-all"
              >
                <ChevronRightIcon className="size-5 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* Image Thumbnails */}
        {validImages.length > 1 && (
          <div className="flex justify-center gap-3">
            {validImages.map((image, index) => (
              <button
                key={index}
                onClick={() => selectImage(index)}
                className={`w-16 h-16 border-2 rounded-lg overflow-hidden transition-all ${
                  currentImageIndex === index 
                    ? 'border-gray-900' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImages;