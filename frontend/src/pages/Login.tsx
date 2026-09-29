import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (isSignUp && !name)) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
      const payload = isSignUp ? { name, email, password } : { email, password };

      const result = await axios.post(`${authService}${endpoint}`, payload);

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message || (isSignUp ? "Account created! 🧺" : "Welcome back! 🧺"));

      setUser(result.data.user);
      setIsAuth(true);

      if (!result.data.user.role) {
        navigate("/select-role");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Authentication failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0] px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-md border border-[#E2E6DF]">
        {/* Brand Header */}
        <div className="text-center">
          <img
            src="/logo.png"
            alt="Goblin Basket Logo"
            className="mx-auto h-20 w-20 object-contain mb-3 drop-shadow-xs"
          />
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
            <span className="text-[#2E6327]">Goblin</span> Basket
          </h1>
          <p className="mt-1 text-xs font-semibold text-[#C98B2C] tracking-wide uppercase">
            Food you love, delivered.
          </p>
          <p className="mt-2 text-sm text-[#3D443E]">
            {isSignUp ? "Create your Goblin Basket account" : "Log in to order delicious meals"}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mt-6 flex rounded-2xl bg-[#F8F6F0] p-1 border border-[#E2E6DF]">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setName("");
            }}
            className={`w-1/2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
              !isSignUp
                ? "bg-[#2E6327] text-white shadow-xs"
                : "text-[#3D443E] hover:text-[#1A1A1A]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`w-1/2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
              isSignUp
                ? "bg-[#2E6327] text-white shadow-xs"
                : "text-[#3D443E] hover:text-[#1A1A1A]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                Full Name
              </label>
              <div className="relative rounded-xl border border-[#E2E6DF] focus-within:border-[#2E6327] focus-within:ring-2 focus-within:ring-[#2E6327]/20 transition-all bg-[#F8F6F0]/50">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiUser size={18} />
                </div>
                <input
                  type="text"
                  required={isSignUp}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none bg-transparent text-[#1A1A1A]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Email Address
            </label>
            <div className="relative rounded-xl border border-[#E2E6DF] focus-within:border-[#2E6327] focus-within:ring-2 focus-within:ring-[#2E6327]/20 transition-all bg-[#F8F6F0]/50">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiMail size={18} />
              </div>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none bg-transparent text-[#1A1A1A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Password
            </label>
            <div className="relative rounded-xl border border-[#E2E6DF] focus-within:border-[#2E6327] focus-within:ring-2 focus-within:ring-[#2E6327]/20 transition-all bg-[#F8F6F0]/50">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiLock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl py-3 pl-10 pr-10 text-sm outline-none bg-transparent text-[#1A1A1A]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-full bg-[#2E6327] py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[#224b1d] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
              </>
            ) : (
              <span>{isSignUp ? "Sign Up" : "Sign In"}</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-[#3D443E]">
          By continuing, you agree to Goblin Basket's{" "}
          <a href="#" className="font-semibold text-[#2E6327] hover:underline">
            Terms of Service
          </a>{" "}
          &{" "}
          <a href="#" className="font-semibold text-[#2E6327] hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
