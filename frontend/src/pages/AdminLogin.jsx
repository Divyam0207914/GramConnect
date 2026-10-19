import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/officials/login', formData);
      login(response.data.token);
      toast.success('Logged in successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
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
              background: 'rgba(15,35,70,0.04)',
              border: '1px solid rgba(15,35,70,0.08)'
            }}
          >
            <Link
              to="/admin/login"
              className="flex-1 py-3 px-4 text-center font-[600] text-sm rounded-md transition-all duration-200"
              style={{
                background: '#0B2545',
                color: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(11,37,69,0.12)'
              }}
            >
              Admin Login
            </Link>
            <Link
              to="/admin/register"
              className="flex-1 py-3 px-4 text-center font-[600] text-sm rounded-md transition-all duration-200"
              style={{
                background: 'transparent',
                color: '#6B7280',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0B2545';
                e.currentTarget.style.borderColor = 'rgba(11,37,69,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6B7280';
                e.currentTarget.style.borderColor = 'transparent';
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
                background: 'linear-gradient(135deg, rgba(11,37,69,0.08) 0%, rgba(11,37,69,0.12) 100%)'
              }}
            >
              <Shield className="h-7 w-7" style={{ color: '#0B2545' }} />
            </div>
            <h2 
              className="text-3xl font-[800] mb-2" 
              style={{ 
                color: '#0B2545',
                letterSpacing: '-0.01em',
                lineHeight: '1.2'
              }}
            >
              Official Access
            </h2>
            <p 
              className="text-base font-[500]" 
              style={{ 
                color: '#64748B',
                lineHeight: '1.5'
              }}
            >
              Secure login for government officials
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-[600] mb-2"
                style={{ color: '#1E293B' }}
              >
                Official Email Address
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
                  border: '2px solid rgba(15,35,70,0.12)',
                  borderRadius: '8px',
                  outline: 'none',
                  color: '#1E293B'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0B2545';
                  e.target.style.boxShadow = '0 0 0 3px rgba(11,37,69,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(15,35,70,0.12)';
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  border: '2px solid rgba(15,35,70,0.12)',
                  borderRadius: '8px',
                  outline: 'none',
                  color: '#1E293B'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0B2545';
                  e.target.style.boxShadow = '0 0 0 3px rgba(11,37,69,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(15,35,70,0.12)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-[700] text-base tracking-wide transition-all duration-200"
              style={{
                background: '#0B2545',
                color: '#FFFFFF',
                padding: '14px 24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(11,37,69,0.15)',
                height: '48px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#D97706';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(217,119,6,0.2)';
                  e.currentTarget.style.filter = 'brightness(1.08)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0B2545';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(11,37,69,0.15)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center pt-5 border-t" style={{ borderColor: 'rgba(15,35,70,0.08)' }}>
            <p className="text-sm font-[500]" style={{ color: '#64748B' }}>
              Citizen user?{' '}
              <Link 
                to="/login" 
                className="font-[600] transition-all duration-200 hover:underline"
                style={{ color: '#D97706' }}
              >
                Login here
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

export default AdminLogin;
