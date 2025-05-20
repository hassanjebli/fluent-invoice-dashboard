
// Format currency based on locale
export const formatCurrency = (amount: number, locale = 'en-US', currency = 'USD'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date based on locale
export const formatDate = (dateString: string, locale = 'en-US'): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(0)}%`;
};

// Generate invoice/quote status badge class
export const getStatusClass = (
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'accepted' | 'rejected'
): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-200 text-gray-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
