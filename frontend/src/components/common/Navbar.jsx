import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">System Access Request</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/employees">Employees</Link></li>
        <li><Link to="/systems">Systems</Link></li>
        <li><Link to="/roles">Roles</Link></li>
        <li><Link to="/requests">Requests</Link></li>
      </ul>
      <div className="nav-user">
        <span>Welcome, {user?.employee_name || user?.username}</span>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;

// Made with Bob
