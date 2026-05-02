import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { employeeService } from '../services/employeeService';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    employee_email: '',
    department: '',
    branch: '',
    manager_id: ''
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
      setError('');
    } catch (err) {
      setError('Failed to load employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await employeeService.update(editingId, formData);
        setSuccess('Employee updated successfully!');
      } else {
        await employeeService.create(formData);
        setSuccess('Employee created successfully!');
      }
      resetForm();
      loadEmployees();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (emp) => {
    setFormData({
      employee_id: emp.employee_id,
      employee_name: emp.employee_name,
      employee_email: emp.employee_email,
      department: emp.department,
      branch: emp.branch,
      manager_id: emp.manager_id || ''
    });
    setEditingId(emp.employee_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await employeeService.delete(id);
      setSuccess('Employee deleted successfully!');
      loadEmployees();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      employee_name: '',
      employee_email: '',
      department: '',
      branch: '',
      manager_id: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>Employees</h1>
          <p>Manage employee records</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="action-bar">
          <button 
            className="btn-success" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add New Employee'}
          </button>
        </div>

        {showForm && (
          <div className="request-form" style={{marginBottom: '2rem'}}>
            <h3>{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Employee ID *</label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  required
                  disabled={editingId}
                  placeholder="e.g., EMP006"
                />
              </div>
              <div className="form-group">
                <label>Employee Name *</label>
                <input
                  type="text"
                  name="employee_name"
                  value={formData.employee_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="employee_email"
                  value={formData.employee_email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Department *</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Branch *</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Manager</label>
                <select
                  name="manager_id"
                  value={formData.manager_id}
                  onChange={handleInputChange}
                >
                  <option value="">-- No Manager --</option>
                  {employees.filter(e => e.employee_id !== editingId).map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.employee_name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{display: 'flex', gap: '1rem'}}>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update' : 'Create'} Employee
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading employees...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Branch</th>
                  <th>Manager</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.employee_id}>
                    <td>{emp.employee_id}</td>
                    <td>{emp.employee_name}</td>
                    <td>{emp.employee_email}</td>
                    <td>{emp.department}</td>
                    <td>{emp.branch}</td>
                    <td>{emp.manager_name || '-'}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-primary" 
                          onClick={() => handleEdit(emp)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-danger" 
                          onClick={() => handleDelete(emp.employee_id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;

// Made with Bob
