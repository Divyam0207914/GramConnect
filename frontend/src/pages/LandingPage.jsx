import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Shield, FileText, CheckCircle, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
  const { user } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect logged-in users to their dashboard
    if (user) {
      if (user.role === 'citizen') {
        navigate('/dashboard', { replace: true });
      } else if (user.role === 'official') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  return (
    <div className="text-text-primary" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
      {/* Language Toggle Button - Fixed at Bottom Right (Landing Page Only) */}
      <button
        onClick={toggleLanguage}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-sm font-[600] transition-all duration-300"
        style={{
          background: '#F89820',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(248,152,32,0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(248,152,32,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(248,152,32,0.3)';
        }}
      >
        <Globe className="h-5 w-5" />
        {language === 'en' ? 'हिन्दी' : 'English'}
      </button>
      {/* Hero Section */}
      <section className="relative flex items-center justify-center" style={{ 
        background: 'linear-gradient(180deg,rgb(255, 241, 219) 0%, #FFF6F1 40%, #FFFFFF 100%)',
        minHeight: '90vh'
      }}>
        <div className="container mx-auto px-4 md:px-16 lg:px-16 py-8 md:py-20">
          <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
            {/* Centered Content */}
            <div className="w-full flex flex-col items-center text-center">
              <h1 className="text-4xl md:text-[64px] font-[800] leading-tight md:leading-[1.05] mb-4 md:mb-6 max-w-4xl" style={{ color: '#0F2940' }}>
                {t('empoweringTitle')} <span style={{ color: '#FF9B2D' }}>{t('transparentGovernance')}</span>
              </h1>
              <p className="text-base md:text-lg mb-10 md:mb-12 max-w-2xl mx-auto" style={{ color: '#556168', lineHeight: '1.45' }}>
                {t('platformDesc')}
              </p>
            
              {/* Dual Access Cards */}
              <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Citizens Card */}
                <div 
                  className="bg-white p-8 md:p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group"
                  style={{ 
                    borderRadius: '16px',
                    border: '1px solid rgba(247,148,29,0.15)',
                    boxShadow: '0 12px 32px rgba(247,148,29,0.12)'
                  }}
                >
                  {/* Icon */}
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ 
                      background: 'linear-gradient(135deg, #FF9B2D 0%, #F7941D 100%)'
                    }}
                  >
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Heading */}
                  <h3 className="text-2xl font-[700] mb-2" style={{ color: '#0F2940' }}>
                    {t('forCitizens')}
                  </h3>
                  <p className="text-sm mb-6" style={{ color: '#556168', lineHeight: '1.5' }}>
                    {t('citizensDesc')}
                  </p>
                  
                  {/* Buttons */}
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/register"
                      className="w-full inline-flex items-center justify-center rounded-lg px-5 py-3 text-white font-semibold transition-all duration-200 hover:shadow-lg"
                      style={{ 
                        background: 'linear-gradient(90deg, #FF9B2D 0%, #F7941D 100%)'
                      }}
                    >
                      {t('register')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="w-full inline-flex items-center justify-center rounded-lg px-5 py-3 font-semibold transition-all duration-200 hover:bg-opacity-80"
                      style={{ 
                        border: '2px solid #F7941D',
                        background: 'rgba(255,155,45,0.08)',
                        color: '#F7941D'
                      }}
                    >
                      {t('login')}
                    </Link>
                  </div>
                </div>

                {/* Officials/Admins Card */}
                <div 
                  className="bg-white p-8 md:p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group"
                  style={{ 
                    borderRadius: '16px',
                    border: '1px solid rgba(15,41,64,0.15)',
                    boxShadow: '0 12px 32px rgba(15,41,64,0.12)'
                  }}
                >
                  {/* Icon */}
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ 
                      background: '#0F2940'
                    }}
                  >
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Heading */}
                  <h3 className="text-2xl font-[700] mb-2" style={{ color: '#0F2940' }}>
                    {t('forOfficials')}
                  </h3>
                  <p className="text-sm mb-6" style={{ color: '#556168', lineHeight: '1.5' }}>
                    {t('officialsDesc')}
                  </p>
                  
                  {/* Buttons */}
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/admin/register"
                      className="w-full inline-flex items-center justify-center rounded-lg px-5 py-3 text-white font-semibold transition-all duration-200 hover:opacity-90"
                      style={{ 
                        background: '#0F2940'
                      }}
                    >
                      {t('adminRegister')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link
                      to="/admin/login"
                      className="w-full inline-flex items-center justify-center rounded-lg px-5 py-3 font-semibold transition-all duration-200 hover:bg-opacity-80"
                      style={{ 
                        border: '2px solid #0F2940',
                        background: 'rgba(15,41,64,0.08)',
                        color: '#0F2940'
                      }}
                    >
                      {t('adminLogin')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24" style={{ backgroundColor: '#FFFFFF', borderBottom: 'none' }}>
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-[800] mb-4" style={{ color: '#0B2545' }}>
              {t('howItWorksTitle')}
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#556168', lineHeight: '1.6' }}>
              {t('howItWorksSubtitle')}
            </p>
          </div>

          {/* Timeline Steps */}
          <div className="relative max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      background: '#0B2545',
                      boxShadow: '0 4px 16px rgba(11,37,69,0.25)'
                    }}
                  >
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div 
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ background: '#F89820' }}
                  >
                    1
                  </div>
                </div>
                
                <h3 className="text-xl font-[700] mb-3" style={{ color: '#0B2545' }}>
                  {t('fileComplaintStep')}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#556168' }}>
                  {t('fileComplaintDesc')}
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      background: '#0B2545',
                      boxShadow: '0 4px 16px rgba(11,37,69,0.25)'
                    }}
                  >
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <div 
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ background: '#F89820' }}
                  >
                    2
                  </div>
                </div>
                
                <h3 className="text-xl font-[700] mb-3" style={{ color: '#0B2545' }}>
                  {t('officialReview')}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#556168' }}>
                  {t('officialReviewDesc')}
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      background: '#0B2545',
                      boxShadow: '0 4px 16px rgba(11,37,69,0.25)'
                    }}
                  >
                    <CheckCircle className="h-7 w-7 text-white" />
                  </div>
                  <div 
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ background: '#F89820' }}
                  >
                    3
                  </div>
                </div>
                
                <h3 className="text-xl font-[700] mb-3" style={{ color: '#0B2545' }}>
                  {t('trackResolution')}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#556168' }}>
                  {t('trackResolutionDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Orange Divider */}
      <div style={{
        backgroundColor: '#FFFFFF',
        paddingTop: '20px',
        paddingBottom: '20px'
      }}>
        <div style={{
          width: '120px',
          height: '4px',
          background: '#F89820',
          margin: '0 auto',
          borderRadius: '2px'
        }} />
      </div>

      {/* Features Section */}
      <section id="features" className="py-24" style={{ 
        background: '#FFFFFF'
      }}>
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-[800] mb-4" style={{ color: '#0B2545' }}>
              {t('keyFeatures')}
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#556168', lineHeight: '1.6' }}>
              {t('keyFeaturesDesc')}
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Community Validation */}
            <div 
              className="bg-white p-7 transition-all duration-300 hover:-translate-y-2 group"
              style={{ 
                borderRadius: '14px',
                border: '1px solid rgba(11,37,69,0.1)',
                boxShadow: '0 2px 8px rgba(11,37,69,0.06)'
              }}
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(248,152,32,0.1) 0%, rgba(248,152,32,0.15) 100%)'
                }}
              >
                <Users className="h-7 w-7" style={{ color: '#F89820' }} />
              </div>
              <h3 className="text-lg font-[700] mb-3" style={{ color: '#0B2545' }}>
                {t('communityValidation')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#556168' }}>
                {t('communityValidationDesc')}
              </p>
            </div>

            {/* Data Integrity */}
            <div 
              className="bg-white p-7 transition-all duration-300 hover:-translate-y-2 group"
              style={{ 
                borderRadius: '14px',
                border: '1px solid rgba(11,37,69,0.1)',
                boxShadow: '0 2px 8px rgba(11,37,69,0.06)'
              }}
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(248,152,32,0.1) 0%, rgba(248,152,32,0.15) 100%)'
                }}
              >
                <Shield className="h-7 w-7" style={{ color: '#F89820' }} />
              </div>
              <h3 className="text-lg font-[700] mb-3" style={{ color: '#0B2545' }}>
                {t('dataIntegrity')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#556168' }}>
                {t('dataIntegrityDesc')}
              </p>
            </div>

            {/* Easy Filing */}
            <div 
              className="bg-white p-7 transition-all duration-300 hover:-translate-y-2 group"
              style={{ 
                borderRadius: '14px',
                border: '1px solid rgba(11,37,69,0.1)',
                boxShadow: '0 2px 8px rgba(11,37,69,0.06)'
              }}
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(248,152,32,0.1) 0%, rgba(248,152,32,0.15) 100%)'
                }}
              >
                <FileText className="h-7 w-7" style={{ color: '#F89820' }} />
              </div>
              <h3 className="text-lg font-[700] mb-3" style={{ color: '#0B2545' }}>
                {t('easyFiling')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#556168' }}>
                {t('easyFilingDesc')}
              </p>
            </div>

            {/* Real-time Tracking */}
            <div 
              className="bg-white p-7 transition-all duration-300 hover:-translate-y-2 group"
              style={{ 
                borderRadius: '14px',
                border: '1px solid rgba(11,37,69,0.1)',
                boxShadow: '0 2px 8px rgba(11,37,69,0.06)'
              }}
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(248,152,32,0.1) 0%, rgba(248,152,32,0.15) 100%)'
                }}
              >
                <CheckCircle className="h-7 w-7" style={{ color: '#F89820' }} />
              </div>
              <h3 className="text-lg font-[700] mb-3" style={{ color: '#0B2545' }}>
                {t('realTimeTracking')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#556168' }}>
                {t('realTimeTrackingDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Orange Divider */}
      <div style={{
        backgroundColor: '#FFFFFF',
        paddingTop: '20px',
        paddingBottom: '20px'
      }}>
        <div style={{
          width: '120px',
          height: '4px',
          background: '#F89820',
          margin: '0 auto',
          borderRadius: '2px'
        }} />
      </div>

      {/* Call to Action */}
      <section className="relative overflow-hidden py-20" style={{ backgroundColor: '#FFFFFF' }}>
        {/* Layered Wave Backgrounds - Overlapping Hills Style */}
        <div className="absolute inset-0">
          {/* Base Layer - Off-White */}
          <svg 
            className="absolute bottom-0 w-full" 
            viewBox="0 0 1440 400" 
            fill="none" 
            preserveAspectRatio="none"
            style={{ height: '100%' }}
          >
            <path 
              d="M0,200 Q360,140 720,180 T1440,200 L1440,400 L0,400 Z" 
              fill="#FFFBF7"
            />
          </svg>
          
          {/* Second Layer - Light Beige */}
          <svg 
            className="absolute bottom-0 w-full" 
            viewBox="0 0 1440 350" 
            fill="none" 
            preserveAspectRatio="none"
            style={{ height: '80%' }}
          >
            <path 
              d="M0,180 Q240,100 480,140 T960,160 T1440,140 L1440,350 L0,350 Z" 
              fill="#FFF4E8"
              opacity="0.85"
            />
          </svg>

          {/* Third Layer - Pale Cream */}
          <svg 
            className="absolute bottom-0 w-full" 
            viewBox="0 0 1440 300" 
            fill="none" 
            preserveAspectRatio="none"
            style={{ height: '65%' }}
          >
            <path 
              d="M0,140 Q320,80 640,120 T1280,100 T1440,120 L1440,300 L0,300 Z" 
              fill="#FFECD5"
              opacity="0.7"
            />
          </svg>

          {/* Fourth Layer - Pale Saffron */}
          <svg 
            className="absolute bottom-0 w-full" 
            viewBox="0 0 1440 250" 
            fill="none" 
            preserveAspectRatio="none"
            style={{ height: '50%' }}
          >
            <path 
              d="M0,100 Q400,60 800,90 T1440,80 L1440,250 L0,250 Z" 
              fill="#FFE4C4"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-[700px] mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-[700] mb-6" style={{ 
              color: '#0B2545',
              fontFamily: 'Poppins, Inter, sans-serif',
              letterSpacing: '-0.02em'
            }}>
              {t('readyToMakeVoice')}
            </h2>
            
            <p className="text-lg md:text-xl mb-10" style={{ 
              color: '#556168',
              lineHeight: '1.7',
              fontFamily: 'Poppins, Inter, sans-serif',
              fontWeight: 500
            }}>
              {t('joinThousands')}
            </p>
            
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-10 py-4 rounded-xl font-[600] text-lg transition-all duration-300 group"
              style={{ 
                background: '#0B2545',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(11,37,69,0.2)',
                fontFamily: 'Poppins, Inter, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F89820';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(248,152,32,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0B2545';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(11,37,69,0.2)';
              }}
            >
              {t('getStartedNow')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;