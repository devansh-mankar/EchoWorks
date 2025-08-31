import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AuthProvider from "./context/AuthProvider";
import { Toaster } from "sonner";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster toastOptions={{ className: "p-1 mt-20" }} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
