import React, { useState, useEffect } from 'react';
import { validationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, MessageSquare, WifiOff } from 'lucide-react';

const ValidationRequests = () => {
  const { user } = useAuth();
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedValidation, setSelectedValidation] = useState(null);
  const [response, setResponse] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    fetchValidations();
    
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchValidations = async () => {
    try {
      const response = await validationAPI.getPending(user.id);
      setValidations(response.data.validations || []);
    } catch (error) {
      console.error('Error fetching validations:', error);
      // Show appropriate message based on online status
      if (!navigator.onLine) {
        toast.error('You are offline. Validation requests will load when you reconnect.');
      } else {
        toast.error('Failed to load validation requests. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    
    // Check if this is a notification (no complaint, just snapshot)
    const isNotification = !selectedValidation.complaint && selectedValidation.complaintSnapshot;
    
    if (!isNotification && !response) {
      toast.error('Please select approve or reject');
      return;
    }

    setSubmitting(true);
    try {
      const result = await validationAPI.submitResponse({
        validationId: selectedValidation._id,
        userId: user.id,
        response: isNotification ? 'approve' : response,  // Auto-approve for notifications
        comments: comments
      });

      if (isNotification) {
        toast.success('Notification acknowledged');
      } else {
        if (result.data.offline) {
          toast.success(result.data.message, { duration: 5000 });
        } else {
          toast.success(result.data.message || 'Response submitted successfully!');
        }
      }

      setSelectedValidation(null);
      setResponse('');
      setComments('');
      fetchValidations(); // Refresh the list
    } catch (error) {
      console.error('Error submitting response:', error);
      if (!navigator.onLine) {
        toast.error('You are offline. Your response will be saved and synced when you reconnect.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to submit response');
      }
    } finally {
      setSubmitting(false);
    }
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
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <WifiOff className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-amber-800 font-medium">You are currently offline</p>
            <p className="text-amber-700 text-sm">Your responses will be saved and synced when you reconnect.</p>
          </div>
        </div>
      )}
      
      {validations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No pending validation requests</p>
          {!isOnline && (
            <p className="text-gray-400 text-sm mt-2">You are offline. Check your connection to see if there are requests.</p>
          )}
        </div>
      ) : (
        validations.map((validation) => (
          <div
            key={validation._id}
            className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {validation.complaint?.title || validation.complaintSnapshot?.title || 'Complaint (Removed)'}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {validation.complaint?.description || validation.complaintSnapshot?.description || 'Complaint has been removed'}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MessageSquare className="h-4 w-4" />
                  <span className="italic">{validation.message}</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setSelectedValidation(validation)}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Respond
              </button>
            </div>
          </div>
        ))
      )}

      {/* Response Modal */}
      {selectedValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Validation Request</h2>
              <button 
                onClick={() => {
                  setSelectedValidation(null);
                  setResponse('');
                  setComments('');
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Offline indicator in modal */}
              {!isOnline && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-amber-600" />
                  <span className="text-amber-800 text-sm">Offline mode: Your response will be saved locally</span>
                </div>
              )}
              
              {/* Complaint Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  {selectedValidation.complaint?.title || selectedValidation.complaintSnapshot?.title || 'Complaint (Removed)'}
                </h3>
                <p className="text-gray-700 mb-3">
                  {selectedValidation.complaint?.description || selectedValidation.complaintSnapshot?.description || 'Complaint has been removed from the system'}
                </p>
                {(selectedValidation.complaint || selectedValidation.complaintSnapshot) && (
                  <div className="flex gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {selectedValidation.complaint?.category || selectedValidation.complaintSnapshot?.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      {selectedValidation.complaint?.status || selectedValidation.complaintSnapshot?.status || 'removed'}
                    </span>
                  </div>
                )}
              </div>

              {/* Request Message */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Request from Official:</h4>
                <p className="text-gray-700 italic">"{selectedValidation.message}"</p>
              </div>

              {/* Response Form */}
              <form onSubmit={handleSubmitResponse} className="space-y-4">
                {/* Check if this is a notification (no complaint, just snapshot) */}
                {!selectedValidation.complaint && selectedValidation.complaintSnapshot ? (
                  // Notification - just show acknowledge button
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <p className="text-sm text-amber-800 mb-3">
                      ℹ️ This is a system notification about your complaint that was removed. No action is required from you.
                    </p>
                    <div>
                      <label className="block text-sm font-medium mb-2">Add a comment (Optional)</label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows="3"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Add any comments if needed..."
                      />
                    </div>
                  </div>
                ) : (
                  // Normal validation - show approve/reject buttons
                  <div>
                    <label className="block text-sm font-medium mb-3">Your Response *</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setResponse('approve')}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 transition ${
                          response === 'approve' 
                            ? 'bg-green-50 border-green-500 text-green-700' 
                            : 'border-gray-300 hover:border-green-300'
                        }`}
                      >
                        <CheckCircle className="h-5 w-5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setResponse('reject')}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 transition ${
                          response === 'reject' 
                            ? 'bg-red-50 border-red-500 text-red-700' 
                            : 'border-gray-300 hover:border-red-300'
                        }`}
                      >
                        <XCircle className="h-5 w-5" />
                        Reject
                      </button>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows="4"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Add any additional comments..."
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting || (!selectedValidation.complaint && !selectedValidation.complaintSnapshot ? !response : false)}
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 
                      (!selectedValidation.complaint && selectedValidation.complaintSnapshot ? 'Acknowledge & Dismiss' : 
                       !isOnline ? 'Save for Later' : 'Submit Response')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedValidation(null);
                      setResponse('');
                      setComments('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationRequests;