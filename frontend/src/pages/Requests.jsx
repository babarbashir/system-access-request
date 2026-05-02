import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { requestService } from '../services/requestService';
import { employeeService } from '../services/employeeService';
import { systemService } from '../services/systemService';
import { roleService } from '../services/roleService';
import { useAuth } from '../context/AuthContext';

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [systems, setSystems] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [requestDescription, setRequestDescription] = useState('');
  const [items, setItems] = useState([
    { system_id: '', role_id: '', business_justification: '' }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestsData, employeesData, systemsData, rolesData] = await Promise.all([
        requestService.getAll(),
        employeeService.getAll(),
        systemService.getAll(),
        roleService.getAll()
      ]);
      setRequests(requestsData);
      setEmployees(employeesData);
      setSystems(systemsData);
      setAllRoles(rolesData);
      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedEmployeeId(empId);
    const emp = employees.find(e => e.employee_id === empId);
    setSelectedEmployee(emp || null);
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

  const addRow = () => {
    setItems([...items, { system_id: '', role_id: '', business_justification: '' }]);
  };

  const removeRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getRolesForSystem = (systemId) => {
    return allRoles.filter(role => role.system_id === systemId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedEmployeeId) {
      setError('Please select an employee');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one system access');
      return;
    }

    // Validate all items
    for (let i = 0; i < items.length; i++) {
      if (!items[i].system_id || !items[i].role_id || !items[i].business_justification) {
        setError(`Please complete all fields for system #${i + 1}`);
        return;
      }
      if (items[i].business_justification.length < 20) {
        setError(`Business justification for system #${i + 1} must be at least 20 characters`);
        return;
      }
    }

    try {
      const requestData = {
        request_description: requestDescription,
        employee_id: selectedEmployeeId,
        items: items
      };

      if (isEditMode && editingRequest) {
        await requestService.update(editingRequest.request_id, requestData);
        setSuccess('Request updated successfully!');
      } else {
        await requestService.create(requestData);
        setSuccess('Request created successfully!');
      }
      
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} request`);
    }
  };

  const handleEdit = async (requestId) => {
    try {
      const request = await requestService.getById(requestId);
      
      // Set edit mode
      setIsEditMode(true);
      setEditingRequest(request);
      
      // Populate form with request data
      setSelectedEmployeeId(request.employee_id);
      const emp = employees.find(e => e.employee_id === request.employee_id);
      setSelectedEmployee(emp || null);
      setRequestDescription(request.request_description);
      
      // Populate items
      if (request.items && request.items.length > 0) {
        setItems(request.items.map(item => ({
          system_id: item.system_id,
          role_id: item.role_id,
          business_justification: item.business_justification
        })));
      }
      
      // Show form
      setShowForm(true);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Failed to load request for editing');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;

    try {
      await requestService.delete(id);
      setSuccess('Request deleted successfully!');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleSubmitRequest = async (id) => {
    if (!window.confirm('Submit this request for approval?')) return;

    try {
      await requestService.submit(id);
      setSuccess('Request submitted successfully!');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Submit failed');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this request?')) return;

    try {
      await requestService.approve(id);
      setSuccess('Request approved successfully!');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Approve failed');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this request?')) return;

    try {
      await requestService.reject(id);
      setSuccess('Request rejected successfully!');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Reject failed');
    }
  };

  const handleViewDetails = async (requestId) => {
    try {
      const details = await requestService.getById(requestId);
      setViewingRequest(details);
      setShowDetailsModal(true);
    } catch (err) {
      setError('Failed to load request details');
      console.error(err);
    }
  };

  const closeDetailsModal = () => {
    setViewingRequest(null);
    setShowDetailsModal(false);
  };

  const resetForm = () => {
    setSelectedEmployeeId('');
    setSelectedEmployee(null);
    setRequestDescription('');
    setItems([{ system_id: '', role_id: '', business_justification: '' }]);
    setShowForm(false);
    setIsEditMode(false);
    setEditingRequest(null);
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>Access Requests</h1>
          <p>Create and manage system access requests</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="action-bar">
          <button 
            className="btn-success" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Create New Request'}
          </button>
        </div>

        {showForm && (
          <div className="request-form" style={{marginBottom: '2rem'}}>
            <h2>{isEditMode ? 'Edit Access Request' : 'Create New Access Request'}</h2>
            <form onSubmit={handleSubmit}>
              {/* Section 1: Employee Selection */}
              <div className="form-section">
                <h3>Section 1: Employee Information</h3>
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

                {selectedEmployee && (
                  <>
                    <div className="form-group">
                      <label>Employee Name</label>
                      <input type="text" value={selectedEmployee.employee_name} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Employee ID</label>
                      <input type="text" value={selectedEmployee.employee_id} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input type="text" value={selectedEmployee.department} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Branch</label>
                      <input type="text" value={selectedEmployee.branch} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Manager Name</label>
                      <input type="text" value={user?.employee_name || ''} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Manager ID</label>
                      <input type="text" value={user?.employee_id || ''} readOnly />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Request Description *</label>
                  <textarea 
                    value={requestDescription}
                    onChange={(e) => setRequestDescription(e.target.value)}
                    minLength={10}
                    required
                    placeholder="Describe the purpose of this access request (minimum 10 characters)"
                  />
                </div>
              </div>

              {/* Section 2: System Access Details */}
              <div className="form-section">
                <h3>Section 2: System Access Details</h3>
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
                      <label>Business Justification * (minimum 20 characters)</label>
                      <textarea
                        value={item.business_justification}
                        onChange={(e) => handleJustificationChange(index, e.target.value)}
                        minLength={20}
                        placeholder="Explain why this access is needed..."
                        required
                      />
                    </div>

                    {index > 0 && (
                      <button 
                        type="button" 
                        onClick={() => removeRow(index)}
                        className="btn-remove"
                      >
                        Remove System
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

              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <button type="submit" className="btn-primary">
                  {isEditMode ? 'Update Request' : 'Create Request'}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Employee</th>
                  <th>Manager</th>
                  <th>Department</th>
                  <th>Systems</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{textAlign: 'center', padding: '2rem'}}>
                      No requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.request_id}>
                      <td>{req.request_id}</td>
                      <td>{req.employee_name}</td>
                      <td>{req.manager_name}</td>
                      <td>{req.employee_department}</td>
                      <td>{req.items_count || 0}</td>
                      <td>
                        <span className={getStatusBadgeClass(req.status)}>
                          {req.status}
                        </span>
                      </td>
                      <td>{new Date(req.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="table-actions">
                          <button 
                            className="btn-info" 
                            onClick={() => handleViewDetails(req.request_id)}
                            style={{marginBottom: '0.5rem', width: '100%'}}
                          >
                            View Details
                          </button>
                          {req.status === 'Draft' && (
                            <>
                              <button
                                className="btn-primary"
                                onClick={() => handleEdit(req.request_id)}
                                style={{marginBottom: '0.5rem'}}
                              >
                                Edit
                              </button>
                              <button
                                className="btn-success"
                                onClick={() => handleSubmitRequest(req.request_id)}
                              >
                                Submit
                              </button>
                              <button
                                className="btn-danger"
                                onClick={() => handleDelete(req.request_id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {req.status === 'Submitted' && (
                            <>
                              <button 
                                className="btn-success" 
                                onClick={() => handleApprove(req.request_id)}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn-danger" 
                                onClick={() => handleReject(req.request_id)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Request Details Modal */}
        {showDetailsModal && viewingRequest && (
          <div className="modal-overlay" onClick={closeDetailsModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '800px', maxHeight: '90vh', overflow: 'auto'}}>
              <div className="modal-header">
                <h2>Request Details</h2>
                <button className="modal-close" onClick={closeDetailsModal}>&times;</button>
              </div>
              
              <div className="modal-body">
                {/* Request Information */}
                <div className="details-section">
                  <h3>Request Information</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <strong>Request ID:</strong>
                      <span>{viewingRequest.request_id}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Status:</strong>
                      <span className={getStatusBadgeClass(viewingRequest.status)}>
                        {viewingRequest.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Created Date:</strong>
                      <span>{new Date(viewingRequest.created_at).toLocaleString()}</span>
                    </div>
                    {viewingRequest.submitted_at && (
                      <div className="detail-item">
                        <strong>Submitted Date:</strong>
                        <span>{new Date(viewingRequest.submitted_at).toLocaleString()}</span>
                      </div>
                    )}
                    {viewingRequest.approved_at && (
                      <div className="detail-item">
                        <strong>Approved Date:</strong>
                        <span>{new Date(viewingRequest.approved_at).toLocaleString()}</span>
                      </div>
                    )}
                    {viewingRequest.rejected_at && (
                      <div className="detail-item">
                        <strong>Rejected Date:</strong>
                        <span>{new Date(viewingRequest.rejected_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="detail-item" style={{marginTop: '1rem'}}>
                    <strong>Description:</strong>
                    <p style={{marginTop: '0.5rem', padding: '0.75rem', background: '#f5f5f5', borderRadius: '4px'}}>
                      {viewingRequest.request_description || 'No description provided'}
                    </p>
                  </div>
                </div>

                {/* Employee Information */}
                <div className="details-section">
                  <h3>Employee Information</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <strong>Employee Name:</strong>
                      <span>{viewingRequest.employee_name}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Employee ID:</strong>
                      <span>{viewingRequest.employee_id}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Department:</strong>
                      <span>{viewingRequest.employee_department}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Branch:</strong>
                      <span>{viewingRequest.employee_branch}</span>
                    </div>
                  </div>
                </div>

                {/* Manager Information */}
                <div className="details-section">
                  <h3>Manager Information</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <strong>Manager Name:</strong>
                      <span>{viewingRequest.manager_name}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Manager ID:</strong>
                      <span>{viewingRequest.manager_id}</span>
                    </div>
                  </div>
                </div>

                {/* Systems and Roles Requested */}
                <div className="details-section">
                  <h3>Systems and Roles Requested</h3>
                  {viewingRequest.items && viewingRequest.items.length > 0 ? (
                    <div className="systems-list">
                      {viewingRequest.items.map((item, index) => (
                        <div key={index} className="system-detail-card" style={{
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginBottom: '1rem',
                          background: '#f9f9f9'
                        }}>
                          <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.75rem'}}>
                            <span style={{
                              background: '#4CAF50',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                              marginRight: '1rem'
                            }}>
                              #{index + 1}
                            </span>
                            <h4 style={{margin: 0, color: '#333'}}>{item.system_name}</h4>
                          </div>
                          <div className="details-grid">
                            <div className="detail-item">
                              <strong>System ID:</strong>
                              <span>{item.system_id}</span>
                            </div>
                            <div className="detail-item">
                              <strong>Role:</strong>
                              <span>{item.role_name}</span>
                            </div>
                            <div className="detail-item">
                              <strong>Role ID:</strong>
                              <span>{item.role_id}</span>
                            </div>
                            <div className="detail-item">
                              <strong>Security Level:</strong>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                background: item.security_level === 'Admin' ? '#ff9800' : 
                                           item.security_level === 'Write' ? '#2196F3' : '#4CAF50',
                                color: 'white',
                                fontSize: '0.875rem'
                              }}>
                                {item.security_level}
                              </span>
                            </div>
                          </div>
                          <div className="detail-item" style={{marginTop: '0.75rem'}}>
                            <strong>Business Justification:</strong>
                            <p style={{
                              marginTop: '0.5rem',
                              padding: '0.75rem',
                              background: 'white',
                              borderRadius: '4px',
                              border: '1px solid #e0e0e0',
                              lineHeight: '1.5'
                            }}>
                              {item.business_justification}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{color: '#999', fontStyle: 'italic'}}>No systems requested</p>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeDetailsModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;

// Made with Bob
