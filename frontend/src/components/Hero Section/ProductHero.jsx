import React from "react";
import { useNavigate } from "react-router-dom";

const ProductHero = () => {
const Navigate = useNavigate();


  return (
    <section className="relative bg-black overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="src/assets/images/imgi_2_hero_iphone_air__0gxyavihpiqu_large.jpg"
          alt="iPhone Air"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-black max-w-4xl mx-auto px-6 pt-12 pb-96">
        {/* Main Heading */}
        <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-2 tracking-tight">
          iPhone Air
        </h1>

        {/* Subheading */}
        <div className="mb-6">
          <p className="text-xl md:text-2xl lg:text-3xl font-light tracking-wide">
            The thinnest iPhone ever.
          </p>
          <p className="text-xl md:text-2xl lg:text-3xl font-light tracking-wide">
            With the power of pro inside.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
          onClick={() => Navigate("/apple")}
          className="bg-blue-500 text-white px-6 py-2 rounded-full font-normal text-base hover:bg-blue-600 transition-all duration-300">
            Learn more
          </button>
          <button 
          onClick={() => Navigate("/product/iphone-air")}
          className="text-blue-400 border border-blue-400 text-base font-normal px-6 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300">
            Buy
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductHero;