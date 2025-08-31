import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedGridPattern } from "../ui/magicui/animated-grid-pattern";
import { toast } from "sonner";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Email is required!");
    if (!password.trim()) return toast.error("Password is required!");

    setIsLoading(true);
    try {
      const data = await login(email, password);
      toast.success(data?.message || "Logged in!");
      navigate("/Home", { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.03}
        duration={4}
        repeatDelay={2}
        className="absolute inset-0 [mask-image:radial-gradient(1000px_circle_at_center,white,transparent)] skew-y-12 h-[150%] -top-[25%] fill-gray-400/30 stroke-gray-400/30"
      />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300 cursor-pointer">
              EchoWorks
            </h1>
          </Link>
          <p className="mt-3 text-gray-600">
            Welcome back! Please login to your account.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-10 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-5 py-4 border border-gray-200 rounded-4xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 border border-gray-200 rounded-4xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-[320px] h-[45px] bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-4xl font-medium hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-1.5 hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          By continuing, you agree to EchoWorks's{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
