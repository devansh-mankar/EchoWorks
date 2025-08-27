import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { Toaster } from "../src/components/ui/sonner";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster toastOptions={{ className: "p-1 mt-20" }} />
  </React.StrictMode>
);
