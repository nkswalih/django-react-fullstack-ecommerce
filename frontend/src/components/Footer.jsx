import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Instagram, Linkedin, Twitter, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
      className="bg-[#0f0f11] text-neutral-300 py-16 px-6 sm:px-10 lg:px-16 rounded-t-[3rem] relative overflow-hidden font-sans border-t border-white/5 shadow-[0_[-20px]_50px_rgba(0,0,0,0.5)]"
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Main Grid structure like the reference image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/10">
          
          {/* Left Section: Logo & Newsletter */}
          <div className="lg:col-span-5 flex flex-col justify-between pr-0 lg:pr-12">
            <div>
                <Link to="/" className="flex items-center gap-3 mb-8">
                  <img
                    alt="EchOo."
                    src="/Echoo-transparent.png"
                    className="h-8 w-auto filter invert opacity-90"
                  />
                  <span className="text-2xl font-semibold tracking-tight text-white">echOo</span>
                </Link>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-neutral-200 leading-[1.15] mb-12 max-w-sm">
                  Imaginative minds<br/>for imaginative brands.
                </h2>
            </div>
            
            {/* Newsletter Input */}
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-4 tracking-wide">Subscribe to our newsletter</p>
              <div className="relative max-w-sm">
                <input
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-14 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-b from-gray-600 to-gray-800 shadow-md border border-white/10 flex items-center justify-center text-white hover:scale-105 transition-transform">
                  <ArrowUpRight strokeWidth={2.5} size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Section: Links & Socials */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row justify-between pt-4 lg:pt-0 gap-12 lg:gap-0 lg:pl-12 lg:border-l lg:border-white/10">
            
            {/* Links Columns */}
            <div className="grid grid-cols-2 gap-x-12 sm:gap-x-24 gap-y-6 text-base font-medium text-neutral-400">
              <div className="flex flex-col gap-5">
                <Link to="/support" className="hover:text-white transition-colors">Our Support +</Link>
                <Link to="https://nkswalih.vercel.app/#projects" className="hover:text-white transition-colors">Projects</Link>
                <Link to="https://nkswalih.vercel.app/#about" className="hover:text-white transition-colors">About Dev</Link>
                <Link to="https://nkswalih.vercel.app/" className="hover:text-white transition-colors">Portfolio</Link>
              </div>
              <div className="flex flex-col gap-5">
                <Link to="/Store" className="hover:text-white transition-colors">Store</Link>
                <Link to="/Apple" className="hover:text-white transition-colors">Apple</Link>
                <Link to="/Laptop" className="hover:text-white transition-colors">Laptop</Link>
                <Link to="/Accessories" className="hover:text-white transition-colors">Accessories</Link>
              </div>
            </div>

            {/* Social Icons (Vertical like the reference) */}
            <div className="flex sm:flex-col gap-4 sm:border-l sm:border-white/10 sm:pl-12">
              <a href="https://x.com/swwaliih?s=21" className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Twitter size={18} strokeWidth={2} />
              </a>
              <a href="#" className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Instagram size={18} strokeWidth={2} />
              </a>
              <a href="https://www.linkedin.com/in/mohammedswalihnk/" className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Linkedin size={18} strokeWidth={2} />
              </a>
              <a href="https://github.com/nkswalih" className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Github size={18} strokeWidth={2} />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-neutral-500 tracking-wide">
          <p>© {new Date().getFullYear()} EchOo Studio. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-neutral-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-neutral-300 transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </motion.footer>
  );
};

export default Footer;