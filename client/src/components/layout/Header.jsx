import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FlipText } from "../ui/magicui/flip-text";
import useAuth from "@/hooks/useAuth";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();

  const storageKey = user?.id
    ? `gmailConnected:${user.id}`
    : "gmailConnected:anon";

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/", { replace: true });
    }
  };

  async function refreshAccessToken() {
    const r = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    let payload = null;
    try {
      payload = await r.json();
    } catch {}
    if (!r.ok || !payload?.accessToken) {
      throw new Error(payload?.error || "Refresh failed");
    }
    localStorage.setItem("accessToken", payload.accessToken);
    return payload.accessToken;
  }

  async function authFetch(url, opts = {}, tried = false) {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(url, {
      credentials: "include",
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    if (res.status === 401 && !tried) {
      try {
        const newTok = await refreshAccessToken();
        return fetch(url, {
          credentials: "include",
          ...opts,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newTok}`,
            ...(opts.headers || {}),
          },
        });
      } catch {}
    }
    return res;
  }

  const handleBrandClick = async (e) => {
    if (location.pathname !== "/email-theater") return;
    e.preventDefault();

    if (localStorage.getItem(storageKey) === "1") {
      try {
        await authFetch("/api/email/gmail/disconnect", { method: "POST" });
      } catch {}
      localStorage.removeItem(storageKey);
    }

    navigate("/", { replace: true });
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-[100]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        {/* Brand */}
        <div className="flex lg:flex-1 text-3xl font-bold">
          <Link to="/" onClick={handleBrandClick}>
            <FlipText>EchoWorks</FlipText>
          </Link>
        </div>

        {/* Simple nav (optional) */}
        <div className="hidden lg:flex lg:gap-x-12">
          <Link
            to={"/features"}
            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            Features
          </Link>
          <Link
            to={"/community"}
            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            Community
          </Link>
          <Link
            to={"/subscriptions"}
            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            Subscriptions
          </Link>
        </div>

        {/* Right side auth area */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="h-9 w-24 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-9 w-28 rounded-full bg-gray-200 animate-pulse" />
            </div>
          ) : user ? (
            <>
              <span className="text-sm font-medium text-gray-700 truncate max-w-[220px]">
                {user?.name || user?.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
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
