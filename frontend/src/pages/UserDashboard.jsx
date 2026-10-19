import React, { useState, useEffect } from 'react';
import { FilePlus, List, Mail, BarChart2, ChevronRight, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validationAPI } from '../services/api';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintsList from '../components/ComplaintsList';
import ValidationRequests from '../components/ValidationRequests';
import DepartmentGuide from '../components/DepartmentGuide';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [pendingValidationsCount, setPendingValidationsCount] = useState(0);

  useEffect(() => {
    fetchPendingValidations();
  }, []);

  const fetchPendingValidations = async () => {
    try {
      const response = await validationAPI.getPending(user.id);
      setPendingValidationsCount(response.data.validations?.length || 0);
    } catch (error) {
      console.error('Error fetching pending validations:', error);
      // Don't show error to user for this background fetch
    }
  };

  const handleComplaintSuccess = () => {
    setShowComplaintForm(false);
    if (activeView === 'complaints') {
      // Trigger refresh of complaints list
      setActiveView('overview');
      setTimeout(() => setActiveView('complaints'), 0);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'guide':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-[700]" style={{ color: '#0B2545' }}>Department Guide</h2>
              <button
                onClick={() => setActiveView('overview')}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-md"
                style={{
                  background: 'rgba(11, 37, 69, 0.05)',
                  color: '#0B2545',
                  border: '1px solid rgba(11, 37, 69, 0.1)'
                }}
              >
                ← Back to Dashboard
              </button>
            </div>
            <DepartmentGuide />
          </div>
        );
      
      case 'validations':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-[700]" style={{ color: '#0B2545' }}>Validation Requests</h2>
              <button
                onClick={() => setActiveView('overview')}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-md"
                style={{
                  background: 'rgba(11, 37, 69, 0.05)',
                  color: '#0B2545',
                  border: '1px solid rgba(11, 37, 69, 0.1)'
                }}
              >
                ← Back to Dashboard
              </button>
            </div>
            <ValidationRequests />
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            {/* Top Bar - Pending Validations Alert */}
            {pendingValidationsCount > 0 && (
              <div 
                className="p-5 rounded-2xl transition-all duration-300"
                style={{
                  background: '#FFF7E6',
                  border: '1px solid rgba(248,152,32,0.2)',
                  boxShadow: '0 2px 8px rgba(248,152,32,0.08)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(248,152,32,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(248,152,32,0.08)';
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(248,152,32,0.15)' }}
                    >
                      <Mail className="h-5 w-5" style={{ color: '#F89820' }} />
                    </div>
                    <div>
                      <h3 className="font-[600] text-base" style={{ color: '#0B2545' }}>
                        {pendingValidationsCount} Pending Request{pendingValidationsCount > 1 ? 's' : ''}
                      </h3>
                      <p className="text-sm font-[500]" style={{ color: '#6B7280' }}>
                        Officials need your feedback
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveView('validations')}
                    className="px-5 py-2.5 rounded-lg font-[600] text-sm transition-all duration-300"
                    style={{
                      background: '#F89820',
                      color: '#FFFFFF'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(248,152,32,0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Review Now
                  </button>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Action Cards */}
              <div className="lg:col-span-1 space-y-4">
                {/* Create Complaint Card */}
                <div 
                  className="bg-white p-6 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-center group"
                  onClick={() => setShowComplaintForm(true)}
                  style={{ 
                    border: '1px solid rgba(248,152,32,0.12)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderRadius: '14px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(248,152,32,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Orange Accent Bar */}
                  <div 
                    className="w-12 h-1 mb-5 mx-auto" 
                    style={{ 
                      background: '#F89820',
                      borderRadius: '2px'
                    }} 
                  />
                  
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(248,152,32,0.1)' }}
                    >
                      <FilePlus className="h-7 w-7" style={{ color: '#F89820' }} />
                    </div>
                  </div>
                  <h2 className="text-xl font-[700] text-center mb-2" style={{ color: '#0B2545' }}>File New Complaint</h2>
                  <p className="text-center text-sm font-[500] mb-5" style={{ color: '#6B7280' }}>
                    Report an issue in your area
                  </p>
                  <button 
                    className="w-full px-4 py-2.5 rounded-lg font-[600] text-sm transition-all duration-200 flex items-center justify-center gap-2"
                    style={{ background: '#F89820', color: '#FFFFFF' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowComplaintForm(true);
                    }}
                  >
                    <FilePlus className="h-4 w-4" />
                    File Complaint
                  </button>
                </div>

                {/* Department Guide Card */}
                <div 
                  className="bg-white p-6 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-center group"
                  onClick={() => setActiveView('guide')}
                  style={{ 
                    border: '1px solid rgba(11,37,69,0.12)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderRadius: '14px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(11,37,69,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Navy Accent Bar */}
                  <div 
                    className="w-12 h-1 mb-5 mx-auto" 
                    style={{ 
                      background: '#0B2545',
                      borderRadius: '2px'
                    }} 
                  />
                  
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(11,37,69,0.1)' }}
                    >
                      <Info className="h-7 w-7" style={{ color: '#0B2545' }} />
                    </div>
                  </div>
                  <h2 className="text-xl font-[700] text-center mb-2" style={{ color: '#0B2545' }}>Department Guide</h2>
                  <p className="text-center text-sm font-[500]" style={{ color: '#6B7280' }}>
                    Learn which department handles your issue
                  </p>
                </div>
              </div>

              {/* Main Area - My Complaints List */}
              <div className="lg:col-span-3" style={{ display: 'flex' }}>
                <div 
                  className="bg-white rounded-2xl p-8"
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    alignSelf: 'stretch'
                  }}
                >
                  {/* Orange Accent Bar */}
                  <div 
                    className="w-12 h-1 mb-5" 
                    style={{ 
                      background: '#F89820',
                      borderRadius: '2px',
                      flexShrink: 0
                    }} 
                  />
                  
                  <div className="flex justify-between items-center mb-6" style={{ flexShrink: 0 }}>
                    <div>
                      <h2 className="text-xl font-[700]" style={{ color: '#0B2545' }}>My Complaints</h2>
                      <p className="text-sm mt-1 font-[500]" style={{ color: '#6B7280' }}>
                        Track and manage your submissions
                      </p>
                    </div>
                    <button
                      onClick={() => setShowComplaintForm(true)}
                      className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 font-[600] text-sm"
                      style={{
                        background: '#F89820',
                        color: '#FFFFFF'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(248,152,32,0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <FilePlus className="h-4 w-4" />
                      <span className="hidden sm:inline">New</span>
                    </button>
                  </div>
                  
                  {/* Scrollable Complaints List */}
                  <div 
                    className="overflow-y-auto pr-2" 
                    style={{ 
                      flex: '1 1 0',
                      minHeight: 0
                    }}
                  >
                    <ComplaintsList key={activeView} />
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Requests Section */}
            <div 
              className="bg-white rounded-2xl p-8"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderRadius: '14px'
              }}
            >
              {/* Orange Accent Bar */}
              <div 
                className="w-12 h-1 mb-5" 
                style={{ 
                  background: '#F89820',
                  borderRadius: '2px'
                }} 
              />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(248,152,32,0.1)' }}
                  >
                    <Mail className="h-5 w-5" style={{ color: '#F89820' }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-[700]" style={{ color: '#0B2545' }}>Validation Requests</h2>
                    <p className="text-sm font-[500]" style={{ color: '#6B7280' }}>
                      {pendingValidationsCount > 0 
                        ? `${pendingValidationsCount} request${pendingValidationsCount > 1 ? 's' : ''} awaiting response`
                        : 'No pending requests'}
                    </p>
                  </div>
                </div>
                {pendingValidationsCount > 0 && (
                  <span 
                    className="px-3 py-1.5 rounded-full font-[700] text-sm"
                    style={{
                      background: '#F89820',
                      color: '#FFFFFF'
                    }}
                  >
                    {pendingValidationsCount}
                  </span>
                )}
              </div>
              <ValidationRequests />
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        fontFamily: 'Poppins, Inter, sans-serif',
        background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)'
      }}
    >
      <div className="container mx-auto px-6 py-8">
        {/* User Dashboard Header - Simplified */}
        <div 
          className="bg-white rounded-2xl p-6 mb-6 relative"
          style={{ 
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderRadius: '14px'
          }}
        >
          {/* Soft Glow Orange Underline */}
          <div 
            className="absolute bottom-0 left-0 right-0" 
            style={{ 
              height: '1px', 
              background: '#F89820',
              boxShadow: '0 0 6px rgba(248, 152, 32, 0.4), 0 0 3px rgba(248, 152, 32, 0.3)',
              filter: 'blur(0.5px)'
            }} 
          />
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-[700]" style={{ color: '#0B2545', letterSpacing: '-0.01em' }}>My Dashboard</h1>
              <p className="text-sm mt-2 font-[500]" style={{ color: '#6B7280' }}>
                Welcome, <span className="font-[600]">{user?.name}</span>
              </p>
            </div>
            <div className="hidden md:block">
              <div 
                className="px-4 py-2 rounded-lg text-sm font-[600]"
                style={{
                  background: 'rgba(11, 37, 69, 0.06)',
                  color: '#0B2545',
                  border: '1px solid rgba(11, 37, 69, 0.12)'
                }}
              >
                Citizen Access
              </div>
            </div>
          </div>
        </div>

      {renderContent()}

      {showComplaintForm && (
        <ComplaintForm 
          onClose={() => setShowComplaintForm(false)}
          onSuccess={handleComplaintSuccess}
        />
      )}
      </div>
    </div>
  );
};

export default UserDashboard;
