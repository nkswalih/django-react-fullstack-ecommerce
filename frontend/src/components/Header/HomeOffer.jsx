import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomeOffer() {
  return (
    <div className=" bg-white">
      {/* Apple-style Promo Bar */}
      <div className="bg-white text-black ">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-2.5 text-sm">
            <p className="font-normal tracking-tight">
              Get 30% off Acer Gaming Laptop V16. 
              <Link to={'/laptop'} className="inline-flex items-center ml-1 hover:underline">
                Shop now <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}