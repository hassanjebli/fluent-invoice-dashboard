
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataStore } from '../store/dataStore';
import { formatCurrency } from '../utils/formatters';
import { ChartBar, CreditCard, FileText, User } from 'lucide-react';
import StatCard from '../components/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { invoices, clients } = useDataStore();
  const [monthlyData, setMonthlyData] = useState<Array<{ name: string; amount: number }>>([]);
  const [statusData, setStatusData] = useState<Array<{ name: string; value: number }>>([]);
  const [topClientsData, setTopClientsData] = useState<Array<{ name: string; value: number }>>([]);

  // Calculate dashboard stats and prepare chart data
  useEffect(() => {
    if (invoices.length > 0) {
      // Calculate monthly data for the bar chart
      const monthlyStats = invoices.reduce((stats: Record<string, number>, invoice) => {
        const date = new Date(invoice.issueDate);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        if (!stats[monthYear]) {
          stats[monthYear] = 0;
        }
        
        stats[monthYear] += invoice.totalAmount;
        return stats;
      }, {});

      const monthlyDataArray = Object.entries(monthlyStats).map(([name, amount]) => ({
        name,
        amount,
      }));
      
      setMonthlyData(monthlyDataArray);
      
      // Calculate invoice status data for the pie chart
      const statusStats = invoices.reduce((stats: Record<string, number>, invoice) => {
        if (!stats[invoice.status]) {
          stats[invoice.status] = 0;
        }
        
        stats[invoice.status] += 1;
        return stats;
      }, {});

      const statusDataArray = Object.entries(statusStats).map(([name, value]) => ({
        name: t(`invoices.${name}`),
        value,
      }));
      
      setStatusData(statusDataArray);
      
      // Calculate top clients data for the pie chart
      const clientInvoiceTotal: Record<string, number> = {};
      
      invoices.forEach(invoice => {
        if (!clientInvoiceTotal[invoice.clientId]) {
          clientInvoiceTotal[invoice.clientId] = 0;
        }
        
        clientInvoiceTotal[invoice.clientId] += invoice.totalAmount;
      });
      
      // Sort clients by total invoice amount and take top 5
      const sortedClients = Object.entries(clientInvoiceTotal)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
      
      const topClientsDataArray = sortedClients.map(([clientId, value]) => {
        const client = clients.find(c => c.id === clientId);
        return {
          name: client ? client.name : 'Unknown Client',
          value,
        };
      });
      
      setTopClientsData(topClientsDataArray);
    }
  }, [invoices, clients, t]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

  // Calculate totals for stats cards
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const unpaidInvoices = invoices.filter(inv => inv.status === 'sent');
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('dashboard.welcomeMessage')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title={t('dashboard.totalIncome')}
            value={formatCurrency(totalInvoiced)}
            icon={<ChartBar className="h-4 w-4" />}
          />
          
          <StatCard 
            title={t('dashboard.paidInvoices')}
            value={formatCurrency(totalPaid)}
            icon={<CreditCard className="h-4 w-4" />}
          />
          
          <StatCard 
            title={t('dashboard.unpaidInvoices')}
            value={formatCurrency(totalUnpaid)}
            icon={<FileText className="h-4 w-4" />}
          />
          
          <StatCard 
            title={t('dashboard.overdue')}
            value={formatCurrency(totalOverdue)}
            icon={<FileText className="h-4 w-4" />}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.monthlyRevenue')}</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.clientBreakdown')}</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topClientsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {topClientsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
