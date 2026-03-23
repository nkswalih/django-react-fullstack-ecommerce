import { ArrowUpRightIcon, EyeSlashIcon, EyeIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { clearAuth, register as registerApi, saveAuth } from "../../api/apiService";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", terms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.terms) { toast.error("Please accept the Terms & Conditions"); return; }
    setLoading(true);

    try {
      clearAuth();
      const res = await registerApi({       // POST /api/register/
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      const { user, tokens } = res.data;

      saveAuth(tokens, user);;

      login(user);

      toast.success(`Welcome to EchOo, ${user.name}!`);
      navigate("/");

    } catch (error) {
      clearAuth();
      const errors = error.response?.data;
      if (errors?.email) toast.error(`Email: ${errors.email[0]}`);
      else if (errors?.password) toast.error(`Password: ${errors.password[0]}`);
      else if (errors?.detail) toast.error(errors.detail);
      else if (errors?.non_field_errors?.[0]) toast.error(errors.non_field_errors[0]);
      else toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-[40px] overflow-hidden min-h-[650px]">

        {/* Left branding — unchanged */}
        <div className="hidden md:flex md:w-1/2 bg-[#1a1a1a] p-12 flex-col justify-between relative overflow-hidden">
          <div className="z-10">
            <p className="text-gray-400 text-sm mb-20">Join the EchOo community – start your journey today.</p>
            <h1 className="text-white text-6xl font-bold leading-tight tracking-tight max-w-xs">
              Create <br /> your account
            </h1>
          </div>
          <div className="absolute bottom-0 right-0 w-3/4 translate-y-20 translate-x-10 opacity-40">
            <div className="w-full aspect-[9/16] bg-gradient-to-tr from-neutral-800 to-neutral-700 rounded-t-[40px] border-t border-l border-neutral-600 shadow-2xl"></div>
          </div>
          <div className="z-10 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-[10px] text-gray-400">©</div>
            <span className="text-gray-500 text-xs">2025-2026 EchOo Inc.</span>
          </div>
        </div>

        {/* Right form */}
        <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col relative">
          <div className="flex justify-between items-center mb-10">
            <img alt="EchOo." src="/Echoo-transparent.png" className="h-8 w-auto" />
            <Link to="/sign_in" className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
              Sign In
              <div className="bg-gray-100 p-1 rounded-full ml-1"><ArrowUpRightIcon className="size-3" /></div>
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Sign Up</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name" type="text" required placeholder="Full Name"
                value={formData.name} onChange={handleChange}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              />
              <input
                name="email" type="email" required placeholder="Email Address"
                value={formData.email} onChange={handleChange}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              />
              <div className="relative">
                <input
                  name="password" type={showPassword ? "text" : "password"} required
                  placeholder="Password (min 6 characters)"
                  value={formData.password} onChange={handleChange}
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeIcon className="size-5" /> : <EyeSlashIcon className="size-5" />}
                </button>
              </div>

              <div className="flex items-start gap-3 py-2">
                <input id="terms" name="terms" type="checkbox"
                  className="h-5 w-5 mt-0.5 accent-black border-gray-300 rounded-md"
                  onChange={handleChange} checked={formData.terms} />
                <label htmlFor="terms" className="text-sm text-gray-500 leading-tight">
                  I agree to the <Link to="/terms_conditions" className="text-gray-900 font-medium hover:underline">Terms & Conditions</Link> and Privacy Policy.
                </label>
              </div>

              <div className="pt-4">
                <button type="submit"
                  disabled={!formData.name || !formData.email || !formData.password || !formData.terms || loading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white rounded-full text-base font-semibold hover:from-gray-400 hover:to-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="translate-x-3">{loading ? "Creating account..." : "Create account"}</span>
                  <div className="ml-auto bg-white/20 p-1 rounded-full"><ArrowUpRightIcon className="size-4" /></div>
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
