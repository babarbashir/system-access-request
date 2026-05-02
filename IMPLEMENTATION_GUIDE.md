# Frontend Implementation Guide

This guide provides detailed instructions for completing the React frontend implementation for the System Access Request Application.

## Current Status

✅ **Completed:**
- Backend API fully implemented and functional
- Database schema with all tables and relationships
- Authentication system with JWT
- All CRUD endpoints for Employee, System, Role, and Request
- Request workflow (Draft → Submitted → Approved/Rejected)
- API service layer in frontend
- AuthContext for state management

⏳ **Remaining Work:**
- React components for all CRUD interfaces
- Request creation form with dynamic rows
- Navigation and routing
- Styling and UI polish

## Frontend Components to Implement

### 1. App.jsx and Routing

Create the main App component with React Router:

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Systems from './pages/Systems';
import Roles from './pages/Roles';
import Requests from './pages/Requests';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
          <Route path="/systems" element={<PrivateRoute><Systems /></PrivateRoute>} />
          <Route path="/roles" element={<PrivateRoute><Roles /></PrivateRoute>} />
          <Route path="/requests" element={<PrivateRoute><Requests /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### 2. PrivateRoute Component

Create `frontend/src/components/common/PrivateRoute.jsx`:

```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
```

### 3. Login Page

Create `frontend/src/pages/Login.jsx`:

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>System Access Request</h1>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="login-hint">
          <p>Sample credentials:</p>
          <p>Username: john.manager | Password: password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

### 4. Navbar Component

Create `frontend/src/components/common/Navbar.jsx`:

```jsx
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
        <span>Welcome, {user?.employee_name}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
```

### 5. Employee Management Page

Create `frontend/src/pages/Employees.jsx` with:
- List of all employees in a table
- Add/Edit/Delete functionality
- Form with validation for:
  - Employee ID (unique, alphanumeric uppercase)
  - Name, Email, Department, Branch
  - Manager selection dropdown

Key features:
- Fetch employees on mount
- Modal or inline form for add/edit
- Confirmation dialog for delete
- Error handling and success messages

### 6. System Management Page

Create `frontend/src/pages/Systems.jsx` with:
- List of all systems
- Add/Edit/Delete functionality
- Form with validation for:
  - System ID (unique, alphanumeric uppercase)
  - System Name (unique)
  - Description, Business Function
  - Owner selection dropdown (from employees)

### 7. Role Management Page

Create `frontend/src/pages/Roles.jsx` with:
- List of all roles with system names
- Add/Edit/Delete functionality
- Form with validation for:
  - Role ID (unique, alphanumeric uppercase)
  - Role Name (unique per system)
  - System selection dropdown
  - Security Level (Read/Write/Admin)

### 8. Request Creation Form - CRITICAL COMPONENT

Create `frontend/src/components/requests/RequestForm.jsx`:

**Section 1: Employee Selection**
```jsx
<div className="section-1">
  <h3>Employee Information</h3>
  <div className="form-group">
    <label>Select Employee *</label>
    <select 
      value={selectedEmployeeId} 
      onChange={handleEmployeeChange}
      required
    >
      <option value="">-- Select Employee --</option>
      {employees.map(emp => (
        <option key={emp.employee_id} value={emp.employee_id}>
          {emp.employee_name} ({emp.employee_id})
        </option>
      ))}
    </select>
  </div>
  
  {/* Auto-populated fields */}
  <div className="form-group">
    <label>Employee Name</label>
    <input type="text" value={employeeName} readOnly />
  </div>
  <div className="form-group">
    <label>Employee ID</label>
    <input type="text" value={employeeId} readOnly />
  </div>
  <div className="form-group">
    <label>Department</label>
    <input type="text" value={department} readOnly />
  </div>
  <div className="form-group">
    <label>Branch</label>
    <input type="text" value={branch} readOnly />
  </div>
  <div className="form-group">
    <label>Manager Name</label>
    <input type="text" value={managerName} readOnly />
  </div>
  <div className="form-group">
    <label>Manager ID</label>
    <input type="text" value={managerId} readOnly />
  </div>
  <div className="form-group">
    <label>Request Description *</label>
    <textarea 
      value={requestDescription}
      onChange={(e) => setRequestDescription(e.target.value)}
      minLength={10}
      required
    />
  </div>
</div>
```

**Section 2: Dynamic System/Role Rows**
```jsx
<div className="section-2">
  <h3>System Access Details</h3>
  {items.map((item, index) => (
    <div key={index} className="system-row">
      <div className="row-number">#{index + 1}</div>
      
      <div className="form-group">
        <label>System *</label>
        <select
          value={item.system_id}
          onChange={(e) => handleSystemChange(index, e.target.value)}
          required
        >
          <option value="">-- Select System --</option>
          {systems.map(sys => (
            <option key={sys.system_id} value={sys.system_id}>
              {sys.system_name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Role *</label>
        <select
          value={item.role_id}
          onChange={(e) => handleRoleChange(index, e.target.value)}
          required
          disabled={!item.system_id}
        >
          <option value="">-- Select Role --</option>
          {getRolesForSystem(item.system_id).map(role => (
            <option key={role.role_id} value={role.role_id}>
              {role.role_name} ({role.security_level})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Business Justification *</label>
        <textarea
          value={item.business_justification}
          onChange={(e) => handleJustificationChange(index, e.target.value)}
          minLength={20}
          placeholder="Minimum 20 characters"
          required
        />
      </div>

      {index > 0 && (
        <button 
          type="button" 
          onClick={() => removeRow(index)}
          className="btn-remove"
        >
          Remove
        </button>
      )}
    </div>
  ))}
  
  <button 
    type="button" 
    onClick={addRow}
    className="btn-add"
  >
    + Add Another System
  </button>
</div>
```

**State Management for Dynamic Rows:**
```jsx
const [items, setItems] = useState([
  { system_id: '', role_id: '', business_justification: '' }
]);

const addRow = () => {
  setItems([...items, { system_id: '', role_id: '', business_justification: '' }]);
};

const removeRow = (index) => {
  setItems(items.filter((_, i) => i !== index));
};

const handleSystemChange = (index, systemId) => {
  const newItems = [...items];
  newItems[index].system_id = systemId;
  newItems[index].role_id = ''; // Reset role when system changes
  setItems(newItems);
};

const handleRoleChange = (index, roleId) => {
  const newItems = [...items];
  newItems[index].role_id = roleId;
  setItems(newItems);
};

const handleJustificationChange = (index, justification) => {
  const newItems = [...items];
  newItems[index].business_justification = justification;
  setItems(newItems);
};

const getRolesForSystem = (systemId) => {
  return roles.filter(role => role.system_id === systemId);
};
```

### 9. Request List Page

Create `frontend/src/pages/Requests.jsx` with:
- Table showing all requests
- Columns: Request ID, Employee, Manager, Systems Count, Status, Created Date
- Filter by status (Draft, Submitted, Approved, Rejected)
- Actions based on status:
  - Draft: Edit, Delete, Submit
  - Submitted: Approve, Reject (for admins)
  - Approved/Rejected: View only
- Status badges with color coding

### 10. Request Details View

Create `frontend/src/components/requests/RequestDetails.jsx`:
- Display all request information
- Show all system/role items with justifications
- Display status history
- Action buttons based on status

## Styling Guidelines

Create `frontend/src/App.css` with:

```css
/* Base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background-color: #f5f5f5;
}

/* Navbar */
.navbar {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Forms */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

/* Buttons */
button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-success {
  background-color: #2ecc71;
  color: white;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

/* Status badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-draft {
  background-color: #95a5a6;
  color: white;
}

.status-submitted {
  background-color: #3498db;
  color: white;
}

.status-approved {
  background-color: #2ecc71;
  color: white;
}

.status-rejected {
  background-color: #e74c3c;
  color: white;
}

/* System rows in request form */
.system-row {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  background: #f9f9f9;
  position: relative;
}

.row-number {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}
```

## Validation Implementation

Create `frontend/src/utils/validators.js`:

```javascript
export const validators = {
  employeeId: (value) => {
    if (!value) return 'Employee ID is required';
    if (!/^[A-Z0-9]+$/.test(value)) return 'Employee ID must be alphanumeric uppercase';
    return null;
  },

  email: (value) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
    return null;
  },

  systemId: (value) => {
    if (!value) return 'System ID is required';
    if (!/^[A-Z0-9]+$/.test(value)) return 'System ID must be alphanumeric uppercase';
    return null;
  },

  roleId: (value) => {
    if (!value) return 'Role ID is required';
    if (!/^[A-Z0-9]+$/.test(value)) return 'Role ID must be alphanumeric uppercase';
    return null;
  },

  minLength: (value, min) => {
    if (!value) return 'This field is required';
    if (value.length < min) return `Minimum ${min} characters required`;
    return null;
  }
};
```

## Testing Checklist

Once implementation is complete, test:

- [ ] Login with sample credentials
- [ ] Create a new employee
- [ ] Edit an existing employee
- [ ] Delete an employee (check constraints)
- [ ] Create a new system
- [ ] Create roles for systems
- [ ] Create a request with multiple systems
- [ ] Add/remove dynamic rows in request form
- [ ] Submit a request
- [ ] Approve/reject a request
- [ ] Edit a draft request
- [ ] Delete a draft request
- [ ] Verify unique ID validation
- [ ] Test all form validations
- [ ] Logout and login again

## Next Steps

1. Implement the Login page and authentication flow
2. Create the Navbar and layout structure
3. Implement Employee CRUD interface
4. Implement System CRUD interface
5. Implement Role CRUD interface
6. Implement Request creation form (most complex)
7. Implement Request list and details
8. Add styling and polish
9. Test all functionality
10. Fix bugs and refine UX

## Notes

- The backend is fully functional and ready to use
- All API endpoints are documented in the backend README
- Use the provided service files for API calls
- Implement error handling for all API calls
- Show loading states during async operations
- Display success/error messages to users
- The request form's dynamic rows are the most complex feature - take time to implement properly

## Resources

- Backend API: http://localhost:5000/api
- React Router Docs: https://reactrouter.com/
- Axios Docs: https://axios-http.com/
- React Hooks: https://react.dev/reference/react

Good luck with the implementation! 🚀