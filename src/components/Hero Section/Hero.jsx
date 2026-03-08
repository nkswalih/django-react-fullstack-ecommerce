import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Facebook, Instagram, Dribbble, Quote } from 'lucide-react';
import Overlay from '../ui/Overlay';

const MainHero = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/products');
        // Get 4 random or top popular products (for this demo, we take first 4)
        if (response.data && response.data.length > 0) {
          setFeaturedProducts(response.data.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Handlers
  const handleFeaturedClick = (id) => {
    navigate(`/product/${id}`);
  };

  const handleShopNowClick = () => {
    navigate('/store');
  };

  return (
    <div className="bg-gradient-to-b from-[#63f7c8] via-[#cceaf7] to-[#f0f2f5] min-h-screen text-gray-900 font-sans relative">
      <Overlay className="z-0 opacity-40 pointer-events-none" />

      {/* Hero Section Container with extra top padding for nav gap */}
      <section className="relative pt-32 md:pt-48 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center overflow-hidden min-h-[90vh]">
        
        {/* Giant Background Text utilizing modern Anton font */}
        <div className="absolute top-20 md:top-36 left-0 right-0 z-0 flex justify-center w-full overflow-hidden pointer-events-none uppercase">
          <h1 className="text-[13vw] font-normal tracking-normal text-[#0f172a] leading-none select-none" style={{ fontFamily: '"Anton", sans-serif', transform: 'scaleY(1.15)' }}>
            AESTHETIC UNBOUND
          </h1>
        </div>

        {/* Central Layout Container */}
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center mt-20 md:mt-24">
            
            {/* Left Box (Small Image block from mockup) */}
            <div className="hidden md:flex flex-col bg-white/30 backdrop-blur-md p-3 rounded-3xl shadow-lg border border-white/50 relative hover:-translate-y-2 transition-transform duration-300">
                <div className="w-28 h-28 bg-gradient-to-br from-[#d4faeb] to-[#bcf8e2] rounded-2xl flex items-center justify-center overflow-hidden relative">
                   <img src="https://cdn.sanity.io/images/gtd4w1cq/production/892ca1fee54f0c221d55289e8072c84df0537aa2-396x396.jpg?auto=format" alt="Earbud" className="w-[85%] h-[85%] object-cover mix-blend-multiply" />
                   <button className="absolute inset-0 m-auto w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transform transition-transform hover:scale-110">
                       <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                   </button>
                </div>
            </div>

            {/* Central Headphone Image */}
            <div className="relative z-20 flex-1 flex justify-center items-center mt-[-60px] md:mt-[-100px]">
                <img 
                    src="https://cdn.shopify.com/s/files/1/0586/3270/0077/files/0000s_0021_Headphone1-white.png?v=1753757251" 
                    alt="Nothing Headphone" 
                    className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] object-contain drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
                />
                
                {/* Action Button Overlapping Image */}
                 <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md rounded-[2rem] pr-2 pl-6 py-2 flex items-center gap-4 shadow-xl border border-white/50 whitespace-nowrap z-30">
                    <span className="text-sm font-bold tracking-wide text-gray-800">Shop Now</span>
                    <button onClick={handleShopNowClick} className="w-10 h-10 rounded-full bg-[#cdf54c] shadow-sm flex items-center justify-center hover:scale-105 transition-transform text-black">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {/* Right Socials & Quote Box */}
            <div className="hidden md:flex flex-col gap-10 w-64 items-end">
                {/* Social Icons list with proper SVG icons */}
                <div className="flex gap-3 justify-end">
                    <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-black hover:scale-110 transition-all">
                        <Dribbble size={18} strokeWidth={2} />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-black hover:scale-110 transition-all">
                        <Facebook size={18} strokeWidth={2} />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition-all group">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 group-hover:text-black transition-colors"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.15H5.059z" /></svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-black hover:scale-110 transition-all">
                        <Instagram size={18} strokeWidth={2} />
                    </a>
                </div>

                {/* Quote Text */}
                 <div className="text-left mt-6 max-w-[180px] flex flex-col items-start mr-4">
                    <Quote size={28} className="text-[#0c9464] mb-3 fill-current opacity-60 transform scale-x-[-1]" />
                    <p className="text-[13px] font-medium text-[#1e293b] leading-relaxed">Perfect blend of cutting-edge technology and craftsmanship.</p>
                </div>
            </div>
        </div>

        {/* Bottom Text and Info section */}
        <div className="relative z-10 w-full mt-24 flex flex-col lg:flex-row gap-12 justify-between items-start lg:items-center">
            
            {/* Left Mission Text */}
            <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-gray-900 leading-tight mb-8">
                    We believe in transforming<br/>ideas into digital experiences
                </h2>
                
                <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300 inline-block">Our mission</h3>
                
                <div className="flex flex-col sm:flex-row gap-8 mt-4">
                    <div className="flex-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#d4df31] to-[#b3be28] shadow-md flex items-center justify-center mb-4">
                             <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Transforming Of<br/>Digital Product</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">we aim to enable businesses to thrive online by delivering tailored web development that lead to measurable results</p>
                    </div>
                    
                    <div className="flex-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#8ab4f8] to-[#4285f4] shadow-md flex items-center justify-center mb-4">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Empowering<br/>digital growth</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">we aim to enable businesses to thrive online by delivering tailored web development that lead to measurable results</p>
                    </div>
                </div>
            </div>

            {/* Right VR Image Box */}
             <div className="lg:w-1/3 w-full bg-[#f4f4f4] rounded-3xl overflow-hidden p-6 flex items-center justify-center relative">
                 <img src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/vision-pro-hero-202401?wid=932&hei=932&fmt=jpeg&qlt=90&.v=1704255018659" alt="VR Headset user" className="w-full h-auto object-cover rounded-2xl mix-blend-multiply" />
             </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16 px-4 max-w-7xl mx-auto border-t border-gray-200 mt-10">
            <div className="flex flex-col items-center mb-12">
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">Our Best Popular</h2>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">Product</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {featuredProducts.map((product) => (
                    <div key={product.id} className="group relative bg-white/40 backdrop-blur-sm border border-gray-200 rounded-[2rem] p-6 hover:shadow-xl transition-all duration-300 flex flex-col">
                        
                        {/* Favorite Button */}
                        <div className="absolute top-4 right-4 z-10">
                            <button className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors border border-gray-100">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                        
                        {/* Inner gradient container replacing basic gray background */}
                        <div className="w-full h-48 bg-gradient-to-b from-[#e8eaed] to-[#f8f9fa] rounded-[1.5rem] mb-6 flex items-center justify-center p-4 relative overflow-hidden">
                            <img 
                                src={product.images?.[0] || product.productImage} 
                                alt={product.name} 
                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    // Make sure it doesn't loop infinitely
                                    e.target.src = "https://via.placeholder.com/200?text=No+Image";
                                }}
                            />
                        </div>
                        
                        <div className="mt-auto">
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-2 line-clamp-2">{product.name}</h3>
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                                <span className="text-[10px] text-gray-400 ml-1">(2836 total review)</span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-4">
                               <p className="font-bold text-gray-900">₹{product.price?.toLocaleString() || 999}</p>
                               <button 
                                 onClick={() => handleFeaturedClick(product.id)}
                                 className="w-10 h-10 rounded-full bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 flex items-center justify-center text-white hover:from-gray-400 hover:to-gray-700 transition-colors z-10"
                                >
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                               </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="flex justify-center mt-12">
                <button
                    onClick={handleShopNowClick}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white font-semibold rounded-full hover:from-gray-400 hover:to-gray-700 transition-all hover:scale-105"
                >
                    View All Products
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
            </div>
        </section>
      )}

    {/* Load Anton font from Google Fonts specifically for the hero title */}
    <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
        
        @keyframes float {
            0% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-20px);
            }
            100% {
                transform: translateY(0px);
            }
        }
    `}} />

    </div>
  );
};

export default MainHero;