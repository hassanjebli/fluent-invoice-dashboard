
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  notes: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  totalAmount: number;
  taxRate: number;
  createdAt: string;
}

export interface Quote {
  id: string;
  number: string;
  clientId: string;
  issueDate: string;
  validUntil: string;
  lineItems: LineItem[];
  notes: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  totalAmount: number;
  taxRate: number;
  createdAt: string;
}

interface DataState {
  clients: Client[];
  invoices: Invoice[];
  quotes: Quote[];
  
  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => string;
  updateClient: (id: string, client: Partial<Omit<Client, 'id' | 'createdAt'>>) => void;
  deleteClient: (id: string) => void;
  
  // Invoice actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'number' | 'totalAmount'>) => string;
  updateInvoice: (id: string, invoice: Partial<Omit<Invoice, 'id' | 'createdAt' | 'number'>>) => void;
  deleteInvoice: (id: string) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  
  // Quote actions
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'number' | 'totalAmount'>) => string;
  updateQuote: (id: string, quote: Partial<Omit<Quote, 'id' | 'createdAt' | 'number'>>) => void;
  deleteQuote: (id: string) => void;
  updateQuoteStatus: (id: string, status: Quote['status']) => void;
  
  // Data initialization for demo
  initializeDemoData: () => void;
}

// Helper to calculate total from line items
const calculateTotal = (lineItems: LineItem[]): number => {
  return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
};

// Generate a formatted number for invoices/quotes
const generateNumber = (prefix: string, count: number): string => {
  return `${prefix}-${String(count).padStart(5, '0')}`;
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      clients: [],
      invoices: [],
      quotes: [],
      
      addClient: (clientData) => {
        const id = uuidv4();
        const client = {
          ...clientData,
          id,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          clients: [...state.clients, client]
        }));
        
        return id;
      },
      
      updateClient: (id, clientData) => {
        set((state) => ({
          clients: state.clients.map((client) => 
            client.id === id ? { ...client, ...clientData } : client
          )
        }));
      },
      
      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id)
        }));
      },
      
      addInvoice: (invoiceData) => {
        const id = uuidv4();
        const totalAmount = calculateTotal(invoiceData.lineItems);
        const invoice = {
          ...invoiceData,
          id,
          number: generateNumber('INV', get().invoices.length + 1),
          totalAmount,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          invoices: [...state.invoices, invoice]
        }));
        
        return id;
      },
      
      updateInvoice: (id, invoiceData) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) => {
            if (invoice.id === id) {
              const updatedInvoice = { ...invoice, ...invoiceData };
              
              // Recalculate total if line items changed
              if (invoiceData.lineItems) {
                updatedInvoice.totalAmount = calculateTotal(updatedInvoice.lineItems);
              }
              
              return updatedInvoice;
            }
            return invoice;
          })
        }));
      },
      
      deleteInvoice: (id) => {
        set((state) => ({
          invoices: state.invoices.filter((invoice) => invoice.id !== id)
        }));
      },
      
      updateInvoiceStatus: (id, status) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.id === id ? { ...invoice, status } : invoice
          )
        }));
      },
      
      addQuote: (quoteData) => {
        const id = uuidv4();
        const totalAmount = calculateTotal(quoteData.lineItems);
        const quote = {
          ...quoteData,
          id,
          number: generateNumber('QUO', get().quotes.length + 1),
          totalAmount,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          quotes: [...state.quotes, quote]
        }));
        
        return id;
      },
      
      updateQuote: (id, quoteData) => {
        set((state) => ({
          quotes: state.quotes.map((quote) => {
            if (quote.id === id) {
              const updatedQuote = { ...quote, ...quoteData };
              
              // Recalculate total if line items changed
              if (quoteData.lineItems) {
                updatedQuote.totalAmount = calculateTotal(updatedQuote.lineItems);
              }
              
              return updatedQuote;
            }
            return quote;
          })
        }));
      },
      
      deleteQuote: (id) => {
        set((state) => ({
          quotes: state.quotes.filter((quote) => quote.id !== id)
        }));
      },
      
      updateQuoteStatus: (id, status) => {
        set((state) => ({
          quotes: state.quotes.map((quote) =>
            quote.id === id ? { ...quote, status } : quote
          )
        }));
      },
      
      initializeDemoData: () => {
        // Only initialize if data is empty
        if (get().clients.length > 0) return;
        
        // Demo clients
        const clientIds = [
          'c1', 'c2', 'c3', 'c4', 'c5'
        ];
        
        const demoClients = [
          {
            id: clientIds[0],
            name: 'Acme Corporation',
            email: 'contact@acme.example',
            phone: '+1 (555) 123-4567',
            address: '123 Business St, New York, NY 10001',
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: clientIds[1],
            name: 'Globex Corporation',
            email: 'info@globex.example',
            phone: '+1 (555) 987-6543',
            address: '456 Industry Ave, San Francisco, CA 94107',
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: clientIds[2],
            name: 'Stark Industries',
            email: 'sales@stark.example',
            phone: '+1 (555) 333-2222',
            address: '789 Tech Blvd, Malibu, CA 90265',
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: clientIds[3],
            name: 'Wayne Enterprises',
            email: 'contact@wayne.example',
            phone: '+1 (555) 888-9999',
            address: '1007 Mountain Drive, Gotham, NJ 07001',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: clientIds[4],
            name: 'Soylent Corp',
            email: 'info@soylent.example',
            phone: '+1 (555) 444-3333',
            address: '555 Food Processing Way, Chicago, IL 60601',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ];
        
        // Demo invoices (3 months of data)
        const monthlyInvoiceData = [];
        
        // Generate data for the last 3 months
        for (let i = 2; i >= 0; i--) {
          const monthStart = new Date();
          monthStart.setMonth(monthStart.getMonth() - i);
          monthStart.setDate(1);
          
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          monthEnd.setDate(0);
          
          // Generate 3-5 invoices per month
          const invoiceCount = Math.floor(Math.random() * 3) + 3;
          
          for (let j = 0; j < invoiceCount; j++) {
            const issueDate = new Date(
              monthStart.getTime() + Math.random() * (monthEnd.getTime() - monthStart.getTime())
            );
            
            const dueDate = new Date(issueDate);
            dueDate.setDate(dueDate.getDate() + 30);
            
            const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
            
            // Determine status based on due date
            let status: Invoice['status'] = 'sent';
            if (dueDate < new Date()) {
              status = Math.random() > 0.7 ? 'overdue' : 'paid';
            } else {
              status = Math.random() > 0.5 ? 'sent' : 'paid';
            }
            
            // Generate 1-5 line items
            const lineItemCount = Math.floor(Math.random() * 5) + 1;
            const lineItems: LineItem[] = [];
            
            for (let k = 0; k < lineItemCount; k++) {
              lineItems.push({
                id: `li-${uuidv4()}`,
                description: `Service ${k + 1}`,
                quantity: Math.floor(Math.random() * 10) + 1,
                unitPrice: Math.floor(Math.random() * 1000) + 100
              });
            }
            
            monthlyInvoiceData.push({
              id: `inv-${i}-${j}`,
              number: `INV-${String(i * 10 + j).padStart(5, '0')}`,
              clientId,
              issueDate: issueDate.toISOString(),
              dueDate: dueDate.toISOString(),
              lineItems,
              notes: 'Thank you for your business!',
              status,
              totalAmount: calculateTotal(lineItems),
              taxRate: 0.1, // 10% tax
              createdAt: issueDate.toISOString()
            });
          }
        }
        
        // Generate quotes (similar to invoices but fewer)
        const quotes = [
          {
            id: 'q1',
            number: 'QUO-00001',
            clientId: clientIds[0],
            issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            lineItems: [
              {
                id: 'qli-1',
                description: 'Website Development',
                quantity: 1,
                unitPrice: 5000
              },
              {
                id: 'qli-2',
                description: 'SEO Setup',
                quantity: 1,
                unitPrice: 1500
              }
            ],
            notes: 'This quote is valid for 30 days.',
            status: 'sent' as Quote['status'],
            totalAmount: 6500,
            taxRate: 0.1,
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'q2',
            number: 'QUO-00002',
            clientId: clientIds[2],
            issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            lineItems: [
              {
                id: 'qli-3',
                description: 'Mobile App Development',
                quantity: 1,
                unitPrice: 12000
              }
            ],
            notes: 'Payment terms: 50% upfront, 50% upon completion.',
            status: 'accepted' as Quote['status'],
            totalAmount: 12000,
            taxRate: 0.1,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        set({
          clients: demoClients,
          invoices: monthlyInvoiceData,
          quotes: quotes
        });
      }
    }),
    {
      name: 'data-storage', // name of the item in localStorage
    }
  )
);

// Initialize demo data when the app is loaded for the first time
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useDataStore.getState().initializeDemoData();
  }, 100);
}
