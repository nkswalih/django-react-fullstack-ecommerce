import { ArrowUpRightIcon, EyeSlashIcon, EyeIcon } from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { login as loginApi, googleLogin as googleLoginApi } from "../../api/apiService";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle Google OAuth redirect (Google returns with ?code=xxx&scope=...&authuser=...)
  useEffect(() => {
    const code = searchParams.get("code");
    const scope = searchParams.get("scope");
    // Only treat this as a redirect callback if we have an auth code
    if (code) {
      const handleRedirect = async () => {
        setLoading(true);
        try {
          const res = await googleLoginApi({
            code,
            redirect_uri: window.location.origin + "/sign_in",
          });
          const { user } = res.data;
          login(user);
          toast.success(`Welcome, ${user.name}!`);
          navigate(user.role === "Admin" ? "/admin" : "/");
        } catch (error) {
          const msg = error.response?.data?.detail || "Google login failed.";
          toast.error(msg);
          // Clean URL and stay on sign_in
          navigate("/sign_in", { replace: true });
        } finally {
          setLoading(false);
        }
      };
      handleRedirect();
    }
  }, [searchParams]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth — avoids popup COOP issues entirely
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    const redirectUri = encodeURIComponent(window.location.origin + "/sign_in");
    const scope = encodeURIComponent("openid email profile");
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account`;
    window.location.href = url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginApi({
         email: formData.email,
         password: formData.password,
         remember: formData.rememberMe,
        });

      const { user } = res.data;

      if (formData.rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      login(user);
      toast.success(`Welcome back, ${user.name}!`, {
        style: { width: "360px" },
      });
      navigate(user.role === "Admin" ? "/admin" : "/");
    } catch (error) {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-[40px] overflow-hidden min-h-[650px]">

        {/* Left branding */}
        <div className="hidden md:flex md:w-1/2 bg-[#1a1a1a] p-12 flex-col justify-between relative overflow-hidden">
          <div className="z-10">
            <p className="text-gray-400 text-sm mb-20">Join the EchOo community – start your journey today.</p>
            <h1 className="text-white text-6xl font-bold leading-tight tracking-tight max-w-xs">
              Login to <br /> your account
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
          <div className="flex justify-between items-center mb-16">
            <img alt="EchOo." src="/Echoo-transparent.png" className="h-8 w-auto" />
            <Link to="/sign_up" className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
              Sign Up
              <div className="bg-gray-100 p-1 rounded-full"><ArrowUpRightIcon className="size-3" /></div>
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Sign In</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                name="email" type="email" required
                placeholder="Email Address"
                value={formData.email} onChange={handleChange}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              />

              <div className="relative">
                <input
                  name="password" type={showPassword ? "text" : "password"} required
                  placeholder="Password"
                  value={formData.password} onChange={handleChange}
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeIcon className="size-5" /> : <EyeSlashIcon className="size-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" name="rememberMe" checked={formData.rememberMe}
                    onChange={handleChange} className="accent-black" />
                  Remember me
                </label>
                <button type="button" className="text-sm font-medium text-gray-900 hover:underline">
                  Forgot password?
                </button>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={!formData.email || !formData.password || loading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white rounded-full text-base font-semibold hover:from-gray-400 hover:to-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="translate-x-3">{loading ? "Signing in..." : "Sign In"}</span>
                  <div className="ml-auto bg-white/20 p-1 rounded-full"><ArrowUpRightIcon className="size-4" /></div>
                </button>
                 {/* --- GOOGLE LOGIN SECTION --- */}
                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm font-light">Or login with</span>
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
                {/* --- END GOOGLE LOGIN --- */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
