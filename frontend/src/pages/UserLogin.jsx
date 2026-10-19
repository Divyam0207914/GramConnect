import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Shield } from 'lucide-react';

const UserLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'citizen') {
        navigate('/dashboard', { replace: true });
      } else if (user.role === 'official') {
        navigate('/admin/dashboard', { replace: true });
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
      const response = await api.post('/users/login', formData);
      login(response.data.token);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
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
        background: 'linear-gradient(180deg, #FFF8EE 0%, #FFFFFF 100%)',
        fontFamily: 'Poppins, Inter, sans-serif'
      }}
    >
      <div className="max-w-md w-full">
        {/* Unified Auth Card */}
        <div 
          className="bg-white p-10 space-y-8 transition-all duration-300"
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(11,37,69,0.1)'
          }}
        >
          {/* Toggle Pills */}
          <div 
            className="flex p-1.5 rounded-xl"
            style={{ 
              background: 'rgba(11,37,69,0.05)'
            }}
          >
            <Link
              to="/login"
              className="flex-1 py-3 px-4 text-center font-[600] text-sm rounded-lg transition-all duration-300"
              style={{
                background: '#0B2545',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(11,37,69,0.15)'
              }}
            >
              {t('login')}
            </Link>
            <Link
              to="/register"
              className="flex-1 py-3 px-4 text-center font-[600] text-sm rounded-lg transition-all duration-300"
              style={{
                background: 'transparent',
                color: '#6B7280'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0B2545'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              {t('signUp')}
            </Link>
          </div>

          {/* Icon & Title */}
          <div className="text-center">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-all duration-300"
              style={{ 
                background: 'linear-gradient(135deg, rgba(11,37,69,0.1) 0%, rgba(11,37,69,0.15) 100%)'
              }}
            >
              <User className="h-8 w-8" style={{ color: '#0B2545' }} />
            </div>
            <h2 
              className="text-3xl font-[800] mb-2" 
              style={{ 
                color: '#0B2545',
                letterSpacing: '-0.02em'
              }}
            >
              {t('welcomeBack')}
            </h2>
            <p 
              className="text-base font-[500]" 
              style={{ color: '#556168' }}
            >
              {t('signInDesc')}
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label 
                htmlFor="email-address" 
                className="block text-sm font-[600] mb-2"
                style={{ color: '#0B2545' }}
              >
                {t('emailAddress')}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 text-base transition-all duration-200"
                placeholder={t('enterEmail')}
                value={formData.email}
                onChange={handleChange}
                style={{
                  border: '2px solid rgba(11,37,69,0.1)',
                  borderRadius: '10px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0B2545'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(11,37,69,0.1)'}
              />
            </div>
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-[600] mb-2"
                style={{ color: '#0B2545' }}
              >
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 text-base transition-all duration-200"
                placeholder={t('enterPassword')}
                value={formData.password}
                onChange={handleChange}
                style={{
                  border: '2px solid rgba(11,37,69,0.1)',
                  borderRadius: '10px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0B2545'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(11,37,69,0.1)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 text-base font-[600] rounded-xl transition-all duration-300"
              style={{
                background: '#0B2545',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(11,37,69,0.2)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#F89820';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(248,152,32,0.25)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0B2545';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(11,37,69,0.2)';
              }}
            >
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          {/* Admin Link */}
          <div className="text-center pt-4 border-t" style={{ borderColor: 'rgba(11,37,69,0.1)' }}>
            <p className="text-sm font-[500]" style={{ color: '#6B7280' }}>
              {t('areYouOfficial')}{' '}
              <Link 
                to="/admin/login" 
                className="font-[600] transition-colors duration-200"
                style={{ color: '#F89820' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0B2545'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#F89820'}
              >
                {t('loginHere')}
              </Link>
            </p>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="text-center mt-6">
          <p className="text-sm font-[500]" style={{ color: '#6B7280' }}>
            <span style={{ color: '#0B2545', fontWeight: 700 }}>Gram</span>
            <span style={{ color: '#F89820', fontWeight: 700 }}>Connect</span>
            {' '}— {t('empoweringRural')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
