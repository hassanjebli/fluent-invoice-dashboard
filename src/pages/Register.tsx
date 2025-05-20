
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthLayout from '../layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = t('auth.errors.nameRequired');
    if (!email) newErrors.email = t('auth.errors.emailRequired');
    if (!password) newErrors.password = t('auth.errors.passwordRequired');
    if (password && password.length < 6) newErrors.password = t('auth.errors.passwordLength');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      const success = await register(name, email, password);
      
      if (success) {
        toast.success(t('notifications.registerSuccess'));
        navigate('/dashboard');
      } else {
        toast.error(t('notifications.registerError'));
        setErrors({ form: t('auth.errors.emailExists') });
      }
    } catch (error) {
      toast.error(t('notifications.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-6 text-center">{t('auth.register')}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="name">{t('auth.name')}</label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('auth.namePlaceholder')}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="email">{t('auth.email')}</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1" htmlFor="password">{t('auth.password')}</label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.passwordPlaceholder')}
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
        </div>
        
        {errors.form && <p className="mb-4 text-sm text-red-500">{errors.form}</p>}
        
        <Button type="submit" className="w-full mb-4" disabled={loading}>
          {loading ? `${t('common.loading')}...` : t('auth.register')}
        </Button>
      </form>
      
      <p className="text-sm text-center">
        {t('auth.haveAccount')} <Link to="/login" className="text-brand-purple font-medium hover:underline">{t('auth.loginNow')}</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
