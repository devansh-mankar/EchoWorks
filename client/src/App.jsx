import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import KnowledgeBase from "@/components/KnowledgeBase/KnowledgeBase";
import EmailTheater from "@/components/EmailTheater/EmailTheater";
import useAuth from "./hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import Subscriptions from "./pages/Subscriptions";
import Features from "./pages/Features";
import Community from "./pages/Community";
import EchoDubLive from "./components/echodub/EchoDubLive";

// Protect logged-in pages
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  return user ? children : <Navigate to="/" replace />;
};

// Guest-only pages
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  return user ? <Navigate to="/home" replace /> : children;
};

export default function App() {
  return (
    <Routes>
      {/* Guest-only */}
      <Route
        path="/"
        element={
          <GuestRoute>
            <Landing />
          </GuestRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        }
      />

      {/* Authenticated-only  */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route path="/email-theater" element={<EmailTheater />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/features" element={<Features />} />
        <Route path="/community" element={<Community />} />
        <Route path="/echo-dub" element={<EchoDubLive />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
