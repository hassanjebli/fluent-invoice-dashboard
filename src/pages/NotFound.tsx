
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center max-w-md px-4">
        <h1 className="text-9xl font-bold text-brand-purple">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-6">{t('common.pageNotFound')}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {t('common.pageNotFoundDesc')}
        </p>
        <Button asChild>
          <Link to="/dashboard">{t('common.returnToDashboard')}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
