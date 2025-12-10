import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, Plus, X } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';

const TransactionDetails = () => {
    const { uploadedTransactions, setUploadedTransactions } = useTransaction();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [isIdModalOpen, setIsIdModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        tradeDate: new Date().toISOString().split('T')[0],
        settlementDate: '',
        securityName: '',
        isin: '',
        transactionType: 'BUY', // Default
        exchange: 'NSE',
        quantity: '',
        price: '',
        amount: '',
        currency: 'INR',
        broker: '',
        brokerFees: ''
    });

    // Helper to calculate settlement date (T+2) basic logic
    const calculateSettlementDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        date.setDate(date.getDate() + 2);
        return date.toISOString().split('T')[0];
    };

    // Initialize Settlement Date on mount if tradeDate exists (defaults to today)
    React.useEffect(() => {
        if (formData.tradeDate && !formData.settlementDate) {
            setFormData(prev => ({ ...prev, settlementDate: calculateSettlementDate(prev.tradeDate) }));
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let updatedForm = { ...formData, [name]: value };

        // Auto-Calculate Amount
        if (name === 'quantity' || name === 'price') {
            const qty = name === 'quantity' ? parseFloat(value) : parseFloat(formData.quantity);
            const price = name === 'price' ? parseFloat(value) : parseFloat(formData.price);
            if (!isNaN(qty) && !isNaN(price)) {
                updatedForm.amount = (qty * price).toFixed(2);
            } else {
                updatedForm.amount = '';
            }
        }

        // Auto-Update Settlement Date
        if (name === 'tradeDate') {
            updatedForm.settlementDate = calculateSettlementDate(value);
        }

        // ISIN Uppercase
        if (name === 'isin') {
            updatedForm.isin = value.toUpperCase();
        }

        setFormData(updatedForm);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic Validation
        if (formData.isin.length > 12) {
            alert("ISIN must be max 12 characters.");
            return;
        }
        if (formData.settlementDate < formData.tradeDate) {
            alert("Settlement Date cannot be before Trade Date.");
            return;
        }

        const newTxn = {
            'Transaction ID': `TXN-${Math.floor(Math.random() * 10000)}`, // Placeholder ID
            'Trade Date': formData.tradeDate,
            'Settlement Date': formData.settlementDate,
            'Security Name': formData.securityName,
            'ISIN': formData.isin,
            'Transaction Type': formData.transactionType,
            'Exchange': formData.exchange,
            'Quantity': formData.quantity,
            'Price': formData.price,
            'Amount': formData.amount,
            'Currency': formData.currency,
            'Broker': formData.broker,
            'Broker Fees': formData.brokerFees
        };

        setUploadedTransactions([newTxn, ...uploadedTransactions]);
        setIsIdModalOpen(false);
        // Reset form to defaults
        setFormData({
            tradeDate: new Date().toISOString().split('T')[0],
            settlementDate: calculateSettlementDate(new Date().toISOString().split('T')[0]),
            securityName: '',
            isin: '',
            transactionType: 'BUY',
            exchange: 'NSE',
            quantity: '',
            price: '',
            amount: '',
            currency: 'INR',
            broker: '',
            brokerFees: ''
        });
    };

    const openViewModal = (txn) => {
        setSelectedTransaction(txn);
        setIsViewModalOpen(true);
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedTransactions = React.useMemo(() => {
        if (!uploadedTransactions) return [];
        let sortableItems = [...uploadedTransactions];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                // Safely handle undefined/null
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';

                // Number check
                const numA = parseFloat(valA);
                const numB = parseFloat(valB);
                if (!isNaN(numA) && !isNaN(numB)) {
                    if (numA < numB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (numA > numB) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }

                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [uploadedTransactions, sortConfig]);

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <div className="w-4 h-4 ml-1 inline-block"></div>;
        return sortConfig.direction === 'ascending' ? <ChevronUp size={16} className="ml-1 inline-block" /> : <ChevronDown size={16} className="ml-1 inline-block" />;
    };

    // Dynamic Border Color based on Type
    const getTypeStyle = (type) => {
        if (type === 'BUY') return 'border-l-4 border-green-500';
        if (type === 'SELL') return 'border-l-4 border-red-500';
        return '';
    };

    return (
        <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Transaction History</h1>
                <button
                    onClick={() => setIsIdModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    <Plus size={18} /> Add Transaction
                </button>
            </div>

            {uploadedTransactions.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {Object.keys(uploadedTransactions[0]).map((key) => (
                                        <th
                                            key={key}
                                            className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                            onClick={() => requestSort(key)}
                                        >
                                            {key} <SortIcon columnKey={key} />
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedTransactions.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        {Object.entries(row).map(([key, val], i) => (
                                            <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                                {val}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => openViewModal(row)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-lg text-gray-600 dark:text-gray-300">No transaction data available. Please upload a file in the Transactions Overview or Add a Transaction.</p>
                </div>
            )}

            {/* Add Transaction Modal */}
            {isIdModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Transaction</h2>
                            <button onClick={() => setIsIdModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Group A: Dates */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-1">Dates</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trade Date *</label>
                                        <input type="date" name="tradeDate" required value={formData.tradeDate} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Settlement Date *</label>
                                        <input type="date" name="settlementDate" required value={formData.settlementDate} onChange={handleInputChange} min={formData.tradeDate} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                    {/* ID Placeholder - Read Only */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction ID</label>
                                        <input type="text" value="TXN-NEW..." disabled className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed" />
                                    </div>
                                </div>
                            </div>

                            {/* Group B: Asset Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-1">Asset Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Security Name *</label>
                                        <input type="text" name="securityName" required value={formData.securityName} onChange={handleInputChange} placeholder="e.g. Reliance Industries" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ISIN</label>
                                        <input type="text" name="isin" maxLength="12" value={formData.isin} onChange={handleInputChange} placeholder="INE..." className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exchange</label>
                                        <select name="exchange" value={formData.exchange} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                            <option value="NSE">NSE</option>
                                            <option value="BSE">BSE</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Group C: Economics */}
                            <div className={`space-y-4 p-4 rounded-md border ${formData.transactionType === 'BUY' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300 pb-1">Economics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                        <select name="transactionType" value={formData.transactionType} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                            <option value="BUY">BUY</option>
                                            <option value="SELL">SELL</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity *</label>
                                        <input type="number" name="quantity" required min="1" value={formData.quantity} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price *</label>
                                        <input type="number" name="price" required step="0.01" value={formData.price} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Amount (Calc)</label>
                                        <input type="text" value={formData.amount} disabled className="w-full p-2 border rounded bg-gray-200 dark:bg-gray-600 dark:text-white font-bold text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                                        <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                            <option value="INR">INR</option>
                                            <option value="NPR">NPR</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Group D: Execution */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-1">Execution</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Broker</label>
                                        <select name="broker" value={formData.broker} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                            <option value="">Select Broker</option>
                                            <option value="ABC Securities">ABC Securities</option>
                                            <option value="XYZ Capital">XYZ Capital</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Broker Fees</label>
                                        <input type="number" name="brokerFees" value={formData.brokerFees} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t dark:border-gray-700 gap-4">
                                <button type="button" onClick={() => setIsIdModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition">Save Transaction</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {isViewModalOpen && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Transaction Details</h2>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><X size={24} /></button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(selectedTransaction).map(([key, value]) => (
                                    <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border dark:border-gray-600">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{key}</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white break-words">{value !== null && value !== undefined ? value.toString() : '-'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end p-6 border-t dark:border-gray-700">
                            <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionDetails;
