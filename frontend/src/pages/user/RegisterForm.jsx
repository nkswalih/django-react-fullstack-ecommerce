import { ArrowUpRightIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SimpleFooter from "../../components/SimpleFoot";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    terms: false,
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.terms) {
      toast.success("Please accept the terms and Conditions");
      return;
    }

    try {
      const response = await axios.get("http://localhost:3000/users");
      const existingUser = response.data.find(
        (user) => user.email === formData.email
      );

      if (existingUser) {
        toast.error("User with this email already exists");
        return;
      }

      await axios.post("http://localhost:3000/users", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        terms: formData.terms,
        role: "User",
        status: "Active",
        cart: [],
        wishlist: [],
        order: [],
      });

      login({
        name: formData.name,
        email: formData.email,
      });

      navigate("/sign_in");
    } catch (error) {
      console.log("Registration Error:", error);
    }
  };

  const isSubmitDisable =
    !formData.name || !formData.email || !formData.password || !formData.terms;

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-4 lg:p-4">
      {/* Main Container with 40px rounded corners */}
      <div className="bg-white w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-[40px] overflow-hidden min-h-[650px]">
        
        {/* Left Side: Dark Branding Section */}
        <div className="hidden md:flex md:w-1/2 bg-[#1a1a1a] p-12 flex-col justify-between relative overflow-hidden">
          <div className="z-10">
            <p className="text-gray-400 text-sm mb-20">Join the EchOo community – start your journey today.</p>
            <h1 className="text-white text-6xl font-bold leading-tight tracking-tight max-w-xs">
              Create <br /> your account
            </h1>
          </div>

          {/* Visual Graphic Area */}
          <div className="absolute bottom-0 right-0 w-3/4 translate-y-20 translate-x-10 opacity-40">
             <div className="w-full aspect-[9/16] bg-gradient-to-tr from-neutral-800 to-neutral-700 rounded-t-[40px] border-t border-l border-neutral-600 shadow-2xl"></div>
          </div>

          <div className="z-10 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-[10px] text-gray-400">
                ©
            </div>
            <span className="text-gray-500 text-xs">2025-2026 EchOo Inc.</span>
          </div>
        </div>

        {/* Right Side: Form Section */}
        <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col relative">
          
          {/* Top Header inside Form */}
          <div className="flex justify-between items-center mb-10">
            <img
              alt="EchOo."
              src="/Echoo-transparent.png"
              className="h-8 w-auto"
            />
            <Link
              to="/sign_in"
              className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
            >
              Sign In
              <div className="bg-gray-100 p-1 rounded-full ml-1">
                 <ArrowUpRightIcon className="size-3" />
              </div>
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Sign Up</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Input */}
              <div className="space-y-1">
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Full Name"
                  onChange={handleChange}
                  value={formData.name}
                />
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Email Address"
                  onChange={handleChange}
                  value={formData.email}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Password"
                  onChange={handleChange}
                  value={formData.password}
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 py-2">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-5 w-5 mt-0.5 accent-black border-gray-300 rounded-md"
                  onChange={handleChange}
                  checked={formData.terms}
                />
                <label htmlFor="terms" className="text-sm text-gray-500 leading-tight">
                  I agree to the <a href="terms_conditions" className="text-gray-900 font-medium hover:underline">Terms & Conditions</a> and Privacy Policy.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitDisable}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white rounded-full text-base font-semibold hover:from-gray-400 hover:to-gray-700 transition-all hover:shadow-xl disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none disabled:ring-0 disabled:cursor-not-allowed"
                >
                  <span className="translate-x-3">Create account</span>
                  <div className="ml-auto bg-white/20 p-1 rounded-full">
                    <ArrowUpRightIcon className="size-4" />
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;