
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ChartBar, Home, Settings, User, File } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { icon: Home, name: t('navigation.dashboard'), path: '/dashboard' },
    { icon: User, name: t('navigation.clients'), path: '/clients' },
    { icon: File, name: t('navigation.invoices'), path: '/invoices' },
    { icon: Calendar, name: t('navigation.quotes'), path: '/quotes' },
    { icon: Settings, name: t('navigation.settings'), path: '/settings' },
  ];

  const isActive = (path: string) => {
    // Direct match for the exact path
    if (location.pathname === path) return true;
    
    // Special case for /dashboard to prevent matching nested routes
    if (path === '/dashboard' && location.pathname !== '/dashboard') return false;
    
    // For other paths, check if the current path starts with this path
    // This allows nested routes to activate their parent nav items
    return location.pathname.startsWith(path) && path !== '/dashboard';
  };

  return (
    <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        {/* App Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <Link to="/dashboard" className="text-2xl font-bold text-brand-purple">
            {t('app.name')}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center px-4 py-3 rounded-md transition-colors',
                isActive(item.path)
                  ? 'bg-brand-purple text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive(item.path) ? 'text-white' : 'text-gray-400')} />
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Version Info */}
        <div className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs">InvoiceCraft v1.0</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
