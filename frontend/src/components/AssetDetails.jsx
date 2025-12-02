import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import NewsUpdateTab from './AssetDetails/NewsUpdateTab';
import { useTheme } from '../context/ThemeContext';

const AssetDetails = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const { theme } = useTheme();
    const isDarkMode = theme === 'Dark' || (theme === 'System' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Dummy data for the chart
    const priceHistory = [
        { date: '2024 Q1', price: 42 },
        { date: '2024 Q2', price: 45 },
        { date: '2024 Q3', price: 48 },
        { date: '2024 Q4', price: 46 },
        { date: '2025 Q1', price: 50 },
        { date: '2025 Q2', price: 55 },
    ];

    const tabs = ['Overview', 'Transactions', 'Analytics', 'News & Updates'];

    return (
        <div className="p-4 md:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            {/* Header */}
            <div className="bg-gray-900 dark:bg-gray-800 text-white p-6 rounded-t-lg shadow-sm flex flex-col md:flex-row md:items-center md:space-x-8 space-y-4 md:space-y-0 transition-colors duration-200">
                <div>
                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Asset Name:</span>
                    <span className="ml-2 text-xl font-bold">Stock A</span>
                </div>
                <div>
                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Ticker:</span>
                    <span className="ml-2 text-xl font-bold">A</span>
                </div>
                <div>
                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Current Price:</span>
                    <span className="ml-2 text-xl font-bold">$50</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 pt-4 rounded-b-lg shadow-sm -mt-6 transition-colors duration-200 overflow-x-auto">
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

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-h-[400px] transition-colors duration-200">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">{activeTab}</h2>

                {activeTab === 'Overview' && (
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
    );
};

export default AssetDetails;
