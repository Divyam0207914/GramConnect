import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { officialAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { getStates, getDistricts, getBlocks } from '../data/locations';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    designation: '',
    state: '',
    district: '',
    block: ''
  });
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'official') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'citizen') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Update cascading dropdowns
    if (name === 'state') {
      setDistricts(getDistricts(value));
      setBlocks([]);
      setFormData(prev => ({ ...prev, state: value, district: '', block: '' }));
    } else if (name === 'district') {
      setBlocks(getBlocks(formData.state, value));
      setFormData(prev => ({ ...prev, district: value, block: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        location: {
          state: formData.state,
          district: formData.designation === 'State' ? '' : formData.district,
          block: formData.designation === 'Block' ? formData.block : ''
        }
      };
      await officialAPI.register(payload);
      toast.success('Official account created successfully! Please log in.');
      navigate('/admin/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" 
      style={{ 
        background: 'linear-gradient(180deg, #F5F7FA 0%, #FFFFFF 100%)',
        fontFamily: 'Poppins, Inter, sans-serif'
      }}
    >
      <div className="max-w-md w-full">
        {/* Admin Auth Card */}
        <div 
          className="bg-white space-y-8 transition-all duration-240 ease-out"
          style={{
            padding: '48px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(16,24,40,0.06)'
          }}
        >
          {/* Toggle Pills */}
          <div 
            className="flex p-1.5 rounded-lg"
            style={{ 
              background: 'rgba(217,119,6,0.06)',
              border: '1px solid rgba(217,119,6,0.12)'
            }}
          >
            <Link
              to="/admin/login"
              className="flex-1 py-3 px-4 text-center font-[600] text-sm rounded-md transition-all duration-200"
              style={{
                background: 'transparent',
                color: '#6B7280',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#D97706';
                e.currentTarget.style.borderColor = 'rgba(217,119,6,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6B7280';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              Admin Login
            </Link>
            <Link
              to="/admin/register"
              className="flex-1 py-3 px-4 text-center font-[600] text-sm rounded-md transition-all duration-200"
              style={{
                background: '#D97706',
                color: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(217,119,6,0.15)'
              }}
            >
              Admin Register
            </Link>
          </div>

          {/* Icon & Title */}
          <div className="text-center">
            <div 
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
              style={{ 
                background: 'linear-gradient(135deg, rgba(217,119,6,0.1) 0%, rgba(217,119,6,0.15) 100%)'
              }}
            >
              <ShieldCheck className="h-7 w-7" style={{ color: '#D97706' }} />
            </div>
            <h2 
              className="text-3xl font-[800] mb-2" 
              style={{ 
                color: '#0B2545',
                letterSpacing: '-0.01em',
                lineHeight: '1.2'
              }}
            >
              Official Registration
            </h2>
            <p 
              className="text-base font-[500]" 
              style={{ 
                color: '#64748B',
                lineHeight: '1.5'
              }}
            >
              Create an official account to manage complaints
            </p>
          </div>

          {/* Registration Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-[600] mb-2"
                style={{ color: '#1E293B' }}
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 text-base transition-all duration-160"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  border: '2px solid rgba(217,119,6,0.15)',
                  borderRadius: '8px',
                  outline: 'none',
                  color: '#1E293B'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#D97706';
                  e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(217,119,6,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-[600] mb-2"
                style={{ color: '#1E293B' }}
              >
                Official Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 text-base transition-all duration-160"
                placeholder="your.email@gov.in"
                value={formData.email}
                onChange={handleChange}
                style={{
                  border: '2px solid rgba(217,119,6,0.15)',
                  borderRadius: '8px',
                  outline: 'none',
                  color: '#1E293B'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#D97706';
                  e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(217,119,6,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-[600] mb-2"
                style={{ color: '#1E293B' }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 text-base transition-all duration-160"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  border: '2px solid rgba(217,119,6,0.15)',
                  borderRadius: '8px',
                  outline: 'none',
                  color: '#1E293B'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#D97706';
                  e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(217,119,6,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label 
                htmlFor="phone" 
                className="block text-sm font-[600] mb-2"
                style={{ color: '#1E293B' }}
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="w-full px-4 py-3 text-base transition-all duration-160"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  border: '2px solid rgba(217,119,6,0.15)',
                  borderRadius: '8px',
                  outline: 'none',
                  color: '#1E293B'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#D97706';
                  e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(217,119,6,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label 
                htmlFor="department" 
                className="block text-sm font-[600] mb-2"
                style={{ color: '#1E293B' }}
              >
                Department
              </label>
              <select
                id="department"
                name="department"
                required
                className="w-full px-4 py-3 text-base transition-all duration-160"
                value={formData.department}
                onChange={handleChange}
                style={{
                  border: '2px solid rgba(217,119,6,0.15)',
                  borderRadius: '8px',
                  outline: 'none',
                  color: '#1E293B'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#D97706';
                  e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(217,119,6,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Select Department</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Public Works">Public Works</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label 
                htmlFor="designation" 
                className="block text-sm font-[600] mb-2"
                style={{ color: '#1E293B' }}
              >
                Designation
              </label>
              <select
                id="designation"
                name="designation"
                required
                className="w-full px-4 py-3 text-base transition-all duration-160"
                value={formData.designation}
                onChange={handleChange}
                style={{
                  border: '2px solid rgba(217,119,6,0.15)',
                  borderRadius: '8px',
                  outline: 'none',
                  color: '#1E293B'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#D97706';
                  e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(217,119,6,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Select Designation</option>
                <option value="Block">Block</option>
                <option value="District">District</option>
                <option value="State">State</option>
              </select>
            </div>

            {/* Location Fields */}
            <div 
              className="border-t pt-4" 
              style={{ borderColor: 'rgba(217,119,6,0.12)' }}
            >
              <p 
                className="text-sm font-[600] mb-3" 
                style={{ color: '#1E293B' }}
              >
                Jurisdiction Location
              </p>
              <div className="space-y-3">
                <div>
                  <label 
                    htmlFor="state" 
                    className="block text-sm font-[600] mb-2"
                    style={{ color: '#1E293B' }}
                  >
                    State
                  </label>
                  <select
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base transition-all duration-160"
                    style={{
                      border: '2px solid rgba(217,119,6,0.15)',
                      borderRadius: '8px',
                      outline: 'none',
                      color: '#1E293B'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#D97706';
                      e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(217,119,6,0.15)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select State</option>
                    {getStates().map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                {formData.designation !== 'State' && (
                  <div>
                    <label 
                      htmlFor="district" 
                      className="block text-sm font-[600] mb-2"
                      style={{ color: '#1E293B' }}
                    >
                      District
                    </label>
                    <select
                      id="district"
                      name="district"
                      required={formData.designation !== 'State'}
                      value={formData.district}
                      onChange={handleChange}
                      disabled={!formData.state}
                      className="w-full px-4 py-3 text-base transition-all duration-160"
                      style={{
                        border: '2px solid rgba(217,119,6,0.15)',
                        borderRadius: '8px',
                        outline: 'none',
                        color: '#1E293B',
                        backgroundColor: !formData.state ? '#F3F4F6' : '#FFFFFF'
                      }}
                      onFocus={(e) => {
                        if (formData.state) {
                          e.target.style.borderColor = '#D97706';
                          e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)';
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(217,119,6,0.15)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Select District</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {formData.designation === 'Block' && (
                  <div>
                    <label 
                      htmlFor="block" 
                      className="block text-sm font-[600] mb-2"
                      style={{ color: '#1E293B' }}
                    >
                      Block
                    </label>
                    <select
                      id="block"
                      name="block"
                      required={formData.designation === 'Block'}
                      value={formData.block}
                      onChange={handleChange}
                      disabled={!formData.district}
                      className="w-full px-4 py-3 text-base transition-all duration-160"
                      style={{
                        border: '2px solid rgba(217,119,6,0.15)',
                        borderRadius: '8px',
                        outline: 'none',
                        color: '#1E293B',
                        backgroundColor: !formData.district ? '#F3F4F6' : '#FFFFFF'
                      }}
                      onFocus={(e) => {
                        if (formData.district) {
                          e.target.style.borderColor = '#D97706';
                          e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)';
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(217,119,6,0.15)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Select Block</option>
                      {blocks.map(block => (
                        <option key={block} value={block}>{block}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <p className="text-xs font-[500]" style={{ color: '#64748B' }}>
                  {formData.designation === 'State' && 'State officials see entire state'}
                  {formData.designation === 'District' && 'District officials see all blocks in the district'}
                  {formData.designation === 'Block' && 'Block officials see only their block'}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-[700] text-base tracking-wide transition-all duration-200"
              style={{
                background: '#D97706',
                color: '#FFFFFF',
                padding: '14px 24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(217,119,6,0.2)',
                height: '48px',
                marginTop: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#0B2545';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(11,37,69,0.15)';
                  e.currentTarget.style.filter = 'brightness(1.08)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#D97706';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(217,119,6,0.2)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              {loading ? 'Creating account...' : 'Create Official Account'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center pt-5 border-t" style={{ borderColor: 'rgba(217,119,6,0.12)' }}>
            <p className="text-sm font-[500]" style={{ color: '#64748B' }}>
              Already have an account?{' '}
              <Link 
                to="/admin/login" 
                className="font-[600] transition-all duration-200 hover:underline"
                style={{ color: '#0B2545' }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="text-center mt-6">
          <p className="text-sm font-[500]" style={{ color: '#64748B' }}>
            <span style={{ color: '#0B2545', fontWeight: 700 }}>Gram</span>
            <span style={{ color: '#D97706', fontWeight: 700 }}>Connect</span>
            {' '}Government Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
