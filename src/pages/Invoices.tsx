import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../layouts/DashboardLayout';
import { useDataStore, Invoice, LineItem } from '../store/dataStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Eye, FilePlus, Plus, Trash } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import LineItemTable from '../components/LineItemTable';

const Invoices: React.FC = () => {
  const { t } = useTranslation();
  const { invoices, clients, addInvoice, updateInvoice, deleteInvoice, updateInvoiceStatus } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    clientId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [
      {
        id: uuidv4(),
        description: '',
        quantity: 1,
        unitPrice: 0,
      },
    ],
    notes: '',
    status: 'draft' as Invoice['status'],
    taxRate: 0.1,
  });

  // Filter invoices based on search query and active tab
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (clients.find(c => c.id === invoice.clientId)?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    if (activeTab === 'all') {
      return matchesSearch;
    }
    
    return matchesSearch && invoice.status === activeTab;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, {
        id: uuidv4(),
        description: '',
        quantity: 1,
        unitPrice: 0
      }]
    }));
  };

  const updateLineItem = (index: number, key: keyof LineItem, value: string | number) => {
    const updatedLineItems = [...formData.lineItems];
    updatedLineItems[index] = { 
      ...updatedLineItems[index], 
      [key]: value 
    };
    
    setFormData(prev => ({
      ...prev,
      lineItems: updatedLineItems
    }));
  };

  const deleteLineItem = (index: number) => {
    const updatedLineItems = [...formData.lineItems];
    updatedLineItems.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      lineItems: updatedLineItems.length ? updatedLineItems : [{
        id: uuidv4(),
        description: '',
        quantity: 1,
        unitPrice: 0
      }]
    }));
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: [
        {
          id: uuidv4(),
          description: '',
          quantity: 1,
          unitPrice: 0,
        },
      ],
      notes: '',
      status: 'draft',
      taxRate: 0.1,
    });
  };

  const handleAddInvoice = () => {
    if (!formData.clientId) {
      toast.error("Please select a client");
      return;
    }
    
    addInvoice(formData);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success(t('notifications.invoiceCreated'));
  };

  const handleEditInvoice = () => {
    if (currentInvoice) {
      updateInvoice(currentInvoice.id, formData);
      setIsEditDialogOpen(false);
      toast.success(t('notifications.invoiceUpdated'));
    }
  };

  const handleDeleteInvoice = () => {
    if (currentInvoice) {
      deleteInvoice(currentInvoice.id);
      setIsDeleteDialogOpen(false);
      toast.success(t('notifications.invoiceDeleted'));
    }
  };

  const handleUpdateStatus = (invoiceId: string, status: Invoice['status']) => {
    updateInvoiceStatus(invoiceId, status);
    toast.success(t('notifications.invoiceStatusUpdated'));
    
    if (isViewDialogOpen && currentInvoice) {
      setCurrentInvoice({
        ...currentInvoice,
        status
      });
    }
  };

  const openEditDialog = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setFormData({
      clientId: invoice.clientId,
      issueDate: new Date(invoice.issueDate).toISOString().split('T')[0],
      dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
      lineItems: invoice.lineItems,
      notes: invoice.notes,
      status: invoice.status,
      taxRate: invoice.taxRate,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  // Calculate the subtotal of all line items
  const calculateSubtotal = (lineItems: LineItem[]): number => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // Calculate the tax amount based on subtotal and tax rate
  const calculateTax = (subtotal: number, taxRate: number): number => {
    return subtotal * taxRate;
  };

  // Get client by ID
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t('invoices.title')}</h1>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('invoices.addInvoice')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{t('invoices.addInvoice')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="clientId">{t('invoices.client')}</label>
                    <Select 
                      onValueChange={(value) => handleSelectChange('clientId', value)}
                      value={formData.clientId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="status">{t('invoices.status')}</label>
                    <Select 
                      onValueChange={(value) => handleSelectChange('status', value as Invoice['status'])}
                      value={formData.status}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">{t('invoices.draft')}</SelectItem>
                        <SelectItem value="sent">{t('invoices.sent')}</SelectItem>
                        <SelectItem value="paid">{t('invoices.paid')}</SelectItem>
                        <SelectItem value="overdue">{t('invoices.overdue')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="issueDate">{t('invoices.issueDate')}</label>
                    <Input
                      id="issueDate"
                      name="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="dueDate">{t('invoices.dueDate')}</label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                {/* Line Items */}
                <LineItemTable
                  items={formData.lineItems}
                  onAddItem={addLineItem}
                  onUpdateItem={updateLineItem}
                  onDeleteItem={deleteLineItem}
                />
                
                {/* Notes */}
                <div className="space-y-2">
                  <label htmlFor="notes">{t('invoices.notes')}</label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder={t('invoices.notesPlaceholder')}
                    rows={3}
                  />
                </div>
                
                {/* Tax Rate */}
                <div className="space-y-2 max-w-xs">
                  <label htmlFor="taxRate">{t('invoices.taxRate')}</label>
                  <div className="flex items-center">
                    <Input
                      id="taxRate"
                      name="taxRate"
                      type="number"
                      min={0}
                      max={1}
                      step={0.01}
                      value={formData.taxRate.toString()}
                      onChange={(e) => handleSelectChange('taxRate', parseFloat(e.target.value) || 0)}
                    />
                    <span className="ml-2">%</span>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">{t('invoices.subtotal')}</span>
                    <span>{formatCurrency(calculateSubtotal(formData.lineItems))}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">{t('invoices.tax')} ({(formData.taxRate * 100).toFixed(0)}%)</span>
                    <span>{formatCurrency(calculateTax(calculateSubtotal(formData.lineItems), formData.taxRate))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t font-bold">
                    <span>{t('invoices.grandTotal')}</span>
                    <span>
                      {formatCurrency(
                        calculateSubtotal(formData.lineItems) + 
                        calculateTax(calculateSubtotal(formData.lineItems), formData.taxRate)
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleAddInvoice}>{t('common.save')}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex justify-between items-center">
          <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
              <TabsTrigger value="draft">{t('invoices.draft')}</TabsTrigger>
              <TabsTrigger value="sent">{t('invoices.sent')}</TabsTrigger>
              <TabsTrigger value="paid">{t('invoices.paid')}</TabsTrigger>
              <TabsTrigger value="overdue">{t('invoices.overdue')}</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="w-1/3">
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('invoices.invoiceNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('invoices.client')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('invoices.issueDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('invoices.dueDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('invoices.amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('invoices.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('invoices.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <FilePlus className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {invoice.number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getClientName(invoice.clientId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(invoice.issueDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(invoice.dueDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(invoice.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openViewDialog(invoice)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(invoice)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(invoice)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {t('invoices.noInvoices')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('invoices.editInvoice')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="clientId">{t('invoices.client')}</label>
                <Select 
                  onValueChange={(value) => handleSelectChange('clientId', value)}
                  value={formData.clientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="status">{t('invoices.status')}</label>
                <Select 
                  onValueChange={(value) => handleSelectChange('status', value as Invoice['status'])}
                  value={formData.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('invoices.draft')}</SelectItem>
                    <SelectItem value="sent">{t('invoices.sent')}</SelectItem>
                    <SelectItem value="paid">{t('invoices.paid')}</SelectItem>
                    <SelectItem value="overdue">{t('invoices.overdue')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="issueDate">{t('invoices.issueDate')}</label>
                <Input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="dueDate">{t('invoices.dueDate')}</label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            {/* Line Items */}
            <LineItemTable
              items={formData.lineItems}
              onAddItem={addLineItem}
              onUpdateItem={updateLineItem}
              onDeleteItem={deleteLineItem}
            />
            
            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="notes">{t('invoices.notes')}</label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder={t('invoices.notesPlaceholder')}
                rows={3}
              />
            </div>
            
            {/* Tax Rate */}
            <div className="space-y-2 max-w-xs">
              <label htmlFor="taxRate">{t('invoices.taxRate')}</label>
              <div className="flex items-center">
                <Input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={formData.taxRate.toString()}
                  onChange={(e) => handleSelectChange('taxRate', parseFloat(e.target.value) || 0)}
                />
                <span className="ml-2">%</span>
              </div>
            </div>
            
            {/* Summary */}
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between py-2">
                <span className="font-medium">{t('invoices.subtotal')}</span>
                <span>{formatCurrency(calculateSubtotal(formData.lineItems))}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">{t('invoices.tax')} ({(formData.taxRate * 100).toFixed(0)}%)</span>
                <span>{formatCurrency(calculateTax(calculateSubtotal(formData.lineItems), formData.taxRate))}</span>
              </div>
              <div className="flex justify-between py-2 border-t font-bold">
                <span>{t('invoices.grandTotal')}</span>
                <span>
                  {formatCurrency(
                    calculateSubtotal(formData.lineItems) + 
                    calculateTax(calculateSubtotal(formData.lineItems), formData.taxRate)
                  )}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleEditInvoice}>{t('common.save')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* View Invoice Dialog */}
      {currentInvoice && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{t('invoices.viewInvoice')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p>Invoice Number: {currentInvoice.number}</p>
              {/* Display other invoice details here */}
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Invoice Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('invoices.deleteInvoice')}</AlertDialogTitle>
            <AlertDialogDescription>{t('invoices.confirmDelete')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleDeleteInvoice}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Invoices;
