
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    // Any initialization can go here
  }, []);

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default Index;
