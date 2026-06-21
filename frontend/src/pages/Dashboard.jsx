import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import ClientDashboard from '../components/dashboards/ClientDashboard';
import FreelancerDashboard from '../components/dashboards/FreelancerDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  
  const getNormalizedRole = () => {
    const rawRole = user?.roles?.[0] || '';
    const role = rawRole.toUpperCase().replace('ROLE_', '');
    return role;
  };

  const renderDashboard = () => {
    const role = getNormalizedRole();
    switch (role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'CLIENT':
        return <ClientDashboard />;
      case 'FREELANCER':
        return <FreelancerDashboard />;
      default:
        return (
          <div className="p-10 text-center">
            <h2 className="text-red-500">Unauthorized Role: {role || 'NONE'}</h2>
            <p>Please contact support to assign a valid role (ADMIN, CLIENT, or FREELANCER).</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
