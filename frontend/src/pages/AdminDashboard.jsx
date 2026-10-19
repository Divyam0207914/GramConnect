import React, { useState, useEffect } from 'react';
import { BarChart, ListChecks, Shield, Send, BrainCircuit } from 'lucide-react';
import { officialAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ComplaintTriage from '../components/ComplaintTriage';
import ValidationRequestForm from '../components/ValidationRequestForm';
import SystemIntegrity from '../components/SystemIntegrity';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('overview');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch complaints filtered by the official's department, designation, and location
      const response = await officialAPI.getDashboard(user?.department, user?.designation, user?.id);
      const complaints = response.data.complaints;
      
      setStats({
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'submitted').length,
        in_progress: complaints.filter(c => c.status === 'in_progress').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        closed: complaints.filter(c => c.status === 'closed').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'triage':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-[700]" style={{ color: '#0B2545' }}>Complaint Triage</h2>
              <button
                onClick={() => setActiveView('overview')}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-md"
                style={{
                  background: 'rgba(11, 37, 69, 0.05)',
                  color: '#0B2545',
                  border: '1px solid rgba(11, 37, 69, 0.1)'
                }}
              >
                ← Back to Overview
              </button>
            </div>
            <ComplaintTriage />
          </div>
        );
      
      case 'validation':
        // Block Owner from accessing validation requests
        if (user?.designation === 'Owner') {
          return (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="flex items-center gap-3">
                <Send className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900 text-lg">Access Denied</h3>
                  <p className="text-red-700 mt-1">Owner designation cannot send validation requests.</p>
                  <button
                    onClick={() => setActiveView('overview')}
                    className="mt-3 text-red-600 hover:text-red-800 underline text-sm"
                  >
                    ← Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-[700]" style={{ color: '#0B2545' }}>Send Validation Requests</h2>
              <button
                onClick={() => setActiveView('overview')}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-md"
                style={{
                  background: 'rgba(11, 37, 69, 0.05)',
                  color: '#0B2545',
                  border: '1px solid rgba(11, 37, 69, 0.1)'
                }}
              >
                ← Back to Overview
              </button>
            </div>
            <ValidationRequestForm />
          </div>
        );
      
      case 'integrity':
        // Only allow Owner designation to access
        if (user?.designation !== 'Owner') {
          return (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900 text-lg">Access Denied</h3>
                  <p className="text-red-700 mt-1">Only officials with 'Owner' designation can access System Integrity.</p>
                  <button
                    onClick={() => setActiveView('overview')}
                    className="mt-3 text-red-600 hover:text-red-800 underline text-sm"
                  >
                    ← Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-[700]" style={{ color: '#0B2545' }}>System Integrity</h2>
              <button
                onClick={() => setActiveView('overview')}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-md"
                style={{
                  background: 'rgba(11, 37, 69, 0.05)',
                  color: '#0B2545',
                  border: '1px solid rgba(11, 37, 69, 0.1)'
                }}
              >
                ← Back to Overview
              </button>
            </div>
            <SystemIntegrity />
          </div>
        );
      
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Overview Stats */}
            <div 
              className="lg:col-span-2 bg-white p-8 rounded-lg transition-all duration-300 hover:shadow-xl"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderRadius: '14px'
              }}
            >
              {/* Orange Accent Bar */}
              <div 
                className="w-12 h-1 mb-4" 
                style={{ 
                  background: '#F89820',
                  borderRadius: '2px'
                }} 
              />
              
              <div className="flex items-center mb-6">
                <BarChart className="h-6 w-6 mr-3" style={{ color: '#F89820' }} />
                <div>
                  <h2 className="text-xl font-[700]" style={{ color: '#0B2545' }}>Overview</h2>
                  {user?.designation === 'Owner' ? (
                    <p className="text-xs font-[500]" style={{ color: '#556168' }}>
                      Showing all complaints across the system
                    </p>
                  ) : user?.department && (
                    <p className="text-xs font-[500]" style={{ color: '#556168' }}>
                      Showing {user.designation || 'All'} level complaints for {user.department}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-[800]" style={{ color: '#0B2545' }}>{stats.total}</p>
                  <p className="text-sm font-[500]" style={{ color: '#556168' }}>Total Complaints</p>
                </div>
                <div>
                  <p className="text-3xl font-[800] text-yellow-500">{stats.pending + stats.in_progress}</p>
                  <p className="text-sm font-[500]" style={{ color: '#556168' }}>Active</p>
                </div>
                <div>
                  <p className="text-3xl font-[800] text-green-500">{stats.resolved + stats.closed}</p>
                  <p className="text-sm font-[500]" style={{ color: '#556168' }}>Resolved</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div 
                  className="p-3 rounded-lg"
                  style={{ 
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.15)'
                  }}
                >
                  <span className="font-[600]" style={{ color: '#0B2545' }}>Submitted:</span>
                  <span className="ml-2 font-[700]" style={{ color: '#0F2940' }}>{stats.pending}</span>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ 
                    background: 'rgba(234,179,8,0.08)',
                    border: '1px solid rgba(234,179,8,0.15)'
                  }}
                >
                  <span className="font-[600]" style={{ color: '#0B2545' }}>In Progress:</span>
                  <span className="ml-2 font-[700]" style={{ color: '#0F2940' }}>{stats.in_progress}</span>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ 
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.15)'
                  }}
                >
                  <span className="font-[600]" style={{ color: '#0B2545' }}>Resolved:</span>
                  <span className="ml-2 font-[700]" style={{ color: '#0F2940' }}>{stats.resolved}</span>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ 
                    background: 'rgba(107,114,128,0.08)',
                    border: '1px solid rgba(107,114,128,0.15)'
                  }}
                >
                  <span className="font-[600]" style={{ color: '#0B2545' }}>Closed:</span>
                  <span className="ml-2 font-[700]" style={{ color: '#0F2940' }}>{stats.closed}</span>
                </div>
              </div>
            </div>

            {/* Complaint Triage */}
            <div 
              onClick={() => setActiveView('triage')}
              className={`bg-white p-6 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group ${
                user?.designation === 'Owner' ? 'lg:col-span-2' : ''
              }`}
              style={{
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
              <div 
                className="mb-4 transition-transform duration-300 group-hover:scale-110"
              >
                <ListChecks className="h-12 w-12" style={{ color: '#F89820' }} />
              </div>
              <h2 className="text-xl font-[700] mb-2" style={{ color: '#0B2545' }}>Complaint Triage</h2>
              <p className="text-sm font-[500]" style={{ color: '#556168' }}>Review and update complaint statuses.</p>
            </div>

            {/* Send Validation Requests - Hidden for Owner */}
            {user?.designation !== 'Owner' && (
              <div 
                onClick={() => setActiveView('validation')}
                className="bg-white p-6 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group"
                style={{
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
                <div 
                  className="mb-4 transition-transform duration-300 group-hover:scale-110"
                >
                  <Send className="h-12 w-12" style={{ color: 'rgba(11,37,69,0.7)' }} />
                </div>
                <h2 className="text-xl font-[700] mb-2" style={{ color: '#0B2545' }}>Send Requests</h2>
                <p className="text-sm font-[500]" style={{ color: '#556168' }}>Request validation from citizens.</p>
              </div>
            )}

            {/* System Integrity - Only visible to Owner */}
            {user?.designation === 'Owner' && (
              <div 
                onClick={() => setActiveView('integrity')}
                className="lg:col-span-2 bg-white p-6 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group"
                style={{
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
                <div 
                  className="mb-4 transition-transform duration-300 group-hover:scale-110"
                >
                  <Shield className="h-12 w-12 text-red-500" />
                </div>
                <h2 className="text-xl font-[700] mb-2" style={{ color: '#0B2545' }}>System Integrity</h2>
                <p className="text-sm font-[500]" style={{ color: '#556168' }}>Verify data and system health.</p>
              </div>
            )}

            {/* Quick Stats */}
            <div 
              className="lg:col-span-2 text-white p-8 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #1A4367 0%, #2C628A 60%, #F5A53C 110%)',
                boxShadow: '0 4px 12px rgba(248,152,32,0.2)',
                borderRadius: '14px'
              }}
            >
              {/* White Accent Bar */}
              <div 
                className="w-12 h-1 mb-4" 
                style={{ 
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '2px'
                }} 
              />
              
              <h3 className="text-lg font-[700] mb-6" style={{ opacity: 0.95 }}>Quick Insights</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-[500]" style={{ opacity: 0.9 }}>Completion Rate:</span>
                  <span className="font-[800] text-lg">
                    {stats.total > 0 
                      ? Math.round(((stats.resolved + stats.closed) / stats.total) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-[500]" style={{ opacity: 0.9 }}>Pending Review:</span>
                  <span className="font-[800] text-lg">{stats.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-[500]" style={{ opacity: 0.9 }}>Active Cases:</span>
                  <span className="font-[800] text-lg">{stats.in_progress}</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-6 py-8" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
      {/* Admin Details Header */}
      <div 
        className="rounded-lg p-6 mb-6 relative"
        style={{
          background: 'linear-gradient(90deg, #0B2545 0%, #153B5C 60%, #1B4E7A 100%)',
          boxShadow: '0 4px 12px rgba(248, 152, 32, 0.15)'
        }}
      >
        {/* Soft Glow Orange Underline */}
        <div 
          className="absolute bottom-0 left-0 right-0" 
          style={{ 
            height: '1px', 
            background: '#F89820',
            boxShadow: '0 0 8px rgba(248, 152, 32, 0.6), 0 0 4px rgba(248, 152, 32, 0.4)',
            filter: 'blur(0.5px)'
          }} 
        />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-[700] text-white" style={{ letterSpacing: '-0.01em' }}>
              {user?.designation === 'Owner' ? '👑 System Owner Dashboard' : "Official's Dashboard"}
            </h1>
            <div className="mt-4 space-y-2">
              <p className="text-white" style={{ fontWeight: 500, opacity: 0.95 }}>
                <span className="font-[600]">Name:</span> {user?.name || 'N/A'}
              </p>
              {user?.designation !== 'Owner' && (
                <p className="text-white" style={{ fontWeight: 500, opacity: 0.95 }}>
                  <span className="font-[600]">Department:</span> {user?.department || 'N/A'}
                </p>
              )}
              <p className="text-white" style={{ fontWeight: 500, opacity: 0.95 }}>
                <span className="font-[600]">Designation:</span> {user?.designation || 'N/A'}
                {user?.designation === 'Owner' && <span className="ml-2 text-yellow-300">(Full System Access)</span>}
              </p>
              <p className="text-white" style={{ fontWeight: 500, opacity: 0.95 }}>
                <span className="font-[600]">Role:</span> {user?.role === 'official' ? 'Government Official' : user?.role}
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <div 
              className="p-5 text-center transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <p className="text-sm font-[600] mb-1" style={{ opacity: 0.9 }}>
                {user?.designation === 'Owner' ? 'System Access' : 'Hierarchy Level'}
              </p>
              <p className="text-2xl font-[800]">
                {user?.designation || 'N/A'}
              </p>
              {user?.designation === 'Owner' ? (
                <p className="text-xs text-yellow-300 mt-1 font-[600]">★ All Access ★</p>
              ) : (
                <p className="text-xs mt-1 font-[500]" style={{ opacity: 0.85 }}>{user?.department || 'General'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default AdminDashboard;
