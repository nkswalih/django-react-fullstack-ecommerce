import React from 'react';
import { Link } from 'react-router-dom';

const SimpleFooter = () => {
  return (
    <footer className="border-t border-gray-200 mt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <Link to="/" className="flex items-center">
                    <img
                      alt="EchOo."
                      src="/Echoo-transparent.png"
                      className="h-6 w-auto"
                    />
                    <span className="ml-2 text-lg font-light text-gray-600">EchOo.</span>
                  </Link>
                </div>
                <div className="flex space-x-6 text-sm text-gray-600">
                  <Link to="/store" className="hover:text-gray-900 transition-colors">Store</Link>
                  <Link to="/terms_conditions" className="hover:text-gray-900 transition-colors">Terms & Conditions</Link>
                  <Link to="/support" className="hover:text-gray-900 transition-colors">Support</Link>
                </div>
              </div>
              <div className="mt-4 text-center md:text-left">
                <p className="text-xs text-gray-500">
                  © {new Date().getFullYear()} EchOo. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
  );
};

export default SimpleFooter;