import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import NewsUpdateTab from './AssetDetails/NewsUpdateTab';
import { useTheme } from '../context/ThemeContext';

const AssetDetails = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [selectedPortfolioId, setSelectedPortfolioId] = useState('');
    const [selectedSecurity, setSelectedSecurity] = useState('');
    const { theme } = useTheme();
    const isDarkMode = theme === 'Dark' || (theme === 'System' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Mock Data for Portfolios
    const mockPortfolios = {
        'Portfolio-NIBLEQ777731': {
            PortfolioID: 'Portfolio-NIBLEQ777731',
            priceHistory: [
                { date: '2024 Q1', price: 42 }, { date: '2024 Q2', price: 45 }, { date: '2024 Q3', price: 48 },
                { date: '2024 Q4', price: 46 }, { date: '2025 Q1', price: 50 }, { date: '2025 Q2', price: 55 }
            ],
            transactions: [
                { date: '2025-11-18', desc: 'Bought 50 shares of Nabil Bank' },
                { date: '2025-11-17', desc: 'Sold 20 shares of NRIC' },
                { date: '2025-11-15', desc: 'Portfolio rebalanced (Equity Focus)' }
            ]
        },
        'Portfolio-NIBLFI888842': {
            PortfolioID: 'Portfolio-NIBLFI888842',
            priceHistory: [
                { date: '2024 Q1', price: 100 }, { date: '2024 Q2', price: 102 }, { date: '2024 Q3', price: 103 },
                { date: '2024 Q4', price: 104 }, { date: '2025 Q1', price: 105 }, { date: '2025 Q2', price: 106 }
            ],
            transactions: [
                { date: '2025-11-20', desc: 'Coupon received from Govt Bond 2085' },
                { date: '2025-11-19', desc: 'Bought 100 units of NIBL Debenture' },
                { date: '2025-11-10', desc: 'SIP Installment Processed' }
            ]
        },
        'Portfolio-NIBLMF999953': {
            PortfolioID: 'Portfolio-NIBLMF999953',
            priceHistory: [
                { date: '2024 Q1', price: 15 }, { date: '2024 Q2', price: 16 }, { date: '2024 Q3', price: 15.5 },
                { date: '2024 Q4', price: 17 }, { date: '2025 Q1', price: 18 }, { date: '2025 Q2', price: 19 }
            ],
            transactions: [
                { date: '2025-11-25', desc: 'Dividend Reinvestment (NIBL Sahabhagita)' },
                { date: '2025-11-22', desc: 'Bought Treasury Bills' },
                { date: '2025-11-05', desc: 'Quarterly Review Completed' }
            ]
        }
    };

    const currentPortfolio = mockPortfolios[selectedPortfolioId];
    const priceHistory = currentPortfolio ? currentPortfolio.priceHistory : [];
    const allTransactions = currentPortfolio ? currentPortfolio.transactions : [];
    const transactions = allTransactions.filter(t =>
        t.desc.toLowerCase().includes('bought') || t.desc.toLowerCase().includes('sold')
    );

    const handlePortfolioChange = (e) => {
        setSelectedPortfolioId(e.target.value);
    };

    const tabs = ['Overview', 'Transactions', 'Analytics', 'News & Updates'];

    return (
        <div className="p-4 md:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            {/* Header */}
            <div className="bg-[#f0edfd] p-6 rounded-t-lg shadow-sm flex flex-col md:flex-row md:items-center md:space-x-8 space-y-4 md:space-y-0 transition-colors duration-200">
                {/* Portfolio Selection (Moved here) */}
                <div>

                    <select
                        value={selectedPortfolioId}
                        onChange={handlePortfolioChange}
                        className="bg-white text-black px-3 py-1 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors w-full md:w-auto"
                    >
                        <option value="" disabled>Select Portfolio</option>
                        <option value="Portfolio-NIBLEQ777731">Portfolio-NIBLEQ777731</option>
                        <option value="Portfolio-NIBLFI888842">Portfolio-NIBLFI888842</option>
                        <option value="Portfolio-NIBLMF999953">Portfolio-NIBLMF999953</option>
                    </select>
                </div>

                {/* Security Selection (Renamed and converted to dropdown) */}
                <div>
                    <select
                        value={selectedSecurity}
                        onChange={(e) => setSelectedSecurity(e.target.value)}
                        className="bg-white text-black px-3 py-1 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors w-full md:w-auto"
                    >
                        <option value="" disabled>Select Security</option>
                        <option value="ACC Cement">ACC Cement</option>
                        <option value="IDFC Bond">IDFC Bond</option>
                    </select>
                </div>
                <div>
                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Ticker:</span>
                    <span className="ml-2 text-xl font-bold text-black">
                        {selectedSecurity === 'ACC Cement' ? 'ACC' : selectedSecurity === 'IDFC Bond' ? 'IDFC' : '-'}
                    </span>
                </div>
                <div>
                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Current Price:</span>
                    <span className="ml-2 text-xl font-bold text-black">NPR 5000</span>
                </div>
            </div>

            {/* Combined Tabs & Content Container */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-6 transition-colors duration-200">
                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 pt-4 overflow-x-auto">
                    <div className="flex space-x-8 min-w-max">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab
                                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-8 min-h-[400px]">
                    {activeTab === 'Overview' && (
                        !currentPortfolio ? (
                            <div className="flex flex-col items-center justify-center h-80 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400">Please select a portfolio to view details.</p>
                            </div>
                        ) : (
                            <div className="h-80 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                {/* Chart Placeholder */}
                                <div className="w-full h-full p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={priceHistory}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#1f2937', borderColor: isDarkMode ? '#374151' : '#374151', color: '#f3f4f6' }}
                                                itemStyle={{ color: '#f3f4f6' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="price"
                                                stroke={isDarkMode ? "#60A5FA" : "#111827"}
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: isDarkMode ? "#60A5FA" : "#111827" }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                    <div className="text-center text-gray-400 text-sm mt-2">Price History Chart Placeholder</div>
                                </div>
                            </div>
                        )
                    )}

                    {activeTab === 'Transactions' && (
                        <div className="space-y-4">
                            {transactions.length > 0 ? (
                                transactions.map((t, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{t.desc}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{t.date}</span>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Completed
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 dark:text-gray-400 italic text-center py-8">
                                    No transactions found for this portfolio.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'News & Updates' && (
                        <NewsUpdateTab />
                    )}

                    {activeTab !== 'Overview' && activeTab !== 'News & Updates' && (
                        <div className="text-gray-500 dark:text-gray-400 italic">
                            Content for {activeTab} tab would go here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetDetails;
