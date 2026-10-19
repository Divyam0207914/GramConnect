import React, { useState } from 'react';
import { complaintAPI } from '../services/api';
import toast from 'react-hot-toast';
import { X, Upload, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../hooks/useOffline';

const ComplaintForm = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const { online } = useOffline();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    location: { lat: '', lng: '' },
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const categories = [
    { value: 'water', label: 'Water Supply' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'roads', label: 'Roads & Infrastructure' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lat' || name === 'lng') {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude.toString(),
              lng: position.coords.longitude.toString()
            }
          }));
          toast.success('Location captured successfully!');
          setGettingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Failed to get location. Please enable location access.');
          setGettingLocation(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('submittedBy', user.id);
      
      // Use user's location data if available, otherwise use default
      const locationData = {
        state: user?.location?.state || 'Delhi',
        district: user?.location?.district || 'Central Delhi',
        block: user?.location?.block || 'Connaught Place',
        pincode: user?.location?.pincode || '',
        coordinates: {}
      };
      
      // Add GPS coordinates if provided
      if (formData.location.lat && formData.location.lng) {
        locationData.coordinates.lat = parseFloat(formData.location.lat);
        locationData.coordinates.lng = parseFloat(formData.location.lng);
      }
      
      data.append('location', JSON.stringify(locationData));
      
      if (image) {
        data.append('image', image);
      }

      const response = await complaintAPI.create(data);
      
      if (response.data.offline) {
        toast.success(response.data.message, { duration: 5000 });
      } else {
        toast.success(response.data.message || 'Complaint submitted successfully!');
      }
      
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error(error.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">File a New Complaint</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Debug Info - Show user location */}
        {(!user?.location || !user.location.state) && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800">
            <p className="font-semibold">⚠️ Location Data Missing</p>
            <p className="text-sm mt-1">Your profile is missing location information. Please:</p>
            <ol className="text-sm mt-2 ml-4 list-decimal">
              <li>Logout from your account</li>
              <li>Login again to refresh your session</li>
              <li>If problem persists, re-register your account</li>
            </ol>
            <p className="text-xs mt-2 text-gray-600">Debug: {JSON.stringify(user?.location || 'No location data')}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Detailed description of the complaint..."
            />
          </div>

          {/* Inherited Location Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Complaint Location
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><span className="font-semibold">State:</span> {user?.location?.state || 'Delhi'}</p>
              <p><span className="font-semibold">District:</span> {user?.location?.district || 'Central Delhi'}</p>
              <p><span className="font-semibold">Block:</span> {user?.location?.block || 'Connaught Place'}</p>
              <p className="text-xs text-blue-600 mt-2">
                ✓ This location will be automatically used for your complaint
              </p>
            </div>
          </div>

          {/* Optional GPS Coordinates */}
          <div>
            <label className="block text-sm font-medium mb-2">
              GPS Coordinates (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Add precise GPS location if needed. You can use your current location or enter manually.
            </p>
            
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="mb-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <MapPin className="h-4 w-4" />
              {gettingLocation ? 'Getting Location...' : 'Use My Current Location'}
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                <input
                  type="number"
                  name="lat"
                  value={formData.location.lat}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="e.g., 12.9716"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                <input
                  type="number"
                  name="lng"
                  value={formData.location.lng}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="e.g., 77.5946"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Upload className="inline h-4 w-4 mr-1" />
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {image && (
              <div className="mt-2">
                <p className="text-sm text-green-600">Selected: {image.name}</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;