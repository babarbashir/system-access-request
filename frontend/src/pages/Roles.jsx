import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { roleService } from '../services/roleService';
import { systemService } from '../services/systemService';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    role_id: '',
    role_name: '',
    system_id: '',
    description: '',
    security_level: 'Read'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rolesData, systemsData] = await Promise.all([
        roleService.getAll(),
        systemService.getAll()
      ]);
      setRoles(rolesData);
      setSystems(systemsData);
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
        await roleService.update(editingId, formData);
        setSuccess('Role updated successfully!');
      } else {
        await roleService.create(formData);
        setSuccess('Role created successfully!');
      }
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (role) => {
    setFormData({
      role_id: role.role_id,
      role_name: role.role_name,
      system_id: role.system_id,
      description: role.description || '',
      security_level: role.security_level
    });
    setEditingId(role.role_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      await roleService.delete(id);
      setSuccess('Role deleted successfully!');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      role_id: '',
      role_name: '',
      system_id: '',
      description: '',
      security_level: 'Read'
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>Roles</h1>
          <p>Manage role records</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="action-bar">
          <button 
            className="btn-success" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add New Role'}
          </button>
        </div>

        {showForm && (
          <div className="request-form" style={{marginBottom: '2rem'}}>
            <h3>{editingId ? 'Edit Role' : 'Add New Role'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Role ID *</label>
                <input
                  type="text"
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  required
                  disabled={editingId}
                  placeholder="e.g., ROLE010"
                />
              </div>
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  name="role_name"
                  value={formData.role_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>System *</label>
                <select
                  name="system_id"
                  value={formData.system_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select System --</option>
                  {systems.map(sys => (
                    <option key={sys.system_id} value={sys.system_id}>
                      {sys.system_name} ({sys.system_id})
                    </option>
                  ))}
                </select>
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
                <label>Security Level *</label>
                <select
                  name="security_level"
                  value={formData.security_level}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Read">Read</option>
                  <option value="Write">Write</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div style={{display: 'flex', gap: '1rem'}}>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update' : 'Create'} Role
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading roles...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Role ID</th>
                  <th>Role Name</th>
                  <th>System</th>
                  <th>Description</th>
                  <th>Security Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.role_id}>
                    <td>{role.role_id}</td>
                    <td>{role.role_name}</td>
                    <td>{role.system_name}</td>
                    <td>{role.description || '-'}</td>
                    <td>
                      <span className={`status-badge status-${role.security_level.toLowerCase()}`}>
                        {role.security_level}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-primary" 
                          onClick={() => handleEdit(role)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-danger" 
                          onClick={() => handleDelete(role.role_id)}
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

export default Roles;

// Made with Bob
