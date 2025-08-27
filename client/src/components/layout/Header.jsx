// src/components/layout/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FlipText } from "../magicui/flip-text";
import useAuth from "@/hooks/useAuth";

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
  const { user, logout, loading } = useAuth();

  const handleLogout = async (e) => {
    // no preventDefault here, otherwise <details> can hang

    e.stopPropagation();
    try {
      console.log("Logging out...");
      await logout();
    } finally {
      // close the <details> manually
      const detailsEl = e.currentTarget.closest("details");
      if (detailsEl) detailsEl.open = false;
      navigate("/", { replace: true });
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-[100]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1 text-3xl font-bold">
          <Link to="/">
            <FlipText>EchoWorks</FlipText>
          </Link>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          <a
            href="#features"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            Features
          </a>
          <a
            href="#"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            Marketplace
          </a>
          <a
            href="#"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            Company
          </a>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="h-9 w-24 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-9 w-36 rounded-full bg-gray-200 animate-pulse" />
            </div>
          ) : user ? (
            <details className="relative z-[200]">
              <summary
                className="list-none flex items-center gap-3 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={(e) => {
                  e.preventDefault(); // only here, not on logout button
                  const el = e.currentTarget.parentElement;
                  el.open = !el.open;
                }}
              >
                <Avatar name={user?.name} />
                <span className="text-sm font-medium text-gray-700 max-w-[180px] truncate">
                  {user?.name || user?.email || "Account"}
                </span>
                <svg
                  className="h-4 w-4 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>

              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.closest("details").open = false;
                      navigate("/profile");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.closest("details").open = false;
                      navigate("/settings");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.closest("details").open = false;
                      navigate("/billing");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Billing
                  </button>
                </div>

                <div className="border-t border-gray-100" />

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </details>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="relative px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="relative px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
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
