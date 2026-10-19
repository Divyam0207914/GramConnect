import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LogOut, LayoutDashboard, Menu, X, Globe, Mic } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeButton, setActiveButton] = useState('home');
  const isLandingPage = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header 
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 2px 16px rgba(11, 37, 69, 0.08)'
      }}
    >
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo with SVG */}
        <div className="flex items-center gap-2 cursor-pointer transition-transform duration-300 hover:scale-105 mr-auto">
          <img src="/download.svg" alt="GramConnect" style={{ height: '40px', width: 'auto' }} />
          {user ? (
            <button 
              onClick={() => navigate(user.role === 'citizen' ? '/dashboard' : '/admin/dashboard')}
              style={{
                fontFamily: 'Poppins, Inter, sans-serif',
                fontSize: '20px',
                fontWeight: 800,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center',
                gap: '0px',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ color: '#F89820' }}>Gram</span>
              <span style={{ color: '#0B2545' }}>Connect</span>
            </button>
          ) : (
            <Link 
              to="/" 
              style={{
                fontFamily: 'Poppins, Inter, sans-serif',
                fontSize: '20px',
                fontWeight: 800,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center',
                gap: '0px',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ color: '#F89820' }}>Gram</span>
              <span style={{ color: '#0B2545' }}>Connect</span>
            </Link>
          )}
        </div>

        {/* Desktop Navigation - Only on Landing Page */}
        {isLandingPage && (
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-base font-[500] transition-all duration-200 px-3 py-1 rounded-md"
              style={{ 
                color: activeButton === 'home' ? '#FFFFFF' : '#0B2545',
                fontFamily: 'Poppins, Inter, sans-serif',
                background: activeButton === 'home' ? '#F89820' : 'transparent',
                transform: activeButton === 'home' ? 'scale(1.1)' : 'scale(1)',
                boxShadow: activeButton === 'home' ? '0 4px 12px rgba(248, 152, 32, 0.3)' : 'none'
              }}
              onClick={() => setActiveButton('home')}
              onMouseEnter={(e) => {
                if (activeButton !== 'home') {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeButton !== 'home') {
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {t('home')}
            </Link>
            <button 
              onClick={() => {
                setActiveButton('how-it-works');
                scrollToSection('how-it-works');
              }}
              className="text-base font-[500] transition-all duration-200 px-3 py-1 rounded-md"
              style={{ 
                color: activeButton === 'how-it-works' ? '#FFFFFF' : '#0B2545',
                fontFamily: 'Poppins, Inter, sans-serif',
                background: activeButton === 'how-it-works' ? '#F89820' : 'none',
                border: 'none',
                cursor: 'pointer',
                transform: activeButton === 'how-it-works' ? 'scale(1.1)' : 'scale(1)',
                boxShadow: activeButton === 'how-it-works' ? '0 4px 12px rgba(248, 152, 32, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeButton !== 'how-it-works') {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeButton !== 'how-it-works') {
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {t('howItWorks')}
            </button>
            <button 
              onClick={() => {
                setActiveButton('features');
                scrollToSection('features');
              }}
              className="text-base font-[500] transition-all duration-200 px-3 py-1 rounded-md"
              style={{ 
                color: activeButton === 'features' ? '#FFFFFF' : '#0B2545',
                fontFamily: 'Poppins, Inter, sans-serif',
                background: activeButton === 'features' ? '#F89820' : 'none',
                border: 'none',
                cursor: 'pointer',
                transform: activeButton === 'features' ? 'scale(1.1)' : 'scale(1)',
                boxShadow: activeButton === 'features' ? '0 4px 12px rgba(248, 152, 32, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeButton !== 'features') {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeButton !== 'features') {
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {t('features')}
            </button>
            <Link 
              to="/auto-agent" 
              className="text-base font-[500] transition-all duration-200 px-3 py-1 rounded-md flex items-center"
              style={{ 
                color: activeButton === 'auto-agent' ? '#FFFFFF' : '#0B2545',
                fontFamily: 'Poppins, Inter, sans-serif',
                background: activeButton === 'auto-agent' ? '#F89820' : 'transparent',
                transform: activeButton === 'auto-agent' ? 'scale(1.1)' : 'scale(1)',
                boxShadow: activeButton === 'auto-agent' ? '0 4px 12px rgba(248, 152, 32, 0.3)' : 'none'
              }}
              onClick={() => setActiveButton('auto-agent')}
              onMouseEnter={(e) => {
                if (activeButton !== 'auto-agent') {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeButton !== 'auto-agent') {
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <Mic className="mr-1 h-4 w-4" />
              Auto Agent
            </Link>
          </div>
        )}

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Language Toggle - Only show when NOT on landing page */}
          {!isLandingPage && (
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-[600] transition-all duration-200"
              style={{
                background: 'rgba(248,152,32,0.1)',
                color: '#F89820',
                border: '1px solid rgba(248,152,32,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F89820';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(248,152,32,0.1)';
                e.currentTarget.style.color = '#F89820';
              }}
            >
              <Globe className="h-4 w-4" />
              {language === 'en' ? 'हि' : 'En'}
            </button>
          )}
          {user ? (
            <>
              <span className="text-sm font-[500] hidden lg:inline" style={{ color: '#556168' }}>{t('welcome')}, {user.name}</span>
              <Link 
                to={user.role === 'citizen' ? '/dashboard' : '/admin/dashboard'}
                className="flex items-center text-sm font-[600] transition-colors duration-200"
                style={{ color: '#0B2545' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#F89820'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#0B2545'}
              >
                <LayoutDashboard className="mr-1 h-4 w-4" />
                {t('dashboard')}
              </Link>
              <button 
                onClick={handleLogout} 
                className="flex items-center text-sm font-[600] transition-colors duration-200"
                style={{ color: '#DC2626' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#991B1B'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#DC2626'}
              >
                <LogOut className="mr-1 h-4 w-4" />
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-base font-[500] transition-colors duration-200 px-4 py-2"
                style={{ 
                  color: '#556168',
                  fontFamily: 'Poppins, Inter, sans-serif'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0B2545'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#556168'}
              >
                {t('login')}
              </Link>
              <Link 
                to="/register" 
                className="text-base font-[600] px-6 py-2.5 rounded-lg transition-all duration-300"
                style={{ 
                  background: '#0B2545',
                  color: '#FFFFFF',
                  fontFamily: 'Poppins, Inter, sans-serif',
                  boxShadow: '0 2px 8px rgba(11, 37, 69, 0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F89820';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(248, 152, 32, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0B2545';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(11, 37, 69, 0.15)';
                }}
              >
                {t('getStarted')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 transition-colors duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ color: '#0B2545' }}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu - Only on Landing Page */}
      {mobileMenuOpen && isLandingPage && (
        <div 
          className="md:hidden border-t"
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderTopColor: 'rgba(11, 37, 69, 0.1)'
          }}
        >
          <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-[500] py-2 transition-colors duration-200"
              style={{ 
                color: location.pathname === '/' ? '#0B2545' : '#6B7280',
                fontFamily: 'Poppins, Inter, sans-serif'
              }}
            >
              {t('home')}
            </Link>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="text-base font-[500] py-2 text-left transition-colors duration-200"
              style={{ 
                color: '#6B7280',
                fontFamily: 'Poppins, Inter, sans-serif'
              }}
            >
              {t('howItWorks')}
            </button>
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-base font-[500] py-2 text-left transition-colors duration-200"
              style={{ 
                color: '#6B7280',
                fontFamily: 'Poppins, Inter, sans-serif'
              }}
            >
              {t('features')}
            </button>
            <Link 
              to="/auto-agent" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-[500] py-2 transition-colors duration-200 flex items-center"
              style={{ 
                color: '#6B7280',
                fontFamily: 'Poppins, Inter, sans-serif'
              }}
            >
              <Mic className="mr-2 h-5 w-5" />
              Auto Agent
            </Link>
            
            {user ? (
              <>
                <Link 
                  to={user.role === 'citizen' ? '/dashboard' : '/admin/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center text-base font-[600] py-2 transition-colors duration-200"
                  style={{ color: '#0B2545' }}
                >
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  {t('dashboard')}
                </Link>
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                  className="flex items-center text-base font-[600] py-2 transition-colors duration-200"
                  style={{ color: '#DC2626' }}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-[500] py-2 transition-colors duration-200"
                  style={{ 
                    color: '#556168',
                    fontFamily: 'Poppins, Inter, sans-serif'
                  }}
                >
                  {t('login')}
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-[600] px-6 py-2.5 rounded-lg transition-all duration-300 text-center"
                  style={{ 
                    background: '#0B2545',
                    color: '#FFFFFF',
                    fontFamily: 'Poppins, Inter, sans-serif'
                  }}
                >
                  {t('getStarted')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;