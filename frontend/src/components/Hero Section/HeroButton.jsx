import React from "react";
import { useNavigate } from "react-router-dom";

const HeroButtons = () => {
  const navigate = useNavigate();
  const handleShop = () => {
    navigate(`/apple`);
  };
  const handleExplore = () => {
    navigate(`/store`);
  };
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
      <div className="relative group isolate p-0.5 rounded-full">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full blur-xl bg-[conic-gradient(from_0deg,#0a84ff,#5e5ce6,#bf5af2,#ff2d55,#0a84ff)] opacity-60 group-hover:opacity-100 transition-opacity duration-900 animate-[spin_5s_linear_infinite]"

        ></div>
        <button
          onClick={handleShop}
          className="cursor-target relative shadow-xl border-2 border-gray-100/30 text-white px-8 py-3 rounded-full font-poppins font-light text-sm sm:text-base hover:bg-white/30 transition-all duration-300 active:scale-95"
        >
          Shop Latest
        </button>
      </div>
      <button
        onClick={handleExplore}
        className="cursor-target px-8 py-3 rounded-full font-poppins shadow-xl font-light text-sm sm:text-base border-2 border-gray-100/30 text-white hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300 active:scale-95"
      >
        Explore Products
      </button>
    </div>
  );
};

export default HeroButtons;
