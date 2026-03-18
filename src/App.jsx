import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/shared/ProtectedRoute';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/home/HomePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ServicesPage from './components/customer/ServicesPage';
import ServiceBooking from './components/customer/ServiceBooking';
import BookingHistory from './components/customer/BookingHistory';
import Profile from './components/shared/Profile';
import CustomerDashboard from './components/customer/CustomerDashboard';
import ProviderDashboard from './components/provider/ProviderDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import Settings from './components/shared/Settings';
import NotFound from './components/shared/NotFound';
import BookingConfirmation from './components/customer/BookingConfirmation';
import StaticPage from './components/static/StaticPage';

function RoleBasedRedirect() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === 'provider') {
    return <Navigate to="/provider-dashboard" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return <Navigate to="/customer-dashboard" replace />;
}

function AppShell() {
  const { theme } = useTheme();

  return (
    <div className={`app theme-${theme}`}>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedRedirect />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer-dashboard"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/provider-dashboard"
            element={
              <ProtectedRoute requiredRole="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/services"
            element={
              <ProtectedRoute requiredRole="customer">
                <ServicesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/book-service"
            element={
              <ProtectedRoute requiredRole="customer">
                <ServiceBooking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/booking-history"
            element={
              <ProtectedRoute requiredRole="customer">
                <BookingHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route
            path="/about"
            element={
              <StaticPage
                title="About ServiceHubIQ"
                subtitle="A smarter way to connect homeowners with trusted service professionals."
                content={[
                  'ServiceHubIQ connects customers with verified providers across Canada for the services that matter most.',
                  'We focus on reliability, transparency, and fast booking experiences to help you maintain your home with confidence.'
                ]}
              />
            }
          />
          <Route
            path="/contact"
            element={
              <StaticPage
                title="Contact Us"
                subtitle="We are here to help."
                content={[
                  'Email: support@servicehubiq.com',
                  'Phone: +1 (416) 555-0123',
                  'Location: Toronto, Ontario, Canada'
                ]}
              />
            }
          />
          <Route
            path="/privacy"
            element={
              <StaticPage
                title="Privacy Policy"
                subtitle="Your privacy matters to us."
                content={[
                  'We only collect the information required to deliver and improve ServiceHubIQ services.',
                  'We never sell personal data and we protect your information using industry best practices.'
                ]}
              />
            }
          />
          <Route
            path="/terms"
            element={
              <StaticPage
                title="Terms of Service"
                subtitle="Using ServiceHubIQ means agreeing to fair use and safety standards."
                content={[
                  'Please use ServiceHubIQ responsibly and provide accurate information for bookings and profiles.',
                  'We reserve the right to update these terms as the platform evolves.'
                ]}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
