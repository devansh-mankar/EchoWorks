// src/components/layout/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FlipText } from "../magicui/flip-text";
import useAuth from "@/hooks/useAuth";

function useClickOutside(ref, onClose) {
  useEffect(() => {
    function handler(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onClose?.();
    }
    // Use 'click' so menu item onClick runs before we close
    document.addEventListener("click", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onClose]);
}

function Avatar({ name = "", size = 36 }) {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "U";
  const px = `${size}px`;
  return (
    <div
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setOpen(false));

  // Close dropdown on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const onLogout = async () => {
    setOpen(false);
    try {
      await logout(); // clears state + storage
    } finally {
      navigate("/", { replace: true });
    }
  };

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

        {/* Right side */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="h-9 w-24 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-9 w-36 rounded-full bg-gray-200 animate-pulse" />
            </div>
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm hover:shadow-md transition"
                aria-haspopup="menu"
                aria-expanded={open}
              >
                <Avatar name={user?.name} />
                <span className="text-sm font-medium text-gray-700 max-w-[180px] truncate">
                  {user?.name || user?.email || "Account"}
                </span>
                <svg
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {open && (
                <div
                  role="menu"
                  // prevent outside-click handler from closing before item click
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="truncate font-medium text-gray-900">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      role="menuitem"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        navigate("/settings");
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      role="menuitem"
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        navigate("/billing");
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      role="menuitem"
                    >
                      Billing
                    </button>
                  </div>

                  <div className="border-t border-gray-100" />

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
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
                type="button"
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
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
