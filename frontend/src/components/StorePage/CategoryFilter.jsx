import React from 'react';

const CategoryFilter = ({ categories, activeCategory, setActiveCategory }) => {
  // Category images mapping with clean PNG images
  const categoryImages = {
    'all': 'src/assets/images/categories/store-card-13-mac-nav-202510-Picsart-AiImageEnhancer-removebg-preview.png',
    'smartphone': 'src/assets/images/categories/Apple-iPhone-17-Pro-Max-Illustration-PNG.png',
    'laptop': 'src/assets/images/categories/pngfind.com-gaming-png-261331.png',
    'accessory': 'src/assets/images/categories/Accessoies_kit1-removebg-preview.png'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex overflow-x-auto gap-12 pb-2 pt-2 scrollbar-hide justify-center">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex flex-col items-center text-center group transition-all duration-300 ${
              activeCategory === category.id 
                ? 'text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            
            <div className="relative mb-3 transition-all duration-300">
              <img
                src={categoryImages[category.id] || categoryImages['all']}
                alt={category.name}
                className={`w-16 h-16 object-contain filter transition-all duration-300 ${
                  activeCategory === category.id 
                    ? 'grayscale-0 brightness-100 scale-110 drop-shadow-lg' 
                    : 'grayscale-50 brightness-90 hover:grayscale-0 hover:brightness-100 hover:scale-105 hover:drop-shadow-md'
                }`}
              />
            </div>
            {/* Category Name */}
            <span className={`font-semibold text-sm transition-all duration-300 ${
              activeCategory === category.id 
                ? 'text-gray-900 ' 
                : 'text-gray-600 hover:text-gray-900'
            }`}>
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;