import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const PortfolioRebalancing = () => {
    const [equityValue, setEquityValue] = useState(0);
    const [debtValue, setDebtValue] = useState(0);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch current values from API to pre-fill
    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const res = await axios.get('http://localhost:8000/portfolio/1');
                setEquityValue(res.data.EquityValue);
                setDebtValue(res.data.DebtValue);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, []);

    const handleAssess = () => {
        const equity = parseFloat(equityValue) || 0;
        const debt = parseFloat(debtValue) || 0;
        const total = equity + debt;

        if (total === 0) return;

        const equityPct = (equity / total) * 100;
        const debtPct = (debt / total) * 100;

        let status = "OK";
        let proposal = null;

        if (equityPct > 50) {
            status = "BREACH";
            const targetEquity = total * 0.5;
            const sellAmount = equity - targetEquity;
            proposal = {
                action: "Sell Equity, Buy Debt",
                amount: sellAmount,
                details: `Equity is ${equityPct.toFixed(1)}%. Sell ${sellAmount.toLocaleString()} Equity and buy Debt.`
            };
        } else if (debtPct > 50) {
            status = "BREACH";
            const targetDebt = total * 0.5;
            const sellAmount = debt - targetDebt;
            proposal = {
                action: "Sell Debt, Buy Equity",
                amount: sellAmount,
                details: `Debt is ${debtPct.toFixed(1)}%. Sell ${sellAmount.toLocaleString()} Debt and buy Equity.`
            };
        }

        setResults({
            total,
            equityPct,
            debtPct,
            status,
            proposal
        });
    };

    console.log('Rendering PortfolioRebalancing', { loading, equityValue, debtValue });

    // if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Portfolio Rebalancing (50% Equity / 50% Debt)</h1>
                <button
                    onClick={() => window.location.href = '/manual-rebalancing'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                    Manual Rebalance
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">Current Allocation Input</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Equity Value (₹)</label>
                        <input
                            type="number"
                            value={equityValue}
                            onChange={(e) => setEquityValue(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Debt Value (₹)</label>
                        <input
                            type="number"
                            value={debtValue}
                            onChange={(e) => setDebtValue(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex items-center mb-8">
                    <button
                        onClick={handleAssess}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors"
                    >
                        Assess Allocation
                    </button>
                    <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">Target max: 50% Equity, 50% Debt</span>
                </div>

                {/* Results Section */}
                <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-6 items-center transition-colors duration-200">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">₹{results ? results.total.toLocaleString() : '0'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Equity %</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{results ? results.equityPct.toFixed(1) : '0'}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Debt %</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{results ? results.debtPct.toFixed(1) : '0'}%</p>
                    </div>
                    <div className="flex items-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mr-2">Status</p>
                        {results ? (
                            <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center ${results.status === 'OK' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                {results.status === 'OK' ? <CheckCircle size={16} className="mr-1" /> : <AlertTriangle size={16} className="mr-1" />}
                                {results.status}
                            </span>
                        ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                    </div>
                </div>

                {/* Allocation Overview / Progress Bars */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Allocation Overview</h3>

                    {results && (
                        <div className="space-y-6">
                            {/* Equity Bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="dark:text-gray-300">Equity</span>
                                    <span className={results.equityPct > 50 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-600 dark:text-gray-400'}>
                                        {results.equityPct.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                                    <div
                                        className={`h-4 rounded-full ${results.equityPct > 50 ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min(results.equityPct, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Debt Bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="dark:text-gray-300">Debt</span>
                                    <span className={results.debtPct > 50 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-600 dark:text-gray-400'}>
                                        {results.debtPct.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                                    <div
                                        className={`h-4 rounded-full ${results.debtPct > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{ width: `${Math.min(results.debtPct, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Proposal Box */}
                            {results.status === 'BREACH' && (
                                <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 flex items-start">
                                    <AlertTriangle className="text-yellow-600 dark:text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-yellow-800 dark:text-yellow-200">Rebalancing Proposal</h4>
                                        <p className="text-yellow-700 dark:text-yellow-300 mt-1">{results.proposal.details}</p>
                                        <div className="mt-3 flex items-center text-sm font-medium text-blue-800 dark:text-blue-300">
                                            <span>Action: {results.proposal.action}</span>
                                            <ArrowRight size={16} className="mx-2" />
                                            <span>Amount: ₹{results.proposal.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {results.status === 'OK' && (
                                <div className="mt-6 text-gray-500 dark:text-gray-400 italic">
                                    No breach detected. Allocation is within limits.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PortfolioRebalancing;
