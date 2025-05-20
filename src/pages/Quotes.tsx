import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../layouts/DashboardLayout';
import { useDataStore, Quote, LineItem, Client } from '../store/dataStore';
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
import { exportToPDF } from '../utils/pdfExport';

const Quotes: React.FC = () => {
  const { t } = useTranslation();
  const { quotes, clients, addQuote, updateQuote, deleteQuote, updateQuoteStatus, addInvoice } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: '',
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [
      {
        id: uuidv4(),
        description: '',
        quantity: 1,
        unitPrice: 0,
      },
    ],
    notes: '',
    status: 'draft' as Quote['status'],
    taxRate: 0.1,
  });

  // Filter quotes based on search query and active tab
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (clients.find(c => c.id === quote.clientId)?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    if (activeTab === 'all') {
      return matchesSearch;
    }
    
    return matchesSearch && quote.status === activeTab;
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
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

  const handleAddQuote = () => {
    if (!formData.clientId) {
      toast.error("Please select a client");
      return;
    }
    
    addQuote(formData);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success(t('notifications.quoteCreated'));
  };

  const handleEditQuote = () => {
    if (currentQuote) {
      updateQuote(currentQuote.id, formData);
      setIsEditDialogOpen(false);
      toast.success(t('notifications.quoteUpdated'));
    }
  };

  const handleDeleteQuote = () => {
    if (currentQuote) {
      deleteQuote(currentQuote.id);
      setIsDeleteDialogOpen(false);
      toast.success(t('notifications.quoteDeleted'));
    }
  };

  const handleUpdateStatus = (quoteId: string, status: Quote['status']) => {
    updateQuoteStatus(quoteId, status);
    toast.success(t('notifications.quoteStatusUpdated'));
    
    if (isViewDialogOpen && currentQuote) {
      setCurrentQuote({
        ...currentQuote,
        status
      });
    }
  };

  const handleConvertToInvoice = () => {
    if (currentQuote) {
      // Convert quote to invoice
      const invoiceData = {
        clientId: currentQuote.clientId,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lineItems: currentQuote.lineItems,
        notes: currentQuote.notes,
        status: 'sent' as const,
        taxRate: currentQuote.taxRate,
      };
      
      addInvoice(invoiceData);
      
      // Mark quote as accepted
      updateQuoteStatus(currentQuote.id, 'accepted');
      setIsViewDialogOpen(false);
      toast.success('Quote converted to invoice');
    }
  };

  const openEditDialog = (quote: Quote) => {
    setCurrentQuote(quote);
    setFormData({
      clientId: quote.clientId,
      issueDate: new Date(quote.issueDate).toISOString().split('T')[0],
      validUntil: new Date(quote.validUntil).toISOString().split('T')[0],
      lineItems: quote.lineItems,
      notes: quote.notes,
      status: quote.status,
      taxRate: quote.taxRate,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (quote: Quote) => {
    setCurrentQuote(quote);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (quote: Quote) => {
    setCurrentQuote(quote);
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

  // Export quote to PDF
  const handleExportPdf = async () => {
    if (!currentQuote) return;
    
    setIsExporting(true);
    try {
      await exportToPDF('quote-pdf', `Quote-${currentQuote.number}.pdf`);
      toast.success(t('notifications.pdfExported'));
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
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
          <h1 className="text-3xl font-bold">{t('quotes.title')}</h1>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('quotes.addQuote')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{t('quotes.addQuote')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="clientId">{t('quotes.client')}</label>
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
                    <label htmlFor="status">{t('quotes.status')}</label>
                    <Select 
                      onValueChange={(value) => handleSelectChange('status', value as Quote['status'])}
                      value={formData.status}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">{t('quotes.draft')}</SelectItem>
                        <SelectItem value="sent">{t('quotes.sent')}</SelectItem>
                        <SelectItem value="accepted">{t('quotes.accepted')}</SelectItem>
                        <SelectItem value="rejected">{t('quotes.rejected')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="issueDate">{t('quotes.issueDate')}</label>
                    <Input
                      id="issueDate"
                      name="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="validUntil">{t('quotes.validUntil')}</label>
                    <Input
                      id="validUntil"
                      name="validUntil"
                      type="date"
                      value={formData.validUntil}
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
                  <label htmlFor="notes">{t('quotes.notes')}</label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder={t('quotes.notesPlaceholder')}
                    rows={3}
                  />
                </div>
                
                {/* Tax Rate */}
                <div className="space-y-2 max-w-xs">
                  <label htmlFor="taxRate">{t('quotes.taxRate')}</label>
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
                    <span className="font-medium">{t('quotes.subtotal')}</span>
                    <span>{formatCurrency(calculateSubtotal(formData.lineItems))}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">{t('quotes.tax')} ({(formData.taxRate * 100).toFixed(0)}%)</span>
                    <span>{formatCurrency(calculateTax(calculateSubtotal(formData.lineItems), formData.taxRate))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t font-bold">
                    <span>{t('quotes.grandTotal')}</span>
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
                  <Button onClick={handleAddQuote}>{t('common.save')}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex justify-between items-center">
          <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
              <TabsTrigger value="draft">{t('quotes.draft')}</TabsTrigger>
              <TabsTrigger value="sent">{t('quotes.sent')}</TabsTrigger>
              <TabsTrigger value="accepted">{t('quotes.accepted')}</TabsTrigger>
              <TabsTrigger value="rejected">{t('quotes.rejected')}</TabsTrigger>
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
                    {t('quotes.quoteNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('quotes.client')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('quotes.issueDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('quotes.validUntil')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('quotes.amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('quotes.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('quotes.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredQuotes.length > 0 ? (
                  filteredQuotes.map((quote) => (
                    <tr key={quote.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <FilePlus className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {quote.number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getClientName(quote.clientId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(quote.issueDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(quote.validUntil)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(quote.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={quote.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openViewDialog(quote)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(quote)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(quote)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {t('quotes.noQuotes')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Edit Quote Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('quotes.editQuote')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="clientId">{t('quotes.client')}</label>
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
                <label htmlFor="status">{t('quotes.status')}</label>
                <Select 
                  onValueChange={(value) => handleSelectChange('status', value as Quote['status'])}
                  value={formData.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('quotes.draft')}</SelectItem>
                    <SelectItem value="sent">{t('quotes.sent')}</SelectItem>
                    <SelectItem value="accepted">{t('quotes.accepted')}</SelectItem>
                    <SelectItem value="rejected">{t('quotes.rejected')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="issueDate">{t('quotes.issueDate')}</label>
                <Input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="validUntil">{t('quotes.validUntil')}</label>
                <Input
                  id="validUntil"
                  name="validUntil"
                  type="date"
                  value={formData.validUntil}
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
              <label htmlFor="notes">{t('quotes.notes')}</label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder={t('quotes.notesPlaceholder')}
                rows={3}
              />
            </div>
            
            {/* Tax Rate */}
            <div className="space-y-2 max-w-xs">
              <label htmlFor="taxRate">{t('quotes.taxRate')}</label>
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
                <span className="font-medium">{t('quotes.subtotal')}</span>
                <span>{formatCurrency(calculateSubtotal(formData.lineItems))}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">{t('quotes.tax')} ({(formData.taxRate * 100).toFixed(0)}%)</span>
                <span>{formatCurrency(calculateTax(calculateSubtotal(formData.lineItems), formData.taxRate))}</span>
              </div>
              <div className="flex justify-between py-2 border-t font-bold">
                <span>{t('quotes.grandTotal')}</span>
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
              <Button onClick={handleEditQuote}>{t('common.save')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* View Quote Dialog */}
      {currentQuote && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>{t('quotes.viewQuote')}</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={handleExportPdf} disabled={isExporting}>
                    {isExporting ? t('common.loading') : t('quotes.exportPDF')}
                  </Button>
                  
                  {currentQuote.status === 'sent' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(currentQuote.id, 'accepted')}
                      >
                        {t('quotes.markAsAccepted')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(currentQuote.id, 'rejected')}
                      >
                        {t('quotes.markAsRejected')}
                      </Button>
                    </>
                  )}
                  
                  {currentQuote.status !== 'rejected' && (
                    <Button
                      size="sm"
                      onClick={handleConvertToInvoice}
                    >
                      {t('quotes.convertToInvoice')}
                    </Button>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div id="quote-pdf" className="bg-white p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="mb-8 flex justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {t('quotes.quoteNumber')}: {currentQuote.number}
                  </h2>
                  <div>
                    <p><strong>{t('quotes.issueDate')}:</strong> {formatDate(currentQuote.issueDate)}</p>
                    <p><strong>{t('quotes.validUntil')}:</strong> {formatDate(currentQuote.validUntil)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={currentQuote.status} />
                </div>
              </div>
              
              <div className="mb-8 grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold mb-2">{t('quotes.from')}:</h3>
                  <div>
                    <p className="font-semibold">InvoiceCraft Inc.</p>
                    <p>123 Business Avenue, Suite 101</p>
                    <p>New York, NY 10001</p>
                    <p>contact@invoicecraft.example</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">{t('quotes.to')}:</h3>
                  {(() => {
                    const client = clients.find(c => c.id === currentQuote.clientId);
                    return client ? (
                      <div>
                        <p className="font-semibold">{client.name}</p>
                        <p>{client.address}</p>
                        <p>{client.email}</p>
                        <p>{client.phone}</p>
                      </div>
                    ) : (
                      <p>Client not found</p>
                    );
                  })()}
                </div>
              </div>
              
              <div className="mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2">{t('quotes.description')}</th>
                      <th className="text-right py-2">{t('quotes.quantity')}</th>
                      <th className="text-right py-2">{t('quotes.unitPrice')}</th>
                      <th className="text-right py-2">{t('quotes.total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentQuote.lineItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200">
                        <td className="py-2">{item.description}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-right py-2">{formatCurrency(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span>{t('quotes.subtotal')}</span>
                    <span>{formatCurrency(calculateSubtotal(currentQuote.lineItems))}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>{t('quotes.tax')} ({(currentQuote.taxRate * 100).toFixed(0)}%)</span>
                    <span>{formatCurrency(calculateTax(calculateSubtotal(currentQuote.lineItems), currentQuote.taxRate))}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold border-t border-gray-200">
                    <span>{t('quotes.grandTotal')}</span>
                    <span>{formatCurrency(currentQuote.totalAmount)}</span>
                  </div>
                </div>
              </div>
              
              {currentQuote.notes && (
                <div className="mt-8 border-t pt-4">
                  <h3 className="font-bold mb-2">{t('quotes.notes')}:</h3>
                  <p>{currentQuote.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Quote Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('quotes.deleteQuote')}</AlertDialogTitle>
            <AlertDialogDescription>{t('quotes.confirmDelete')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleDeleteQuote}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Quotes;
