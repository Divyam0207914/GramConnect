import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left">
            <h2 className="text-lg font-bold">GramConnect</h2>
            <p className="text-gray-400 text-sm">{t('empoweringRural')}.</p>
          </div>
          <div className="text-center text-gray-400 text-sm mt-3 md:mt-0">
            &copy; {new Date().getFullYear()} GramConnect. {t('footerRights')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
