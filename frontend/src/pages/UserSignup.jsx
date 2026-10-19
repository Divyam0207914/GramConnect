import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Shield } from 'lucide-react';
import { getStates, getDistricts, getBlocks } from '../data/locations';

const UserSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    state: '',
    district: '',
    block: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const { user } = useAuth();
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
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: 'citizen',
        location: {
          state: formData.state,
          district: formData.district,
          block: formData.block,
          pincode: formData.pincode
        }
      };
      await api.post('/users/register', payload);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
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
              background: 'rgba(248,152,32,0.08)'
            }}
          >
            <Link
              to="/login"
              className="flex-1 py-3 px-4 text-center font-[600] text-sm rounded-lg transition-all duration-300"
              style={{
                background: 'transparent',
                color: '#6B7280'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#F89820'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              {t('login')}
            </Link>
            <Link
              to="/register"
              className="flex-1 py-3 px-4 text-center font-[600] text-sm rounded-lg transition-all duration-300"
              style={{
                background: '#F89820',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(248,152,32,0.2)'
              }}
            >
              {t('signUp')}
            </Link>
          </div>

          {/* Icon & Title */}
          <div className="text-center">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-all duration-300"
              style={{ 
                background: 'linear-gradient(135deg, rgba(248,152,32,0.1) 0%, rgba(248,152,32,0.2) 100%)'
              }}
            >
              <UserPlus className="h-8 w-8" style={{ color: '#F89820' }} />
            </div>
            <h2 
              className="text-3xl font-[800] mb-2" 
              style={{ 
                color: '#0B2545',
                letterSpacing: '-0.02em'
              }}
            >
              {t('createAccount')}
            </h2>
            <p 
              className="text-base font-[500]" 
              style={{ color: '#556168' }}
            >
              {t('signUpDesc')}
            </p>
          </div>

          {/* Signup Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-[600] mb-2"
                style={{ color: '#0B2545' }}
              >
                {t('fullName')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 text-base transition-all duration-200"
                placeholder={t('enterFullName')}
                value={formData.name}
                onChange={handleChange}
                style={{
                  border: '2px solid rgba(248,152,32,0.15)',
                  borderRadius: '10px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#F89820'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(248,152,32,0.15)'}
              />
            </div>
            <div>
              <label 
                htmlFor="phone" 
                className="block text-sm font-[600] mb-2"
                style={{ color: '#0B2545' }}
              >
                {t('phoneNumber')}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="w-full px-4 py-3 text-base transition-all duration-200"
                placeholder={t('enterPhone')}
                value={formData.phone}
                onChange={handleChange}
                style={{
                  border: '2px solid rgba(248,152,32,0.15)',
                  borderRadius: '10px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#F89820'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(248,152,32,0.15)'}
              />
            </div>
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-[600] mb-2"
                style={{ color: '#0B2545' }}
              >
                {t('emailAddress')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 text-base transition-all duration-200"
                placeholder={t('enterEmail')}
                value={formData.email}
                onChange={handleChange}
                style={{
                  border: '2px solid rgba(248,152,32,0.15)',
                  borderRadius: '10px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#F89820'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(248,152,32,0.15)'}
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
                required
                className="w-full px-4 py-3 text-base transition-all duration-200"
                placeholder={t('createPassword')}
                value={formData.password}
                onChange={handleChange}
                style={{
                  border: '2px solid rgba(248,152,32,0.15)',
                  borderRadius: '10px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#F89820'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(248,152,32,0.15)'}
              />
            </div>

            {/* Location Fields */}
            <div className="border-t pt-4" style={{ borderColor: 'rgba(248,152,32,0.1)' }}>
              <p className="text-sm font-[600] mb-3" style={{ color: '#0B2545' }}>{t('locationDetails')}</p>
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="state" 
                    className="block text-xs font-[600] mb-1.5"
                    style={{ color: '#556168' }}
                  >
                    {t('state')}
                  </label>
                  <select
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base transition-all duration-200"
                    style={{
                      border: '2px solid rgba(248,152,32,0.15)',
                      borderRadius: '10px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#F89820'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(248,152,32,0.15)'}
                  >
                    <option value="">{t('selectState')}</option>
                    {getStates().map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label 
                    htmlFor="district" 
                    className="block text-xs font-[600] mb-1.5"
                    style={{ color: '#556168' }}
                  >
                    {t('district')}
                  </label>
                  <select
                    id="district"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!formData.state}
                    className="w-full px-4 py-3 text-base transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    style={{
                      border: '2px solid rgba(248,152,32,0.15)',
                      borderRadius: '10px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#F89820'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(248,152,32,0.15)'}
                  >
                    <option value="">{t('selectDistrict')}</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label 
                    htmlFor="block" 
                    className="block text-xs font-[600] mb-1.5"
                    style={{ color: '#556168' }}
                  >
                    {t('block')}
                  </label>
                  <select
                    id="block"
                    name="block"
                    required
                    value={formData.block}
                    onChange={handleChange}
                    disabled={!formData.district}
                    className="w-full px-4 py-3 text-base transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    style={{
                      border: '2px solid rgba(248,152,32,0.15)',
                      borderRadius: '10px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#F89820'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(248,152,32,0.15)'}
                  >
                    <option value="">{t('selectBlock')}</option>
                    {blocks.map(block => (
                      <option key={block} value={block}>{block}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label 
                    htmlFor="pincode" 
                    className="block text-xs font-[600] mb-1.5"
                    style={{ color: '#556168' }}
                  >
                    {t('pincode')}
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    placeholder={t('enterPincode')}
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base transition-all duration-200"
                    style={{
                      border: '2px solid rgba(248,152,32,0.15)',
                      borderRadius: '10px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#F89820'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(248,152,32,0.15)'}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 text-base font-[600] rounded-xl transition-all duration-500 ease-in-out"
              style={{
                background: '#F89820',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(248,152,32,0.25)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #F89820 0%, #f5a842 100%)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(248,152,32,0.35)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F89820';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(248,152,32,0.25)';
              }}
            >
              {loading ? t('creatingAccount') : t('createAccount')}
            </button>
          </form>

          {/* Admin Link */}
          <div className="text-center pt-4 border-t" style={{ borderColor: 'rgba(248,152,32,0.1)' }}>
            <p className="text-sm font-[500]" style={{ color: '#6B7280' }}>
              {t('areYouOfficial')}{' '}
              <Link 
                to="/admin/register" 
                className="font-[600] transition-colors duration-200"
                style={{ color: '#0B2545' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#F89820'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#0B2545'}
              >
                {t('registerHere')}
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

export default UserSignup;
