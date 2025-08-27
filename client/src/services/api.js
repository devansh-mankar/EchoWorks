// src/services/api.js
const RAW_BASE = import.meta.env.VITE_API_URL ?? "/api";

// normalize to avoid double slashes
const API_BASE = RAW_BASE.endsWith("/") ? RAW_BASE.slice(0, -1) : RAW_BASE;

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem("accessToken");

    const config = {
      method: "GET",
      credentials: "include", // supports cookie-based auth; harmless otherwise
      headers: {
        Accept: "application/json",
        ...(options.body && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }), // support Bearer tokens too
        ...(options.headers || {}),
      },
      ...options,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, config);

    // read as text first to tolerate empty/non-JSON bodies
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // ignore parse errors; data stays null
    }

    if (!res.ok) {
      const message =
        data?.message ||
        data?.error ||
        text ||
        `Request failed (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      err.payload = data;
      throw err;
    }

    return data; // may be null for 204s
  }

  // --- Auth helpers ---

  login(email, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then((data) => {
      if (data?.accessToken)
        localStorage.setItem("accessToken", data.accessToken);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    });
  }

  signup(user) {
    // expects { name, email, phone, password }
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(user),
    }).then((data) => {
      if (data?.accessToken)
        localStorage.setItem("accessToken", data.accessToken);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    });
  }

  // If your backend uses /auth/register instead of /auth/signup, switch endpoint above
  register(user) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(user),
    }).then((data) => {
      if (data?.accessToken)
        localStorage.setItem("accessToken", data.accessToken);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    });
  }

  me() {
    return this.request("/auth/me", { method: "GET" });
  }

  logout() {
    return this.request("/auth/logout", { method: "POST" })
      .catch(() => {})
      .finally(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      });
  }
}

const api = new ApiService();
export default api;

// (optional) if you ever want function-style calls: api.request("/auth/...", { ... })
// export const apiRequest = (endpoint, options) => api.request(endpoint, options);
