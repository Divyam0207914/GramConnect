import React, { useState, useEffect } from 'react';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Tag, Eye, WifiOff } from 'lucide-react';
import { getComplaintsFromDB } from '../utils/indexedDB.js';

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

const ComplaintsList = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getAll();
      let userComplaints = [];
      
      // Filter user's complaints from server
      if (Array.isArray(response.data)) {
        userComplaints = response.data.filter(
          c => c.submittedBy && (c.submittedBy._id === user.id || c.submittedBy === user.id)
        );
      }

      // Get offline complaints from IndexedDB
      try {
        const offlineComplaints = await getComplaintsFromDB();
        const userOfflineComplaints = offlineComplaints.filter(
          c => !c.synced && (c.submittedBy === user.id || c.submittedBy?._id === user.id)
        );

        // Merge offline complaints (mark them as offline)
        const mergedComplaints = [
          ...userComplaints,
          ...userOfflineComplaints.map(c => ({
            ...c,
            _id: c.tempId || c.id,
            offline: true,
            status: c.status || 'submitted',
            submittedBy: { _id: user.id, name: user.name }
          }))
        ];

        setComplaints(mergedComplaints);
      } catch (dbError) {
        console.error('Error fetching offline complaints:', dbError);
        setComplaints(userComplaints);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      
      // Try to load from IndexedDB as fallback
      try {
        const offlineComplaints = await getComplaintsFromDB();
        const userOfflineComplaints = offlineComplaints.filter(
          c => !c.synced && (c.submittedBy === user.id || c.submittedBy?._id === user.id)
        );
        setComplaints(userOfflineComplaints.map(c => ({
          ...c,
          _id: c.tempId || c.id,
          offline: true,
          status: c.status || 'submitted',
          submittedBy: { _id: user.id, name: user.name }
        })));
      } catch (dbError) {
        toast.error('Failed to load complaints');
      }
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">You haven't filed any complaints yet.</p>
        </div>
      ) : (
        complaints.map((complaint) => (
          <div
            key={complaint._id}
            className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelectedComplaint(complaint)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
              <div className="flex gap-2">
                {complaint.offline && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex items-center gap-1">
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                  {complaint.status.replace('_', ' ')}
                </span>
                {complaint.communityValidated && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                    ✓ Validated
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{complaint.description}</p>

            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span className={`flex items-center gap-1 px-2 py-1 rounded ${getCategoryColor(complaint.category)}`}>
                <Tag className="h-4 w-4" />
                {complaint.category}
              </span>
              
              {complaint.location?.coordinates?.lat && complaint.location?.coordinates?.lng && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {complaint.location.coordinates.lat.toFixed(4)}, {complaint.location.coordinates.lng.toFixed(4)}
                </span>
              )}

              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))
      )}

      {/* Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Complaint Details</h2>
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{selectedComplaint.title}</h3>
                <div className="flex gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedComplaint.category)}`}>
                    {selectedComplaint.category}
                  </span>
                  {selectedComplaint.communityValidated && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                      ✓ Community Validated
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

              {selectedComplaint.location && (
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <div className="text-gray-700 space-y-1">
                    <p><span className="font-semibold">State:</span> {selectedComplaint.location.state}</p>
                    <p><span className="font-semibold">District:</span> {selectedComplaint.location.district}</p>
                    <p><span className="font-semibold">Block:</span> {selectedComplaint.location.block}</p>
                    {selectedComplaint.location.coordinates?.lat && selectedComplaint.location.coordinates?.lng && (
                      <p><span className="font-semibold">GPS:</span> {selectedComplaint.location.coordinates.lat.toFixed(4)}, {selectedComplaint.location.coordinates.lng.toFixed(4)}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-semibold">Submitted By:</span> {selectedComplaint.submittedBy?.name || user?.name || 'You'}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {selectedComplaint.submittedBy?.email || user?.email || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold">Created:</span> {new Date(selectedComplaint.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Last Updated:</span> {new Date(selectedComplaint.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsList;
