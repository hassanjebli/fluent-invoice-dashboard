
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSettingsStore } from '../store/settingsStore';

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { setLanguage } = useSettingsStore();

  const changeLanguage = (lng: 'en' | 'fr' | 'ar') => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    
    // Set RTL for Arabic
    if (lng === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="text-sm">
          {i18n.language === 'en' && 'EN'}
          {i18n.language === 'fr' && 'FR'}
          {i18n.language === 'ar' && 'AR'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('settings.language')}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          {t('settings.english')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('fr')}>
          {t('settings.french')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('ar')}>
          {t('settings.arabic')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
