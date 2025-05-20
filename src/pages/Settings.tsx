
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { useSettingsStore } from '../store/settingsStore';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { 
    language, 
    theme, 
    companyInfo, 
    setLanguage, 
    setTheme, 
    updateCompanyInfo 
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState('company');
  const [formData, setFormData] = useState({
    name: companyInfo.name,
    address: companyInfo.address,
    phone: companyInfo.phone,
    email: companyInfo.email,
    vat: companyInfo.vat,
    logoUrl: companyInfo.logoUrl,
  });

  // Update form data when companyInfo changes
  useEffect(() => {
    setFormData({
      name: companyInfo.name,
      address: companyInfo.address,
      phone: companyInfo.phone,
      email: companyInfo.email,
      vat: companyInfo.vat,
      logoUrl: companyInfo.logoUrl,
    });
  }, [companyInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (value: 'en' | 'fr' | 'ar') => {
    setLanguage(value);
    i18n.changeLanguage(value);
    
    // Update HTML dir attribute for RTL support
    if (value === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    
    toast.success(t('notifications.settingsSaved'));
  };

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setTheme(value);
    
    // Apply theme
    if (value === 'dark' || (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success(t('notifications.settingsSaved'));
  };

  const handleSaveCompanyInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyInfo(formData);
    toast.success(t('notifications.settingsSaved'));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="company">{t('settings.companySettings')}</TabsTrigger>
            <TabsTrigger value="app">{t('app.name')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.companySettings')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveCompanyInfo} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name">{t('settings.companyName')}</label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="address">{t('settings.companyAddress')}</label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="phone">{t('settings.companyPhone')}</label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email">{t('settings.companyEmail')}</label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="vat">{t('settings.vatNumber')}</label>
                    <Input
                      id="vat"
                      name="vat"
                      value={formData.vat}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="logo">{t('settings.uploadLogo')}</label>
                    <Input
                      id="logo"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleInputChange}
                      placeholder="Enter a logo URL"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter a URL to your company logo
                    </p>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button type="submit">{t('settings.saveChanges')}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="app" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.language')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-xs">
                  <Select
                    value={language}
                    onValueChange={(value) => handleLanguageChange(value as 'en' | 'fr' | 'ar')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t('settings.english')}</SelectItem>
                      <SelectItem value="fr">{t('settings.french')}</SelectItem>
                      <SelectItem value="ar">{t('settings.arabic')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.theme')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-xs">
                  <Select
                    value={theme}
                    onValueChange={(value) => handleThemeChange(value as 'light' | 'dark' | 'system')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t('settings.lightTheme')}</SelectItem>
                      <SelectItem value="dark">{t('settings.darkTheme')}</SelectItem>
                      <SelectItem value="system">{t('settings.systemTheme')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
