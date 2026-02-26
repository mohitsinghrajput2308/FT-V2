import { format } from 'date-fns';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Downloads a string or blob to the user's computer.
 */
const triggerDownload = (content, filename, type = 'text/csv;charset=utf-8;') => {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Maps transaction objects to a flat array of strings for export.
 */
const prepDataForExport = (transactions, currency) => {
    return transactions.map(t => ({
        Date: format(new Date(t.date), 'yyyy-MM-dd'),
        Type: t.type.toUpperCase(),
        Category: t.category,
        Name: t.name,
        Amount: t.type === 'expense' ? `-${t.amount}` : `${t.amount}`,
        Currency: currency,
        'Payment Method': t.paymentMethod || 'N/A',
        Description: t.description || ''
    }));
};

/**
 * Generates and downloads a CSV file of transactions.
 */
export const exportTransactionsToCSV = (transactions, currency = 'USD') => {
    if (!transactions || transactions.length === 0) return;

    const data = prepDataForExport(transactions, currency);
    const csvContent = Papa.unparse(data);

    // Create Blob URL for downloading
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fintrack_transactions_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Generates and downloads a formatted PDF report of transactions.
 */
export const exportTransactionsToPDF = (transactions, currency = 'USD') => {
    if (!transactions || transactions.length === 0) return;

    const doc = new jsPDF();
    const data = prepDataForExport(transactions, currency);

    // Document header
    doc.setFontSize(20);
    doc.text('FinTrack Transaction Report', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 14, 30);
    doc.text(`Total Records: ${transactions.length}`, 14, 36);

    // Calculate Summary Stats
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    doc.text(`Total Income: ${currency} ${income.toFixed(2)}`, 140, 30);
    doc.text(`Total Expenses: ${currency} ${expenses.toFixed(2)}`, 140, 36);

    // Table
    const tableColumn = Object.keys(data[0]);
    const tableRows = data.map(obj => Object.values(obj));

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246] }, // Tailwind blue-500
        alternateRowStyles: { fillColor: [249, 250, 251] } // Tailwind gray-50
    });

    doc.save(`fintrack_report_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
