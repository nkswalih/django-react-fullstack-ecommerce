import React, { useState, useEffect } from 'react';
import Footer from '../../components/Footer';
import IphoneAir from '../../components/Hero Section/ProductHero2';
import MainHero from '../../components/Hero Section/Hero';
import AppleMac from '../../components/Hero Section/ProductHero3';
import SimpleFooter from '../../components/SimpleFoot';


const Home = () => {


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f2f5] to-[#e2e5e9] text-gray-900 font-sans">
      <MainHero />
      {/* <Overlay className=" z-50"/> */}

      <section className="py-5">
        {/* iPhone Air Section */}
        <IphoneAir />
        <AppleMac />

      </section>
      <div className='text-black'>
        <Footer />
      </div>
    </div>
  );
};

export default Home;