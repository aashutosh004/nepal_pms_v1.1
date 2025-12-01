import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManualRebalancing = () => {
    const navigate = useNavigate();
    const [equityValue, setEquityValue] = useState(0);
    const [debtValue, setDebtValue] = useState(0);

    const [sellEquity, setSellEquity] = useState(0);
    const [buyDebt, setBuyDebt] = useState(0);
    const [sellDebt, setSellDebt] = useState(0);
    const [buyEquity, setBuyEquity] = useState(0);

    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const res = await axios.get('http://localhost:8000/portfolio/1');
                setEquityValue(res.data.EquityValue);
                setDebtValue(res.data.DebtValue);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPortfolio();
    }, []);

    const handleApply = () => {
        // Logic: Update the "current" values based on the manual inputs
        // This is a simulation since we aren't actually executing trades on the backend in this prototype
        const newEquity = equityValue - parseFloat(sellEquity || 0) + parseFloat(buyEquity || 0);
        const newDebt = debtValue - parseFloat(sellDebt || 0) + parseFloat(buyDebt || 0);

        setEquityValue(newEquity);
        setDebtValue(newDebt);

        // Reset inputs
        setSellEquity(0);
        setBuyDebt(0);
        setSellDebt(0);
        setBuyEquity(0);

        setMessage(`Rebalance applied! New Allocation - Equity: ₹${newEquity.toLocaleString()}, Debt: ₹${newDebt.toLocaleString()}`);

        // Optional: Navigate back to assessment or stay here
        // navigate('/rebalancing'); 
    };

    const handleExportCSV = () => {
        const rows = [
            ['Action', 'Asset', 'Amount'],
            ['Sell', 'Equity', sellEquity],
            ['Buy', 'Debt', buyDebt],
            ['Sell', 'Debt', sellDebt],
            ['Buy', 'Equity', buyEquity]
        ];

        // Filter out 0 amounts
        const activeRows = rows.filter((row, index) => index === 0 || row[2] > 0);

        let csvContent = "data:text/csv;charset=utf-8,"
            + activeRows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "manual_rebalancing_proposal.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('/rebalancing')} className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manual Rebalancing Proposal</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
                    The wireframe calculates the amount to move from the overweight asset to the underweight asset to restore 50/50.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    {/* Row 1 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proposed Sell from Equity (₹)</label>
                        <input
                            type="number"
                            value={sellEquity}
                            onChange={(e) => setSellEquity(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proposed Buy to Debt (₹)</label>
                        <input
                            type="number"
                            value={buyDebt}
                            onChange={(e) => setBuyDebt(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Row 2 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Or Sell from Debt (₹)</label>
                        <input
                            type="number"
                            value={sellDebt}
                            onChange={(e) => setSellDebt(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buy to Equity (₹)</label>
                        <input
                            type="number"
                            value={buyEquity}
                            onChange={(e) => setBuyEquity(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-4 mt-8">
                    <button
                        onClick={handleApply}
                        className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800 font-medium transition-colors"
                    >
                        Apply Manual Rebalance
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                    >
                        <Download size={16} className="mr-2" /> Export Proposal CSV
                    </button>
                </div>

                {message && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md flex items-center">
                        <CheckCircle size={20} className="mr-2" />
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManualRebalancing;
