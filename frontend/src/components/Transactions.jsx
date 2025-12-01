import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const Transactions = () => {
    const [transactions, setTransactions] = useState([
        { id: 1, date: '2025-11-18', type: 'Buy', quantity: 50, price: 100, amount: 5000 },
        { id: 2, date: '2025-11-17', type: 'Sell', quantity: 20, price: 120, amount: 2400 },
    ]);

    const [formData, setFormData] = useState({
        type: 'Buy',
        date: '',
        quantity: '',
        price: ''
    });

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTransaction = {
            id: transactions.length + 1,
            date: formData.date,
            type: formData.type,
            quantity: Number(formData.quantity),
            price: Number(formData.price),
            amount: Number(formData.quantity) * Number(formData.price)
        };
        setTransactions([newTransaction, ...transactions]);
        setFormData({ type: 'Buy', date: '', quantity: '', price: '' });
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedTransactions = React.useMemo(() => {
        let sortableItems = [...transactions];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [transactions, sortConfig]);

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <div className="w-4 h-4 ml-1 inline-block"></div>;
        return sortConfig.direction === 'ascending' ? <ChevronUp size={16} className="ml-1 inline-block" /> : <ChevronDown size={16} className="ml-1 inline-block" />;
    };

    return (
        <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Transactions</h1>

            {/* Add Transaction Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Add Transaction</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="Buy">Buy</option>
                            <option value="Sell">Sell</option>
                        </select>
                    </div>
                    <div className="relative">
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="mm/dd/yyyy"
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            placeholder="Quantity"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="Price"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>

            {/* Transaction History Table */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Transaction History</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => requestSort('date')}
                                >
                                    Date <SortIcon columnKey="date" />
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => requestSort('type')}
                                >
                                    Type <SortIcon columnKey="type" />
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => requestSort('quantity')}
                                >
                                    Quantity <SortIcon columnKey="quantity" />
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => requestSort('price')}
                                >
                                    Price <SortIcon columnKey="price" />
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => requestSort('amount')}
                                >
                                    Amount <SortIcon columnKey="amount" />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedTransactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{transaction.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{transaction.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{transaction.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">${transaction.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">${transaction.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
