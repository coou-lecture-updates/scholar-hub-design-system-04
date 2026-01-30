import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  reference?: string;
  created_at: string;
}

interface TransactionExportProps {
  transactions: Transaction[];
  userName?: string;
}

const TransactionExport: React.FC<TransactionExportProps> = ({ 
  transactions,
  userName = 'User'
}) => {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = ['Date', 'Type', 'Description', 'Amount (₦)', 'Reference'];
      const rows = transactions.map(t => [
        format(new Date(t.created_at), 'yyyy-MM-dd HH:mm'),
        t.type === 'credit' ? 'Credit' : 'Debit',
        t.description,
        t.type === 'credit' ? `+${t.amount}` : `-${t.amount}`,
        t.reference || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    setExporting(true);
    try {
      // Create a printable HTML document
      const totalCredits = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalDebits = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Transaction History - ${userName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e40af; margin-bottom: 5px; }
            .date { color: #666; margin-bottom: 20px; }
            .summary { display: flex; gap: 20px; margin-bottom: 30px; }
            .summary-item { padding: 15px; background: #f3f4f6; border-radius: 8px; }
            .summary-item.credit { background: #dcfce7; }
            .summary-item.debit { background: #fee2e2; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f9fafb; font-weight: 600; }
            .credit { color: #16a34a; }
            .debit { color: #dc2626; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>Transaction History</h1>
          <p class="date">Generated on ${format(new Date(), 'MMMM dd, yyyy')}</p>
          
          <div class="summary">
            <div class="summary-item credit">
              <strong>Total Credits</strong><br/>
              ₦${totalCredits.toLocaleString()}
            </div>
            <div class="summary-item debit">
              <strong>Total Debits</strong><br/>
              ₦${totalDebits.toLocaleString()}
            </div>
            <div class="summary-item">
              <strong>Net Balance</strong><br/>
              ₦${(totalCredits - totalDebits).toLocaleString()}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => `
                <tr>
                  <td>${format(new Date(t.created_at), 'MMM dd, yyyy HH:mm')}</td>
                  <td>${t.description}</td>
                  <td class="${t.type}">${t.type === 'credit' ? 'Credit' : 'Debit'}</td>
                  <td class="${t.type}">${t.type === 'credit' ? '+' : '-'}₦${t.amount.toLocaleString()}</td>
                  <td>${t.reference || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting || transactions.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV} className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TransactionExport;
