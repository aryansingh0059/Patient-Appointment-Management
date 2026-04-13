import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './styles/index.css';

import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import PatientBookAppointment from './pages/PatientBookAppointment';
import PatientAppointments from './pages/PatientAppointments';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';
import AIChatbot from './components/AIChatbot';

// Only renders the chatbot for logged-in patients (not doctors or admins)
const AuthenticatedChatbot = () => {
  const { user } = useContext(AuthContext);
  return user && user.role === 'patient' ? <AIChatbot /> : null;
};

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <AuthProvider>
        <Router>
          <Navbar />
          <main style={{ width: '100%' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/patient" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/patient/book" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientBookAppointment />
                </ProtectedRoute>
              } />
              <Route path="/patient/appointments" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientAppointments />
                </ProtectedRoute>
              } />
              <Route path="/doctor" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/doctor/appointments" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorAppointments />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </main>
          <AuthenticatedChatbot />
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
