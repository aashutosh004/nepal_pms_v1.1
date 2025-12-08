import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Download, FileText, FileSpreadsheet, X, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const Reports = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'Dark' || (theme === 'System' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const [selectedPortfolioId, setSelectedPortfolioId] = useState('');
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadType, setDownloadType] = useState(null); // 'PDF' or 'Excel'
    const [reportDateRange, setReportDateRange] = useState({ from: '', to: '' });
    const [isDownloaded, setIsDownloaded] = useState(false);

    const handleDownloadClick = (type) => {
        setDownloadType(type);
        setShowDownloadModal(true);
        setIsDownloaded(false);
        setReportDateRange({ from: '', to: '' });
    };

    const handleGenerateDownload = () => {
        if (reportDateRange.from && reportDateRange.to) {
            if (new Date(reportDateRange.from) > new Date(reportDateRange.to)) {
                alert("Invalid Date Range: 'From Date' cannot be after 'To Date'. Please select a correct range.");
                return;
            }
            // Simulate Download
            setIsDownloaded(true);
        } else {
            alert("Please select both dates");
        }
    };

    // Mock Data for Portfolios
    const mockPortfolios = {
        'Portfolio-NIBLEQ777731': {
            PortfolioID: 'Portfolio-NIBLEQ777731',
            performanceMetrics: { ROI: '12%', CAGR: '10%', XIRR: '11%' },
            riskMetrics: { VaR: '5%', SharpeRatio: '1.2' },
            performanceData: [
                { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 }, { name: 'Mar', value: 2000 },
                { name: 'Apr', value: 2780 }, { name: 'May', value: 1890 }, { name: 'Jun', value: 2390 }
            ],
            riskData: [
                { name: 'Low Risk', value: 400 }, { name: 'Medium Risk', value: 300 }, { name: 'High Risk', value: 300 }
            ]
        },
        'Portfolio-NIBLFI888842': {
            PortfolioID: 'Portfolio-NIBLFI888842',
            performanceMetrics: { ROI: '8%', CAGR: '7%', XIRR: '7.5%' },
            riskMetrics: { VaR: '2%', SharpeRatio: '1.5' },
            performanceData: [
                { name: 'Jan', value: 2000 }, { name: 'Feb', value: 2100 }, { name: 'Mar', value: 2200 },
                { name: 'Apr', value: 2150 }, { name: 'May', value: 2300 }, { name: 'Jun', value: 2400 }
            ],
            riskData: [
                { name: 'Low Risk', value: 800 }, { name: 'Medium Risk', value: 150 }, { name: 'High Risk', value: 50 }
            ]
        },
        'Portfolio-NIBLMF999953': {
            PortfolioID: 'Portfolio-NIBLMF999953',
            performanceMetrics: { ROI: '15%', CAGR: '12%', XIRR: '14%' },
            riskMetrics: { VaR: '8%', SharpeRatio: '0.9' },
            performanceData: [
                { name: 'Jan', value: 5000 }, { name: 'Feb', value: 5200 }, { name: 'Mar', value: 4800 },
                { name: 'Apr', value: 5500 }, { name: 'May', value: 5800 }, { name: 'Jun', value: 6000 }
            ],
            riskData: [
                { name: 'Low Risk', value: 200 }, { name: 'Medium Risk', value: 400 }, { name: 'High Risk', value: 400 }
            ]
        }
    };

    const currentPortfolio = mockPortfolios[selectedPortfolioId];
    const performanceData = currentPortfolio ? currentPortfolio.performanceData : [];
    const riskData = currentPortfolio ? currentPortfolio.riskData : [];
    const performanceMetrics = currentPortfolio ? currentPortfolio.performanceMetrics : { ROI: '-', CAGR: '-', XIRR: '-' };
    const riskMetrics = currentPortfolio ? currentPortfolio.riskMetrics : { VaR: '-', SharpeRatio: '-' };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const handlePortfolioChange = (e) => {
        setSelectedPortfolioId(e.target.value);
    };

    return (
        <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports</h1>
                <div className="flex items-center gap-2">
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
                </div>
            </div>

            {!selectedPortfolioId ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-lg text-gray-600 dark:text-gray-300">Please select a portfolio to view reports.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Report */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Performance Report</h2>

                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2">Metric</th>
                                        <th className="px-4 py-2">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-200">ROI</td>
                                        <td className="px-4 py-2">{performanceMetrics.ROI}</td>
                                    </tr>
                                    <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-200">CAGR</td>
                                        <td className="px-4 py-2">{performanceMetrics.CAGR}</td>
                                    </tr>
                                    <tr className="bg-white dark:bg-gray-800">
                                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-200">XIRR</td>
                                        <td className="px-4 py-2">{performanceMetrics.XIRR}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="h-48 bg-gray-50 dark:bg-gray-900 rounded flex items-center justify-center border border-gray-100 dark:border-gray-700">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                                    <XAxis dataKey="name" hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#e5e7eb', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}
                                        cursor={{ fill: isDarkMode ? '#374151' : '#f3f4f6' }}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center text-xs text-gray-400 mt-2">Performance Chart Placeholder</div>
                    </div>

                    {/* Risk Analysis */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Risk Analysis</h2>

                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2">Metric</th>
                                        <th className="px-4 py-2">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-200">VaR</td>
                                        <td className="px-4 py-2">{riskMetrics.VaR}</td>
                                    </tr>
                                    <tr className="bg-white dark:bg-gray-800">
                                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-200">Sharpe Ratio</td>
                                        <td className="px-4 py-2">{riskMetrics.SharpeRatio}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="h-48 bg-gray-50 dark:bg-gray-900 rounded flex items-center justify-center border border-gray-100 dark:border-gray-700">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={riskData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {riskData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#e5e7eb', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center text-xs text-gray-400 mt-2">Risk Chart Placeholder</div>
                    </div>

                    {/* Download Options */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Download Options</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Select format to download report:</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => handleDownloadClick('PDF')}
                                className="w-full bg-gray-900 dark:bg-gray-700 text-white px-4 py-3 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 text-sm font-medium flex items-center justify-center transition-colors">
                                <FileText size={18} className="mr-2" /> Download PDF
                            </button>
                            <button
                                onClick={() => handleDownloadClick('Excel')}
                                className="w-full bg-gray-900 dark:bg-gray-700 text-white px-4 py-3 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 text-sm font-medium flex items-center justify-center transition-colors">
                                <FileSpreadsheet size={18} className="mr-2" /> Download Excel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Download Modal - Same style as Dashboard */}
            {showDownloadModal && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700 font-sans">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Download {downloadType}</h3>
                            <button
                                onClick={() => setShowDownloadModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {!isDownloaded ? (
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
                                        onClick={handleGenerateDownload}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Download
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="text-center space-y-2">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-2">
                                            <CheckCircle size={24} />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Download Initiated</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Your {downloadType} report for period {reportDateRange.from} to {reportDateRange.to} has been generated.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setShowDownloadModal(false)}
                                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md shadow-blue-500/20 transition-colors"
                                    >
                                        Done
                                    </button>
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

export default Reports;
