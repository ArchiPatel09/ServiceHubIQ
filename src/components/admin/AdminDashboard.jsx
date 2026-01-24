import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUsers, 
  FaTools, 
  FaChartLine, 
  FaDollarSign,
  FaShieldAlt,
  FaDatabase
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = {
    totalUsers: 1245,
    activeProviders: 89,
    totalBookings: 567,
    totalRevenue: 45280,
    pendingApprovals: 12
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, Administrator</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon admin">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers.toLocaleString()}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon admin">
            <FaTools />
          </div>
          <div className="stat-content">
            <h3>{stats.activeProviders}</h3>
            <p>Active Providers</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon admin">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon admin">
            <FaDollarSign />
          </div>
          <div className="stat-content">
            <h3>${stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <h2>Administrative Actions</h2>
        <div className="action-grid">
          <div className="admin-action">
            <FaShieldAlt />
            <h4>User Management</h4>
            <p>Manage user accounts and permissions</p>
          </div>
          
          <div className="admin-action">
            <FaTools />
            <h4>Provider Verification</h4>
            <p>Review and approve service providers</p>
          </div>
          
          <div className="admin-action">
            <FaChartLine />
            <h4>Platform Analytics</h4>
            <p>View platform usage and performance metrics</p>
          </div>
          
          <div className="admin-action">
            <FaDatabase />
            <h4>System Settings</h4>
            <p>Configure platform settings and preferences</p>
          </div>
        </div>
      </div>

      <div className="security-notice">
        <h3>Security Notice</h3>
        <p>You are logged in as an administrator. All actions are logged for security purposes.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;