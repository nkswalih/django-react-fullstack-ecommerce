import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/apiService";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      toast.success("If account exists, reset link sent!");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-[40px] overflow-hidden">

        {/* LEFT SAME DESIGN */}
        <div className="hidden md:flex md:w-1/2 bg-[#1a1a1a] p-12 flex-col justify-between relative">
          <div>
            <p className="text-gray-400 text-sm mb-20">
              Reset access to your account securely.
            </p>
            <h1 className="text-white text-6xl font-bold leading-tight">
              Forgot <br /> Password?
            </h1>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col">
          <div className="flex justify-between items-center mb-16">
            <img src="/Echoo-transparent.png" className="h-8" />
            <Link to="/sign_in" className="flex items-center gap-1 text-sm">
              Back
              <div className="bg-gray-100 p-1 rounded-full">
                <ArrowUpRightIcon className="size-3" />
              </div>
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <h2 className="text-4xl font-bold mb-8">Forgot Password</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              />

              <button
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white rounded-full text-base font-semibold hover:from-gray-400 hover:to-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? "Sending..." : "Send Reset Link"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}