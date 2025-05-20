
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';
import { LineItem } from '../store/dataStore';
import { formatCurrency } from '../utils/formatters';

interface LineItemTableProps {
  items: LineItem[];
  onAddItem: () => void;
  onUpdateItem: (index: number, key: keyof LineItem, value: string | number) => void;
  onDeleteItem: (index: number) => void;
  currency?: string;
}

const LineItemTable: React.FC<LineItemTableProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  currency = 'USD'
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">{t('invoices.items')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full mb-4">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">{t('invoices.description')}</th>
              <th className="pb-2 w-24">{t('invoices.quantity')}</th>
              <th className="pb-2 w-32">{t('invoices.unitPrice')}</th>
              <th className="pb-2 w-32">{t('invoices.total')}</th>
              <th className="pb-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder={t('invoices.description')}
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    min={1}
                    className="w-full p-2 border rounded-md"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => onUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    min={0}
                    step={0.01}
                    className="w-full p-2 border rounded-md"
                  />
                </td>
                <td className="py-2">
                  {formatCurrency(item.quantity * item.unitPrice, undefined, currency)}
                </td>
                <td className="py-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDeleteItem(index)}
                    aria-label={t('invoices.deleteItem')}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button 
        variant="outline" 
        onClick={onAddItem}
        className="mb-4"
      >
        {t('invoices.addItem')}
      </Button>
    </div>
  );
};

export default LineItemTable;
