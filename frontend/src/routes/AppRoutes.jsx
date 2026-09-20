import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GuardRoute } from './GuardRoute';
import Login from '../pages/Auth/Login';
import TellerDashboard from '../pages/Teller/Dashboard';
import ShiftHistory from '../pages/Teller/ShiftHistory';
import AuditorCompliance from '../pages/Auditor/Compliance';
import RiskAlerts from '../pages/Auditor/RiskAlerts';
import Layout from '../components/layout/Layout';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<div className="p-8 text-center text-red-500">Unauthorized Access</div>} />
      
      {/* Protected routes with Layout */}
      <Route element={<Layout />}>
        <Route element={<GuardRoute allowedRoles={['teller']} />}>
          <Route path="/teller/dashboard" element={<TellerDashboard />} />
          <Route path="/teller/history" element={<ShiftHistory />} />
        </Route>
        
        <Route element={<GuardRoute allowedRoles={['auditor']} />}>
          <Route path="/auditor/compliance" element={<AuditorCompliance />} />
          <Route path="/auditor/alerts" element={<RiskAlerts />} />
        </Route>
      </Route>
      
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
