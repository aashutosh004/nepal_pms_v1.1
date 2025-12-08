import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertTriangle, CheckCircle, RefreshCw, TrendingUp, DollarSign, Activity, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import API_URL from '../config';

const Dashboard = () => {
    // Mock Data for Portfolios
    const mockPortfolios = {
        'Portfolio-NIBLEQ777731': {
            PortfolioID: 'Portfolio-NIBLEQ777731',
            PortfolioName: 'High Growth Strategy',
            TotalValue: 150000,
            EquityValue: 90000,
            DebtValue: 40000,
            MutualFundValue: 20000,
            EquityPercent: 60,
            DebtPercent: 26.6,
            MutualFundPercent: 13.4,
            performanceData: [
                { month: 'Jan', value: 120000 }, { month: 'Feb', value: 125000 }, { month: 'Mar', value: 130000 },
                { month: 'Apr', value: 128000 }, { month: 'May', value: 140000 }, { month: 'Jun', value: 150000 }
            ],
            gainLossData: [
                { class: 'Equity', value: 15000 }, { class: 'Debt', value: 2000 }, { class: 'Mutual Funds', value: 1500 }
            ],
            recentActivity: [
                { date: '2025-11-18', desc: 'Bought 50 shares of Nabil Bank' },
                { date: '2025-11-17', desc: 'Sold 20 shares of NRIC' },
                { date: '2025-11-15', desc: 'Portfolio rebalanced (Equity Focus)' }
            ]
        },
        'Portfolio-NIBLFI888842': {
            PortfolioID: 'Portfolio-NIBLFI888842',
            PortfolioName: 'Balanced Income',
            TotalValue: 85000,
            EquityValue: 30000,
            DebtValue: 45000,
            MutualFundValue: 10000,
            EquityPercent: 35.3,
            DebtPercent: 52.9,
            MutualFundPercent: 11.8,
            performanceData: [
                { month: 'Jan', value: 80000 }, { month: 'Feb', value: 81000 }, { month: 'Mar', value: 82000 },
                { month: 'Apr', value: 81500 }, { month: 'May', value: 83000 }, { month: 'Jun', value: 85000 }
            ],
            gainLossData: [
                { class: 'Equity', value: 3000 }, { class: 'Debt', value: 1500 }, { class: 'Mutual Funds', value: 500 }
            ],
            recentActivity: [
                { date: '2025-11-20', desc: 'Coupon received from Govt Bond 2085' },
                { date: '2025-11-19', desc: 'Bought 100 units of NIBL Debenture' },
                { date: '2025-11-10', desc: 'SIP Installment Processed' }
            ]
        },
        'Portfolio-NIBLMF999953': {
            PortfolioID: 'Portfolio-NIBLMF999953',
            PortfolioName: 'Conservative Saver',
            TotalValue: 250000,
            EquityValue: 50000,
            DebtValue: 150000,
            MutualFundValue: 50000,
            EquityPercent: 20,
            DebtPercent: 60,
            MutualFundPercent: 20,
            performanceData: [
                { month: 'Jan', value: 240000 }, { month: 'Feb', value: 242000 }, { month: 'Mar', value: 244000 },
                { month: 'Apr', value: 246000 }, { month: 'May', value: 248000 }, { month: 'Jun', value: 250000 }
            ],
            gainLossData: [
                { class: 'Equity', value: 5000 }, { class: 'Debt', value: 8000 }, { class: 'Mutual Funds', value: 2000 }
            ],
            recentActivity: [
                { date: '2025-11-25', desc: 'Dividend Reinvestment (NIBL Sahabhagita)' },
                { date: '2025-11-22', desc: 'Bought Treasury Bills' },
                { date: '2025-11-05', desc: 'Quarterly Review Completed' }
            ]
        }
    };

    const [selectedPortfolioId, setSelectedPortfolioId] = useState('');
    const [portfolio, setPortfolio] = useState(null);
    const [proposals, setProposals] = useState([]);

    const [loading, setLoading] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportDateRange, setReportDateRange] = useState({ from: '', to: '' });
    const [generatedReport, setGeneratedReport] = useState(null);
    const navigate = useNavigate();
    const { theme } = useTheme();

    const isDarkMode = theme === 'Dark' || (theme === 'System' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    useEffect(() => {
        if (selectedPortfolioId) {
            setPortfolio(mockPortfolios[selectedPortfolioId]);
        } else {
            setPortfolio(null);
        }
    }, [selectedPortfolioId]);

    /* ... fetchPortfolio ... */

    const handlePortfolioChange = (e) => {
        setSelectedPortfolioId(e.target.value);
    };

    /* ... checkRebalance ... */

    // Loading state is not really used with mock data, but keeping structure
    if (loading) return <div className="p-8 text-gray-600 dark:text-gray-400">Loading Dashboard...</div>;

    const performanceData = portfolio?.performanceData || [];
    const gainLossData = portfolio?.gainLossData || [];
    const recentActivity = portfolio?.recentActivity || [];

    const allocationData = portfolio ? [
        { name: 'Equity', value: portfolio.EquityValue },
        { name: 'Debt', value: portfolio.DebtValue },
        { name: 'Mutual Funds', value: portfolio.MutualFundValue }
    ] : [];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="p-4 md:p-8 space-y-8 bg-gray-100 dark:bg-gray-900 min-h-screen font-sans transition-colors duration-200">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8">
                <select
                    value={selectedPortfolioId}
                    onChange={handlePortfolioChange}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-colors min-w-[200px]"
                >
                    <option value="" disabled>Select Portfolio</option>
                    <option value="Portfolio-NIBLEQ777731">Portfolio-NIBLEQ777731</option>
                    <option value="Portfolio-NIBLFI888842">Portfolio-NIBLFI888842</option>
                    <option value="Portfolio-NIBLMF999953">Portfolio-NIBLMF999953</option>
                </select>

                <button className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 text-sm font-medium transition-colors">
                    Add Investment
                </button>
                <button className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 text-sm font-medium transition-colors">
                    Withdraw Funds
                </button>
                <button
                    onClick={() => setShowReportModal(true)}
                    className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                >
                    Generate Report
                </button>
                <button
                    onClick={() => navigate('/rebalancing')}
                    className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 text-sm font-medium transition-colors flex items-center"
                >
                    <RefreshCw size={16} className="mr-2" /> Rebalance Portfolio
                </button>
            </div>

            {!portfolio ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <Activity size={48} className="text-gray-400 mb-4" />
                    <p className="text-lg text-gray-600 dark:text-gray-300">Please select a portfolio to view details.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Row 1, Col 1: Total Portfolio Value */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col justify-center transition-colors duration-200 h-64">
                            <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Total Portfolio Value</h3>
                            <p className="text-4xl font-bold text-gray-800 dark:text-white">
                                ${portfolio.TotalValue.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Updated just now</p>
                        </div>

                        {/* Row 1, Col 2: Return (New Card) */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col justify-center transition-colors duration-200 h-64">
                            <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Return</h3>
                            <p className="text-4xl font-bold text-gray-800 dark:text-white">
                                12%
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Annualized</p>
                        </div>

                        {/* Row 1, Col 3: Performance Over Time */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-200 h-64 flex flex-col">
                            <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-4">Performance Over Time</h3>
                            <div className="flex-1 min-h-0">
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

                        {/* Row 2, Col 1: Asset Allocation */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-200 h-96 flex flex-col">
                            <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-4">Asset Allocation</h3>
                            <div className="flex-1 min-h-0">
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

                        {/* Row 2, Col 2: Gain/Loss Summary */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-200 h-96">
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

                        {/* Row 2, Col 3: Recent Activity */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-200 h-96 overflow-y-auto">
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
                </>
            )}

            {/* Report Generation Modal */}
            {showReportModal && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700 font-sans">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Generate Report</h3>
                            <button
                                onClick={() => {
                                    setShowReportModal(false);
                                    setGeneratedReport(null);
                                    setReportDateRange({ from: '', to: '' });
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {!generatedReport ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                                            <input
                                                type="date"
                                                value={reportDateRange.from}
                                                onChange={(e) => setReportDateRange({ ...reportDateRange, from: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                                            <input
                                                type="date"
                                                value={reportDateRange.to}
                                                onChange={(e) => setReportDateRange({ ...reportDateRange, to: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (reportDateRange.from && reportDateRange.to) {
                                                if (new Date(reportDateRange.from) > new Date(reportDateRange.to)) {
                                                    alert("Invalid Date Range: 'From Date' cannot be after 'To Date'. Please select a correct range.");
                                                    return;
                                                }
                                                // Simulate Report Generation logic
                                                setGeneratedReport({
                                                    dateRange: `${reportDateRange.from} to ${reportDateRange.to}`,
                                                    data: [
                                                        { id: 1, type: 'Equity', return: '12.5%', value: '$45,000' },
                                                        { id: 2, type: 'Debt', return: '8.2%', value: '$30,000' },
                                                        { id: 3, type: 'Mutual Funds', return: '15.1%', value: '$25,000' }
                                                    ],
                                                    totalValue: '$100,000'
                                                });
                                            } else {
                                                alert("Please select both dates");
                                            }
                                        }}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Generate Report
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="text-center space-y-2">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-2">
                                            <CheckCircle size={24} />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Report Generated Successfully</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Period: {generatedReport.dateRange}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                        <div className="space-y-3">
                                            {generatedReport.data.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.type}</span>
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900 dark:text-white">{item.value}</div>
                                                        <div className="text-xs text-green-600 dark:text-green-400">+{item.return}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3 flex justify-between items-center">
                                                <span className="font-bold text-gray-900 dark:text-white">Total Value</span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{generatedReport.totalValue}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setGeneratedReport(null)}
                                            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2"
                                            onClick={() => setShowReportModal(false)}
                                        >
                                            <div className="text-white"><FileText size={18} /></div>
                                            Download PDF
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Dashboard;
