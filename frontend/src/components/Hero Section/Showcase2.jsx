import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const IphoneAir = () => {
  const Navigate = useNavigate();

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#eef1f4] to-[#f4f6f9] py-24 my-8 mx-4 sm:mx-8 rounded-[3rem] shadow-sm border border-white/60 min-h-[850px] flex flex-col justify-start"
    >

      {/* Background with glassmorphism effects */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none">
        <div className="w-[500px] h-[500px] bg-gradient-to-br from-blue-100 to-transparent rounded-full blur-[100px]"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">

        {/* Typography using SF Pro mixed weights */}
        <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight text-gray-900 mb-2">
          iPhone <span className="font-light text-gray-500">Air</span>
        </h1>

        <div className="mt-4 mb-8 space-y-1">
          <p className="text-xl md:text-3xl font-medium tracking-tight text-gray-600">
            The thinnest iPhone ever.
          </p>
          <p className="text-xl md:text-3xl font-thin tracking-tight text-gray-500">
            With the power of pro inside.
          </p>
        </div>

        {/* Action Buttons with new grey bubble style */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center font-medium mt-2 z-20 relative">
          <button
            onClick={() => Navigate("/apple")}
            className="flex items-center gap-2 px-8 py-3 bg-white/60 backdrop-blur-md shadow-lg border border-white/80 text-gray-800 rounded-full hover:bg-white/80 transition-all hover:scale-105"
          >
            Show more
          </button>
          <button
            onClick={() => Navigate("/product/iphone-air")}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white rounded-full hover:from-gray-400 hover:to-gray-700 transition-all hover:scale-105"
          >
            Buy
          </button>
        </div>
      </div>

      {/* Floating 3D Product Image */}
      <div
        className="absolute bottom-[-120px] left-0 w-full flex justify-center z-10 pointer-events-none"
      >
        <motion.img
          src="/iphone-true.png"
          alt="iPhone Air Mockup"
          className="w-full h-auto object-contain max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[600px] drop-shadow-[0_45px_45px_rgba(0,0,0,0.3)]"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </div>

    </section>
  );
};

export default IphoneAir;