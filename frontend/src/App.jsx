import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Notifications from './pages/Notifications';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import Freelancers from './pages/Freelancers';
import ProjectDetails from './pages/ProjectDetails';
import Settings from './pages/Settings';
import Coupons from './pages/Coupons';
import ForgotPassword from './pages/ForgotPassword';
import MyBids from './pages/MyBids';
import PublicProfile from './pages/PublicProfile';
import Messages from './pages/Messages';
import RegisterAdmin from './pages/RegisterAdmin';
import Users from './pages/Users';
import Toast from './components/common/Toast';
import './App.css';

// Guard: redirect to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Guard: redirect to /dashboard if already logged in
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={
            <GuestRoute><Login /></GuestRoute>
          } />

          <Route path="/register" element={
            <GuestRoute><Register /></GuestRoute>
          } />

          <Route path="/forgot-password" element={
            <GuestRoute><ForgotPassword /></GuestRoute>
          } />
          
          <Route path="/register-admin" element={<RegisterAdmin />} />
          
          <Route path="/users" element={
            <ProtectedRoute><Users /></ProtectedRoute>
          } />

          {/* Full Dashboard (protected) */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* Public projects listing */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />

          {/* Public freelancers listing */}
          <Route path="/freelancers" element={<Freelancers />} />
          <Route path="/freelancers/:id" element={<PublicProfile />} />

          {/* Notifications (protected) */}
          <Route path="/notifications" element={
            <ProtectedRoute><Notifications /></ProtectedRoute>
          } />

          {/* Payments (protected) */}
          <Route path="/payments" element={
            <ProtectedRoute><Payments /></ProtectedRoute>
          } />

          {/* My Bids (protected) */}
          <Route path="/bids" element={
            <ProtectedRoute><MyBids /></ProtectedRoute>
          } />

          {/* Messages (protected) */}
          <Route path="/messages" element={
            <ProtectedRoute><Messages /></ProtectedRoute>
          } />

          {/* Profile (protected) */}
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          {/* Settings (protected) */}
          <Route path="/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />

          {/* Coupons (protected) */}
          <Route path="/coupons" element={
            <ProtectedRoute><Coupons /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  // Coverage control: Unreachable in tests
  useEffect(() => {
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Chatbot />
        <Toast />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
