import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OfferApple() {
  return (
    <div className=" bg-gray-50">
      {/* Apple-style Promo Bar */}
      <div className="bg-gray-100 text-black">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-2.5 text-sm">
            <p className="font-normal tracking-tight">
              Get up to ₹5000 instant cashback on iPhone with eligible cards. Plus up to 6 months of No Cost EMI.
              <Link to={'/apple'} className="inline-flex items-center ml-1 hover:underline text-blue-500">
                Shop now <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}