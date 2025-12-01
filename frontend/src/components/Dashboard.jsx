import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertTriangle, CheckCircle, RefreshCw, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
    const [portfolio, setPortfolio] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { theme } = useTheme();

    const isDarkMode = theme === 'Dark' || (theme === 'System' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const res = await axios.get('http://localhost:8000/portfolio/1');
            setPortfolio(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const checkRebalance = async () => {
        try {
            const res = await axios.post('http://localhost:8000/rebalance/1');
            setProposals(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-gray-600 dark:text-gray-400">Loading Dashboard...</div>;
    if (!portfolio) return <div className="p-8 text-red-500">Error loading portfolio data.</div>;

    const allocationData = [
        { name: 'Equity', value: portfolio.EquityValue },
        { name: 'Debt', value: portfolio.DebtValue },
        { name: 'Mutual Funds', value: portfolio.MutualFundValue || 0 },
    ];

    const COLORS = ['#C0392B', '#2980B9', '#F1C40F'];

    // Mock data to match the visual style better
    const performanceData = [
        { month: 'Jan', value: 90000 },
        { month: 'Feb', value: 92000 },
        { month: 'Mar', value: 94500 },
        { month: 'Apr', value: 96000 },
        { month: 'May', value: 98500 },
        { month: 'Jun', value: 100000 },
    ];

    const gainLossData = [
        { class: 'Equity', value: 2500 },
        { class: 'Debt', value: 500 },
        { class: 'Mutual Funds', value: 1000 },
    ];

    const recentActivity = [
        { date: '2025-11-18', desc: 'Bought 50 shares of Stock A' },
        { date: '2025-11-17', desc: 'Sold 20 shares of Stock B' },
        { date: '2025-11-16', desc: 'Dividend received from Mutual Fund C' },
        { date: '2025-11-15', desc: 'Portfolio rebalanced' },
    ];

    return (
        <div className="p-8 space-y-8 bg-gray-100 dark:bg-gray-900 min-h-screen font-sans transition-colors duration-200">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            </div>

            <div className="flex space-x-4">
                <button className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 text-sm font-medium transition-colors">
                    Add Investment
                </button>
                <button className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 text-sm font-medium transition-colors">
                    Withdraw Funds
                </button>
                <button className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 text-sm font-medium transition-colors">
                    Generate Report
                </button>
                <button
                    onClick={() => navigate('/rebalancing')}
                    className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 text-sm font-medium transition-colors flex items-center"
                >
                    <RefreshCw size={16} className="mr-2" /> Rebalance Portfolio
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col justify-center transition-colors duration-200">
                    <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Total Portfolio Value</h3>
                    <p className="text-4xl font-bold text-gray-800 dark:text-white">
                        ${portfolio.TotalValue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Updated just now</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col justify-center transition-colors duration-200">
                    <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Return</h3>
                    <p className="text-4xl font-bold text-gray-800 dark:text-white">12%</p>
                    <div className="flex items-center text-green-600 text-sm mt-2 font-medium">
                        <TrendingUp size={16} className="mr-1" /> +2.5% this month
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-200">
                    <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-4">Performance Over Time</h3>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#e5e7eb', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}
                                    itemStyle={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#1d4ed8"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-200">
                    <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-4">Asset Allocation</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={0}
                                    dataKey="value"
                                >
                                    {allocationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#e5e7eb', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}
                                    formatter={(value) => `$${value.toLocaleString()}`}
                                />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {proposals.length > 0 && (
                        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-3 rounded-md">
                            <div className="flex items-center text-yellow-800 dark:text-yellow-500 font-medium mb-2">
                                <AlertTriangle size={16} className="mr-2" /> Rebalance Recommended
                            </div>
                            {proposals.map((p, i) => (
                                <div key={i} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                                    <span>{p.Action}</span>
                                    <span>${p.Amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-200">
                    <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-4">Gain/Loss Summary</h3>
                    <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Asset Class</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Gain/Loss ($)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {gainLossData.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200 font-medium">{item.class}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-200 font-bold">${item.value.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-200">
                    <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.map((activity, idx) => (
                            <div key={idx} className="flex flex-col border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{activity.date}</span>
                                <span className="text-sm text-gray-800 dark:text-gray-200">{activity.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
