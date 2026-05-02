import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { systemService } from '../services/systemService';
import { employeeService } from '../services/employeeService';

const Systems = () => {
  const [systems, setSystems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    system_id: '',
    system_name: '',
    description: '',
    business_function: '',
    owner_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [systemsData, employeesData] = await Promise.all([
        systemService.getAll(),
        employeeService.getAll()
      ]);
      setSystems(systemsData);
      setEmployees(employeesData);
      setError('');
    } catch (err) {
      setError('Failed to load data');
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
        await systemService.update(editingId, formData);
        setSuccess('System updated successfully!');
      } else {
        await systemService.create(formData);
        setSuccess('System created successfully!');
      }
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (sys) => {
    setFormData({
      system_id: sys.system_id,
      system_name: sys.system_name,
      description: sys.description || '',
      business_function: sys.business_function,
      owner_id: sys.owner_id
    });
    setEditingId(sys.system_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this system?')) return;

    try {
      await systemService.delete(id);
      setSuccess('System deleted successfully!');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      system_id: '',
      system_name: '',
      description: '',
      business_function: '',
      owner_id: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>Systems</h1>
          <p>Manage system records</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="action-bar">
          <button 
            className="btn-success" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add New System'}
          </button>
        </div>

        {showForm && (
          <div className="request-form" style={{marginBottom: '2rem'}}>
            <h3>{editingId ? 'Edit System' : 'Add New System'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>System ID *</label>
                <input
                  type="text"
                  name="system_id"
                  value={formData.system_id}
                  onChange={handleInputChange}
                  required
                  disabled={editingId}
                  placeholder="e.g., SYS005"
                />
              </div>
              <div className="form-group">
                <label>System Name *</label>
                <input
                  type="text"
                  name="system_name"
                  value={formData.system_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Business Function *</label>
                <input
                  type="text"
                  name="business_function"
                  value={formData.business_function}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Owner *</label>
                <select
                  name="owner_id"
                  value={formData.owner_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Owner --</option>
                  {employees.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.employee_name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{display: 'flex', gap: '1rem'}}>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update' : 'Create'} System
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading systems...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>System ID</th>
                  <th>System Name</th>
                  <th>Description</th>
                  <th>Business Function</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {systems.map((sys) => (
                  <tr key={sys.system_id}>
                    <td>{sys.system_id}</td>
                    <td>{sys.system_name}</td>
                    <td>{sys.description || '-'}</td>
                    <td>{sys.business_function}</td>
                    <td>{sys.owner_name}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-primary" 
                          onClick={() => handleEdit(sys)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-danger" 
                          onClick={() => handleDelete(sys.system_id)}
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

export default Systems;

// Made with Bob
