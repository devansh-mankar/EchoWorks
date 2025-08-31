const RAW_BASE = import.meta.env.VITE_API_URL ?? "/api";
const API_BASE = RAW_BASE.endsWith("/") ? RAW_BASE.slice(0, -1) : RAW_BASE;

async function safeParse(res) {
  const txt = await res.text();
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch {
    return txt;
  }
}

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem("accessToken");

    const cfg = {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(options.body && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {}),
      },
      ...options,
      body:
        options?.body && typeof options.body !== "string"
          ? JSON.stringify(options.body)
          : options?.body,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, cfg);
    const data = await safeParse(res);

    if (!res.ok) {
      const msg =
        data?.message ||
        data?.error ||
        (typeof data === "string" ? data : `Request failed (${res.status})`);
      const err = new Error(msg);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }

  login(email, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: { email, password },
    }).then((data) => {
      if (data?.accessToken)
        localStorage.setItem("accessToken", data.accessToken);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    });
  }

  signup(user) {
    return this.request("/auth/signup", {
      method: "POST",
      body: user,
    }).then((data) => {
      if (data?.accessToken)
        localStorage.setItem("accessToken", data.accessToken);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    });
  }

  logout() {
    return this.request("/auth/logout", { method: "POST" }).catch(() => {});
  }
}

const api = new ApiService();
export default api;
