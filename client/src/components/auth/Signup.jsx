import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedGridPattern } from "../ui/magicui/animated-grid-pattern";
import { toast } from "sonner";
import useAuth from "../../hooks/useAuth";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Name is required!");
    if (!email.trim()) return toast.error("Email is required!");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return toast.error("Please enter a valid email!");
    if (!phone.trim()) return toast.error("Phone number is required!");
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone))
      return toast.error("Please enter a valid 10-digit phone number!");
    if (!password.trim()) return toast.error("Password is required!");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters!");

    setIsLoading(true);
    try {
      const data = await signup({ name, email, phone, password });
      toast.success(data?.message || "Signup successful!");
      navigate("/Home");
    } catch (err) {
      toast.error(err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.03}
        duration={4}
        repeatDelay={2}
        className="absolute inset-0 [mask-image:radial-gradient(1000px_circle_at_center,white,transparent)] skew-y-12 h-[150%] -top-[25%] fill-gray-400/30 stroke-gray-400/30"
      />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300 cursor-pointer">
              EchoWorks
            </h1>
          </Link>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            Create your account to get started.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-8 sm:p-10 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="1234567890"
                className="w-full px-4 py-3 border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm"
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-[320px] h-[45px] bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-4xl font-medium hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
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

export default Signup;
