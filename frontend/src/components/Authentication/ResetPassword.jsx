import { ArrowUpRightIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../../api/apiService";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const uid = params.get("uid");
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uid || !token) {
      toast.error("Invalid reset link");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ uid, token, password });
      toast.success("Password reset successful!");
      navigate("/sign_in");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-[40px] overflow-hidden">

        {/* LEFT */}
        <div className="hidden md:flex md:w-1/2 bg-[#1a1a1a] p-12 flex-col justify-between">
          <h1 className="text-white text-6xl font-bold">
            Reset <br /> Password
          </h1>
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col">
          <div className="flex justify-between items-center mb-16">
            <img src="/Echoo-transparent.png" className="h-8" />
            <Link to="/sign_in" className="flex items-center gap-1 text-sm">
              Login
              <ArrowUpRightIcon className="size-3" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <h2 className="text-4xl font-bold mb-8">Set New Password</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-al"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-5 top-1/2 -translate-y-1/2"
                >
                  {show ? <EyeIcon className="size-5" /> : <EyeSlashIcon className="size-5" />}
                </button>
              </div>

              <button
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white rounded-full text-base font-semibold hover:from-gray-400 hover:to-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}