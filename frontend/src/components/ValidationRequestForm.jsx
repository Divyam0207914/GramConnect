import React, { useState, useEffect } from 'react';
import { officialAPI, userAPI, validationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Send, Search, User, X } from 'lucide-react';

const ValidationRequestForm = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [complaintsRes, usersRes] = await Promise.all([
        officialAPI.getDashboard(user?.department, user?.designation, user?.id),
        userAPI.getAll()
      ]);
      
      // Filter complaints that are not yet validated or closed
      let activeComplaints = complaintsRes.data.complaints.filter(
        c => c.status !== 'closed' && !c.communityValidated
      );
      
      // Further filter complaints based on official's designation and location
      if (user?.designation !== 'Owner' && user?.location) {
        activeComplaints = activeComplaints.filter(complaint => {
          // Complaint must be at the same currentLevel as official's designation
          if (complaint.currentLevel !== user.designation) {
            return false;
          }
          
          // Check location matching based on designation level
          if (!complaint.location) return false;
          
          if (user.designation === 'Block') {
            // Block official: only complaints in their specific block
            return complaint.location.state === user.location.state &&
                   complaint.location.district === user.location.district &&
                   complaint.location.block === user.location.block;
          } else if (user.designation === 'District') {
            // District official: complaints in their district
            return complaint.location.state === user.location.state &&
                   complaint.location.district === user.location.district;
          } else if (user.designation === 'State') {
            // State official: complaints in their state
            return complaint.location.state === user.location.state;
          }
          
          return false;
        });
      }
      
      // Filter users by location - only show users in same geographic area
      let filteredUsers = usersRes.data;
      
      // Owner can see ALL users - no location filtering
      if (user?.designation !== 'Owner' && user?.location) {
        const { designation, location } = user;
        
        filteredUsers = usersRes.data.filter(u => {
          if (!u.location) return false;
          
          // Match based on official's designation level
          if (designation === 'Block') {
            // Block official: only users in same block
            return u.location.state === location.state &&
                   u.location.district === location.district &&
                   u.location.block === location.block;
          } else if (designation === 'District') {
            // District official: users in same district (all blocks)
            return u.location.state === location.state &&
                   u.location.district === location.district;
          } else if (designation === 'State') {
            // State official: users in same state (all districts/blocks)
            return u.location.state === location.state;
          }
          
          return false;
        });
      }
      
      setComplaints(activeComplaints);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedComplaint) {
      toast.error('Please select a complaint');
      return;
    }
    
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setSending(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Send validation requests to all selected users
      for (const userId of selectedUsers) {
        try {
          await validationAPI.createRequest({
            complaintId: selectedComplaint,
            officialId: user.id,
            targetUserId: userId,
            message: message || 'Please validate this complaint'
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to send to user ${userId}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Sent ${successCount} validation request(s) successfully!`);
      }
      
      if (failCount > 0) {
        toast.error(`Failed to send ${failCount} request(s)`);
      }

      // Reset form
      setSelectedComplaint('');
      setSelectedUsers([]);
      setMessage('');
    } catch (error) {
      console.error('Error sending validation requests:', error);
      toast.error('Failed to send validation requests');
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Send className="h-6 w-6 text-primary" />
          Send Validation Requests
        </h2>

        {/* Location Info */}
        {user?.designation === 'Owner' ? (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-900">
              <span className="font-semibold">👑 Owner Access:</span> You can see all users across all locations
            </p>
          </div>
        ) : user?.location && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Your jurisdiction:</span> {user.location.state}
              {user.designation === 'Block' && ` > ${user.location.district} > ${user.location.block}`}
              {user.designation === 'District' && ` > ${user.location.district}`}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              ✓ Showing only users within your geographic area
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Complaint */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Complaint *</label>
            <select
              value={selectedComplaint}
              onChange={(e) => setSelectedComplaint(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Choose a complaint...</option>
              {complaints.map(complaint => (
                <option key={complaint._id} value={complaint._id}>
                  {complaint.title} - {complaint.category} ({complaint.status})
                </option>
              ))}
            </select>
            {complaints.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No active complaints available for validation
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2">Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Add a custom message for the validation request..."
            />
          </div>

          {/* Select Users */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Users *</label>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Selected Users Count */}
            {selectedUsers.length > 0 && (
              <div className="mb-3 flex items-center gap-2 text-sm text-primary">
                <User className="h-4 w-4" />
                <span>{selectedUsers.length} user(s) selected</span>
                <button
                  type="button"
                  onClick={() => setSelectedUsers([])}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Users List */}
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No users found matching your search' : 'No users available in your location'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map(u => (
                    <label
                      key={u._id}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition ${
                        selectedUsers.includes(u._id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u._id)}
                        onChange={() => toggleUserSelection(u._id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                        {u.location && (
                          <p className="text-xs text-gray-400 mt-1">
                            📍 {u.location.block}, {u.location.district}, {u.location.state}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={sending || !selectedComplaint || selectedUsers.length === 0}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="h-5 w-5" />
              {sending ? 'Sending...' : `Send to ${selectedUsers.length} User(s)`}
            </button>
          </div>
        </form>
      </div>

      {/* Selected Complaint Preview */}
      {selectedComplaint && (
        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Selected Complaint Preview:</h3>
          {complaints.find(c => c._id === selectedComplaint) && (
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">
                {complaints.find(c => c._id === selectedComplaint).title}
              </h4>
              <p className="text-gray-700 mb-3">
                {complaints.find(c => c._id === selectedComplaint).description}
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {complaints.find(c => c._id === selectedComplaint).category}
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                  {complaints.find(c => c._id === selectedComplaint).status}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidationRequestForm;
