
import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'accepted' | 'rejected';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation();
  
  const getStatusClass = (): string => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusText = (): string => {
    switch (status) {
      case 'draft':
        return t('invoices.draft');
      case 'sent':
        return t('invoices.sent');
      case 'paid':
        return t('invoices.paid');
      case 'overdue':
        return t('invoices.overdue');
      case 'accepted':
        return t('quotes.accepted');
      case 'rejected':
        return t('quotes.rejected');
      default:
        return status;
    }
  };
  
  return (
    <span className={cn(
      'px-2.5 py-1 text-xs font-medium rounded-full border',
      getStatusClass(),
      className
    )}>
      {getStatusText()}
    </span>
  );
};

export default StatusBadge;
