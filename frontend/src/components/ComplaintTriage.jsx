import React, { useState, useEffect } from 'react';
import { complaintAPI, officialAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Filter, Search, Eye, Edit2 } from 'lucide-react';

// Get image URL - for Cloudinary URLs, return as-is since they're absolute
// For local URLs, prepend the base URL
const getImageBaseURL = () => {
  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return apiURL.replace('/api', ''); // Remove /api to get base server URL
};

const getImageURL = (imagePath) => {
  // If it's already an absolute URL (like Cloudinary), return as-is
  if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }
  // For local images, prepend the base URL
  return `${getImageBaseURL()}${imagePath}`;
};

const ComplaintTriage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [eligibleCount, setEligibleCount] = useState(0);

  useEffect(() => {
    fetchComplaints();
    fetchEligibleCount();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, statusFilter, categoryFilter, searchTerm]);

  const fetchComplaints = async () => {
    try {
      // Fetch complaints filtered by the official's department, designation, and location
      const response = await officialAPI.getDashboard(user?.department, user?.designation, user?.id);
      setComplaints(response.data.complaints);
      setFilteredComplaints(response.data.complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleCount = async () => {
    try {
      const response = await complaintAPI.getEligibleForEscalation();
      setEligibleCount(response.data.count);
    } catch (error) {
      console.error('Error fetching eligible count:', error);
    }
  };

  const filterComplaints = () => {
    let filtered = [...complaints];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await complaintAPI.updateStatus(complaintId, newStatus);
      toast.success('Status updated successfully!');
      fetchComplaints();
      if (selectedComplaint?._id === complaintId) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEscalate = async (complaintId) => {
    const reason = prompt('Enter reason for escalation (optional):');
    setUpdatingStatus(true);
    try {
      await complaintAPI.escalate(complaintId, reason || 'Escalated by admin');
      toast.success('Complaint escalated to next level!');
      fetchComplaints();
      fetchEligibleCount();
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error escalating complaint:', error);
      toast.error(error.response?.data?.error || 'Failed to escalate complaint');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTriggerAutoEscalation = async () => {
    if (!window.confirm('Manually trigger auto-escalation for all eligible complaints?')) return;
    
    setUpdatingStatus(true);
    try {
      const response = await complaintAPI.triggerAutoEscalation();
      toast.success(`${response.data.escalatedCount} complaints auto-escalated!`);
      fetchComplaints();
      fetchEligibleCount();
    } catch (error) {
      console.error('Error triggering auto-escalation:', error);
      toast.error('Failed to trigger auto-escalation');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      water: 'bg-cyan-100 text-cyan-800',
      electricity: 'bg-amber-100 text-amber-800',
      roads: 'bg-slate-100 text-slate-800',
      healthcare: 'bg-red-100 text-red-800',
      education: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-orange-100 text-orange-800 border-orange-300',
      urgent: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getUrgencyIcon = (urgency) => {
    if (urgency === 'urgent') return '🔴';
    if (urgency === 'medium') return '🟡';
    return '🟢';
  };

  const getDaysAtCurrentLevel = (complaint) => {
    let levelStartDate = new Date(complaint.createdAt);
    
    if (complaint.escalationHistory && complaint.escalationHistory.length > 0) {
      const lastEscalation = complaint.escalationHistory[complaint.escalationHistory.length - 1];
      levelStartDate = new Date(lastEscalation.escalatedAt);
    }

    const daysDiff = Math.floor((new Date() - levelStartDate) / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const statusOptions = ['submitted', 'in_progress', 'resolved', 'closed']; // For filtering
  const statusUpdateOptions = ['submitted', 'in_progress', 'resolved']; // For status updates (excludes 'closed')
  const categories = ['water', 'electricity', 'roads', 'healthcare', 'education', 'other'];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Auto-Escalation Info Banner */}
      {eligibleCount > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-orange-800">
                  {eligibleCount} complaint{eligibleCount > 1 ? 's' : ''} eligible for auto-escalation
                </p>
                <p className="text-sm text-orange-600">
                  Complaints at current level for 10+ days will be auto-escalated daily at 2:00 AM
                </p>
              </div>
            </div>
            <button
              onClick={handleTriggerAutoEscalation}
              disabled={updatingStatus}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 text-sm"
            >
              Trigger Now
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status.replace('_', ' ')}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="h-4 w-4" />
            <span>{filteredComplaints.length} result(s)</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Submitted</p>
          <p className="text-2xl font-bold text-blue-700">
            {complaints.filter(c => c.status === 'submitted').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600">In Progress</p>
          <p className="text-2xl font-bold text-yellow-700">
            {complaints.filter(c => c.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Resolved</p>
          <p className="text-2xl font-bold text-green-700">
            {complaints.filter(c => c.status === 'resolved').length}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Closed</p>
          <p className="text-2xl font-bold text-gray-700">
            {complaints.filter(c => c.status === 'closed').length}
          </p>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No complaints found
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{complaint.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {complaint.description}
                      </div>
                      {getDaysAtCurrentLevel(complaint) >= 10 && complaint.currentLevel !== 'State' && (
                        <div className="text-xs text-orange-600 font-semibold mt-1">
                          ⏰ {getDaysAtCurrentLevel(complaint)} days at this level - Auto-escalation pending
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(complaint.category)}`}>
                        {complaint.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        {complaint.currentLevel || 'Block'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${getUrgencyColor(complaint.urgency)}`}>
                        {getUrgencyIcon(complaint.urgency)} {complaint.urgency?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                      {complaint.communityValidated && (
                        <span className="ml-1 text-xs text-green-600">✓</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {complaint.submittedBy?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="text-primary hover:text-blue-700"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Complaint Details</h2>
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">{selectedComplaint.title}</h3>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(selectedComplaint.category)}`}>
                    {selectedComplaint.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 font-medium">
                    Level: {selectedComplaint.currentLevel || 'Block'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getUrgencyColor(selectedComplaint.urgency)}`}>
                    {getUrgencyIcon(selectedComplaint.urgency)} {selectedComplaint.urgency?.toUpperCase()}
                  </span>
                  {selectedComplaint.communityValidated && (
                    <span className="px-3 py-1 rounded-full text-sm bg-green-500 text-white">
                      ✓ Community Validated
                    </span>
                  )}
                  {getDaysAtCurrentLevel(selectedComplaint) >= 10 && selectedComplaint.currentLevel !== 'State' && (
                    <span className="px-3 py-1 rounded-full text-sm bg-orange-500 text-white font-semibold">
                      ⏰ {getDaysAtCurrentLevel(selectedComplaint)} days - Auto-escalation due
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.image && (
                <div>
                  <h4 className="font-semibold mb-2">Image</h4>
                  <img 
                    src={getImageURL(selectedComplaint.image)} 
                    alt="Complaint" 
                    className="rounded-lg max-h-96 w-full object-cover"
                  />
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Update Status</h4>
                <div className="flex gap-2 flex-wrap">
                  {statusUpdateOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedComplaint._id, status)}
                      disabled={updatingStatus || selectedComplaint.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedComplaint.status === status
                          ? `${getStatusColor(status)} cursor-default`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:cursor-not-allowed`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Note: Complaints can only be closed through community validation or auto-escalation.
                </p>
              </div>

              {selectedComplaint.currentLevel !== 'State' && (
                <div>
                  <h4 className="font-semibold mb-3">Escalate Complaint</h4>
                  <button
                    onClick={() => handleEscalate(selectedComplaint._id)}
                    disabled={updatingStatus}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Escalate to {selectedComplaint.currentLevel === 'Block' ? 'District' : 'State'} Level
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Escalate this complaint to the next level if it requires higher authority attention.
                  </p>
                </div>
              )}

              {selectedComplaint.escalationHistory && selectedComplaint.escalationHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Escalation History</h4>
                  <div className="space-y-2">
                    {selectedComplaint.escalationHistory.map((record, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                        <p className="font-medium">
                          {record.from} → {record.to}
                        </p>
                        <p className="text-gray-600">Reason: {record.reason}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(record.escalatedAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Submitted By:</span> {selectedComplaint.submittedBy?.name}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {selectedComplaint.submittedBy?.email}
                </div>
                <div>
                  <span className="font-semibold">Created:</span> {new Date(selectedComplaint.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Updated:</span> {new Date(selectedComplaint.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintTriage;
