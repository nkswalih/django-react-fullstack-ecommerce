import { ArrowUpRightIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import SimpleFooter from "../../components/SimpleFoot";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");

    if (savedEmail && savedPassword) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        password: savedPassword,
        rememberMe: true,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Get all users from json
      const response = await axios.get("http://localhost:3000/users");
      const users = response.data;

      // Finding user with matched email and password
      const user = users.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        // Check if user is active
        if (user.status !== "Active") {
          toast.error("Account is not active");
          return;
        }

        // Store data into localStorage if remember me checked
        if (formData.rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
          localStorage.setItem("rememberedPassword", formData.password);
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }

        // Store current session
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Login with FULL user data including role
        login({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // Add role here
          status: user.status,
        });

        toast.success(`Login successful! Welcome ${user.name}!`);

        // Redirect based on role
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      console.log("Login error:", error);
      toast.error("Login Failed. Please try again.");
    }
  };
  const isSubmitDisable = !formData.email || !formData.password;

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-4 lg:p-4">
      {/* Main Container */}
      <div className="bg-white w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-[40px] overflow-hidden min-h-[650px]">

        {/* Left Side: Dark Branding Section */}
        <div className="hidden md:flex md:w-1/2 bg-[#1a1a1a] p-12 flex-col justify-between relative overflow-hidden">
          <div className="z-10">
            <p className="text-gray-400 text-sm mb-20">Join the EchOo community – start your journey today.</p>
            <h1 className="text-white text-6xl font-bold leading-tight tracking-tight max-w-xs">
              Login to <br /> your account
            </h1>
          </div>

          {/* This is where your phone/graphic would go */}
          <div className="absolute bottom-0 right-0 w-3/4 translate-y-20 translate-x-10 opacity-40">
            {/* <img src="/path-to-your-phone-image.png" alt="Phone App" /> */}
            <div className="w-full aspect-[9/16] bg-gradient-to-tr from-neutral-800 to-neutral-700 rounded-t-[40px] border-t border-l border-neutral-600 shadow-2xl"></div>
          </div>

          <div className="z-10 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-[10px] text-gray-400">
              ©
            </div>
            <span className="text-gray-500 text-xs">2025-2026 EchOo Inc.</span>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col relative">

          {/* Top Header inside Form */}
          <div className="flex justify-between items-center mb-16">
            <img
              alt="EchOo."
              src="/src/assets/images/Echoo-transparent.png"
              className="h-8 w-auto"
            />
            <Link
              to="/sign_up"
              className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
            >
              Sign Up
              <div className="bg-gray-100 p-1 rounded-full">
                <ArrowUpRightIcon className="size-3" />
              </div>
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Sign In</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Email or Username"
                  onChange={handleChange}
                  value={formData.email}
                />
              </div>

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
                <button type="button" className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeSlashIcon className="size-5" />
                </button>
              </div>

              <div className="flex items-center justify-start">
                <button type="button" className="text-sm font-medium text-gray-900 hover:underline">
                  Forgot password?
                </button>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitDisable}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white rounded-full text-base font-semibold hover:from-gray-400 hover:to-gray-700 transition-all hover:shadow-xl disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none disabled:ring-0 disabled:cursor-not-allowed"
                >
                  <span className="translate-x-3">Sign In</span>
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

export default Login;
