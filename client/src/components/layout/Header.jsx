// components/layout/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FlipText } from "../magicui/flip-text";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1 text-3xl font-bold">
          <Link to="/">
            <FlipText>EchoWorks</FlipText>
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex lg:gap-x-12">
          <a
            href="#features"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
          >
            Features
          </a>
          <a
            href="#"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
          >
            Marketplace
          </a>
          <a
            href="#"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
          >
            Company
          </a>
        </div>

        {/* Right side - Login/Signup Buttons with elevation */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-3 items-center">
          <button
            onClick={() => navigate("/login")}
            className="relative px-5 py-2.5 text-sm font-semibold text-gray-700 
                       bg-white border-2 border-gray-200 rounded-full
                       hover:border-gray-300 hover:bg-gray-50
                       shadow-md hover:shadow-lg
                       transform hover:-translate-y-0.5
                       transition-all duration-200 ease-in-out
                       cursor-pointer"
          >
            Log in
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="relative px-5 py-2.5 text-sm font-semibold text-white 
                       bg-gradient-to-r from-blue-600 to-purple-600 rounded-full
                       hover:from-blue-700 hover:to-purple-700
                       shadow-lg hover:shadow-xl
                       transform hover:scale-105 hover:-translate-y-0.5
                       transition-all duration-200
                       cursor-pointer"
          >
            Get Started Free
          </button>
        </div>
      </nav>
    </header>
  );
}
