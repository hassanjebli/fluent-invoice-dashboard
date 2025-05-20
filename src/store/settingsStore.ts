
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  vat: string;
  logoUrl: string;
}

interface SettingsState {
  language: 'en' | 'fr' | 'ar';
  theme: 'light' | 'dark' | 'system';
  companyInfo: CompanyInfo;
  setLanguage: (language: 'en' | 'fr' | 'ar') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      theme: 'system',
      companyInfo: {
        name: 'InvoiceCraft Inc.',
        address: '123 Business Avenue, Suite 101, New York, NY 10001',
        phone: '+1 (555) 123-4567',
        email: 'contact@invoicecraft.example',
        vat: 'US123456789',
        logoUrl: '',
      },
      
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      updateCompanyInfo: (info) => set((state) => ({ 
        companyInfo: { ...state.companyInfo, ...info } 
      })),
    }),
    {
      name: 'settings-storage', // name of the item in localStorage
    }
  )
);
