import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { employeeService } from '../services/employeeService';
import { systemService } from '../services/systemService';
import { roleService } from '../services/roleService';
import { requestService } from '../services/requestService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    employees: 0,
    systems: 0,
    roles: 0,
    requests: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [employees, systems, roles, requests] = await Promise.all([
        employeeService.getAll(),
        systemService.getAll(),
        roleService.getAll(),
        requestService.getAll()
      ]);

      const pendingRequests = requests.filter(r => r.status === 'Submitted').length;

      setStats({
        employees: employees.length,
        systems: systems.length,
        roles: roles.length,
        requests: requests.length,
        pendingRequests
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome to the System Access Request Application</p>
        </div>

        {loading ? (
          <div className="loading">Loading statistics...</div>
        ) : (
          <>
            <div className="dashboard-grid">
              <Link to="/employees" style={{textDecoration: 'none'}}>
                <div className="dashboard-card">
                  <h3>Employees</h3>
                  <div className="count">{stats.employees}</div>
                  <p>Total employees in system</p>
                </div>
              </Link>

              <Link to="/systems" style={{textDecoration: 'none'}}>
                <div className="dashboard-card">
                  <h3>Systems</h3>
                  <div className="count">{stats.systems}</div>
                  <p>Available systems</p>
                </div>
              </Link>

              <Link to="/roles" style={{textDecoration: 'none'}}>
                <div className="dashboard-card">
                  <h3>Roles</h3>
                  <div className="count">{stats.roles}</div>
                  <p>Total roles defined</p>
                </div>
              </Link>

              <Link to="/requests" style={{textDecoration: 'none'}}>
                <div className="dashboard-card">
                  <h3>Requests</h3>
                  <div className="count">{stats.requests}</div>
                  <p>Total access requests</p>
                </div>
              </Link>
            </div>

            {stats.pendingRequests > 0 && (
              <div className="info-message">
                <strong>Attention:</strong> You have {stats.pendingRequests} pending request(s) awaiting approval.
              </div>
            )}

            <div className="table-container">
              <h2 style={{padding: '1rem'}}>Quick Actions</h2>
              <div style={{padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                <Link to="/employees">
                  <button className="btn-primary">Manage Employees</button>
                </Link>
                <Link to="/systems">
                  <button className="btn-primary">Manage Systems</button>
                </Link>
                <Link to="/roles">
                  <button className="btn-primary">Manage Roles</button>
                </Link>
                <Link to="/requests">
                  <button className="btn-success">Create New Request</button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

// Made with Bob
