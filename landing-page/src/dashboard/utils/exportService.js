import { format } from 'date-fns';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Currency symbol to code mapping for PDF compatibility
 * (jsPDF doesn't support all Unicode symbols like ₹)
 */
const CURRENCY_MAP = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR',
    'C$': 'CAD',
    'A$': 'AUD',
    'CHF': 'CHF',
    'kr': 'SEK',
    'kr': 'NOK',
    'R$': 'BRL',
    '₽': 'RUB',
    '฿': 'THB',
    '₩': 'KRW',
    'php': 'PHP',
    'Rp': 'IDR',
};

/**
 * Get PDF-safe currency representation
 * Converts Unicode symbols to currency codes for better PDF compatibility
 */
const getPDFCurrency = (currency) => {
    // If it's already a code (3+ chars), return as is
    if (currency && currency.length > 1) return currency;
    
    // If it's a symbol, convert to code, otherwise return the currency
    return CURRENCY_MAP[currency] || currency;
};

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

    // Add BOM (Byte Order Mark) for UTF-8 to ensure proper character encoding
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;
    
    // Create Blob URL for downloading with UTF-8 encoding
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
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
    
    // Get PDF-safe currency representation
    const pdfCurrency = getPDFCurrency(currency);

    // Set default font
    doc.setFont('Helvetica');

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

    doc.setTextColor(0);
    doc.text(`Total Income: ${pdfCurrency} ${income.toFixed(2)}`, 140, 30);
    doc.text(`Total Expenses: ${pdfCurrency} ${expenses.toFixed(2)}`, 140, 36);

    // Table - also use PDF-safe currency in table data
    const tableColumn = Object.keys(data[0]);
    const tableRows = data.map(obj => {
        const row = Object.values(obj);
        // Replace currency symbol in the Currency column (index 5) with currency code
        if (row[5] === currency) {
            row[5] = pdfCurrency;
        }
        return row;
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, font: 'Helvetica' },
        headStyles: { fillColor: [59, 130, 246] }, // Tailwind blue-500
        alternateRowStyles: { fillColor: [249, 250, 251] } // Tailwind gray-50
    });

    doc.save(`fintrack_report_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
