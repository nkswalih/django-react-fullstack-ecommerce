import { ArrowUpRightIcon, EyeSlashIcon, EyeIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { register as registerApi } from "../../api/apiService";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", terms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    const redirectUri = encodeURIComponent(window.location.origin + "/sign_in");
    const scope = encodeURIComponent("openid email profile");
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account`;
    window.location.href = url;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.terms) {
      toast.error("Please accept the Terms & Conditions");
      return;
    }
    setLoading(true);

    try {
      const res = await registerApi({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      const { user } = res.data;

      login(user);

      toast.success(`Welcome to EchOo, ${user.name}!`);
      navigate("/");
    } catch (error) {
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
      <div className="bg-white w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-[40px] overflow-hidden">
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

        <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col relative">
          <div className="flex justify-between items-center mb-10">
            <img alt="EchOo." src="/Echoo-transparent.png" className="h-8 w-auto" />
            <Link to="/sign_in" className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
              Sign In
              <div className="bg-gray-100 p-1 rounded-full ml-1">
                <ArrowUpRightIcon className="size-3" />
              </div>
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Sign Up</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                type="text"
                required
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              />
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeIcon className="size-5" /> : <EyeSlashIcon className="size-5" />}
                </button>
              </div>

              <div className="flex items-start gap-3 py-2">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 accent-black border-gray-300 rounded-md"
                  onChange={handleChange}
                  checked={formData.terms}
                />
                <label htmlFor="terms" className="text-sm text-gray-500 leading-tight">
                  I agree to the <Link to="/terms_conditions" className="text-gray-900 font-medium hover:underline">Terms & Conditions</Link> and Privacy Policy.
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!formData.name || !formData.email || !formData.password || !formData.terms || loading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white rounded-full text-base font-semibold hover:from-gray-400 hover:to-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="translate-x-3">{loading ? "Creating account..." : "Create account"}</span>
                  <div className="ml-auto bg-white/20 p-1 rounded-full">
                    <ArrowUpRightIcon className="size-4" />
                  </div>
                </button>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-sm font-light">Or sign up with</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 rounded-full text-gray-700 font-semibold text-sm shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  Google
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