import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/home/HomePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
// import RoleSelection from './components/auth/RoleSelection'; 
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


function RoleBasedRedirect() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  switch(user.role) {
    case 'customer':
      return <CustomerDashboard />;
    case 'provider':
      return <ProviderDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <CustomerDashboard />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* <Route path="/role-selection" element={<RoleSelection />} /> {/* ADD THIS ROUTE */}
              {/* <Route path="/services" element={<ServicesPage />} />  */}
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              } />

              <Route path="/services" element={
                <ProtectedRoute requiredRole="customer">
                  <ServicesPage />
                </ProtectedRoute>
              } />
              
              {/* <Route path="/customer-dashboard" element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } /> */}
              
              <Route path="/book-service" element={
                <ProtectedRoute requiredRole="customer">
                  <ServiceBooking />
                </ProtectedRoute>
              } />
              
              <Route path="/booking-history" element={
                <ProtectedRoute requiredRole="customer">
                  <BookingHistory />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/provider-dashboard" element={
                <ProtectedRoute requiredRole="provider">
                  <ProviderDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin-dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Catch all route - SHOULD BE LAST */}
              <Route path="*" element={<NotFound />} />

              <Route path="/booking-confirmation" element={<BookingConfirmation />} />

            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;