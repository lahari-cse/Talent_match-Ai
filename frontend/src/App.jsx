import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import JobSearch from './pages/JobSearch';
import Recommendations from './pages/Recommendations';
import Landing from './pages/Landing';
import MockInterview from './pages/MockInterview';
import Chatbot from './components/Chatbot';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (roleRequired && user.role !== roleRequired) return <Navigate to="/" />;
  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 container mx-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {user?.role === 'recruiter' ? <RecruiterDashboard /> : <Dashboard />}
            </ProtectedRoute>
          } />

          <Route path="/resume-builder" element={
            <ProtectedRoute roleRequired="candidate">
              <ResumeBuilder />
            </ProtectedRoute>
          } />

          <Route path="/jobs" element={
            <ProtectedRoute roleRequired="candidate">
              <JobSearch />
            </ProtectedRoute>
          } />

          <Route path="/recommendations" element={
            <ProtectedRoute roleRequired="candidate">
              <Recommendations />
            </ProtectedRoute>
          } />

          <Route path="/mock-interview/:jobId" element={
            <ProtectedRoute roleRequired="candidate">
              <MockInterview />
            </ProtectedRoute>
          } />

        </Routes>
      </main>
      <Chatbot />
    </div>
  );
}

export default App;
