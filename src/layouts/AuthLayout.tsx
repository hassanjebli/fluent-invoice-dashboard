
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/settingsStore';
import LanguageSwitcher from '../components/LanguageSwitcher';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const { language } = useSettingsStore();
  
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-tr from-brand-dark-purple to-brand-purple">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand-purple">{t('app.name')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('app.tagline')}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
