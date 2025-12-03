import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';

const TransactionDetails = () => {
    const { uploadedTransactions } = useTransaction();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedTransactions = React.useMemo(() => {
        let sortableItems = [...uploadedTransactions];
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
    }, [uploadedTransactions, sortConfig]);

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <div className="w-4 h-4 ml-1 inline-block"></div>;
        return sortConfig.direction === 'ascending' ? <ChevronUp size={16} className="ml-1 inline-block" /> : <ChevronDown size={16} className="ml-1 inline-block" />;
    };

    return (
        <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Transaction Details</h1>
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
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedTransactions.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        {Object.values(row).map((val, i) => (
                                            <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-lg text-gray-600 dark:text-gray-300">No transaction data available. Please upload a file in the Transactions Overview.</p>
                </div>
            )}
        </div>
    );
};

export default TransactionDetails;
