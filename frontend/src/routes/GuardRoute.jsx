import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const GuardRoute = ({ allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-slate-500">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};
