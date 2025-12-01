import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, Plus, Minus, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ClientCreationForm from './ClientCreationForm';

const PortfolioOverview = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
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
        fetchPortfolio();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileType = file.name.split('.').pop().toLowerCase();
            if (fileType !== 'csv' && fileType !== 'xlsx') {
                alert("Only .csv and .xlsx files are allowed.");
                e.target.value = null;
                setUploadFile(null);
                return;
            }
            setUploadFile(file);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadFile);

        setUploading(true);
        try {
            const res = await axios.post('http://localhost:8000/api/portfolio/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("Portfolio uploaded successfully!");
            setUploadFile(null);
            // Optionally refresh portfolio data
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.detail || "Error uploading file.";
            alert(`Upload failed: ${msg}`);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!portfolio) return <div className="p-8 text-red-500">Error loading portfolio.</div>;

    // Dummy data for the chart
    const performanceData = [
        { month: 'Jan', value: 90000 },
        { month: 'Feb', value: 92000 },
        { month: 'Mar', value: 91500 },
        { month: 'Apr', value: 94000 },
        { month: 'May', value: 98000 },
        { month: 'Jun', value: 100000 },
    ];

    // Dummy transactions
    const transactions = [
        { date: '2025-11-18', desc: 'Bought 50 shares of Stock A' },
        { date: '2025-11-17', desc: 'Sold 20 shares of Stock B' },
    ];

    return (
        <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Portfolio Overview</h1>
            </div>

            <div className="flex space-x-3 mb-6">
                <button className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 text-sm font-medium flex items-center transition-colors">
                    Buy
                </button>
                <button className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 text-sm font-medium flex items-center transition-colors">
                    Sell
                </button>
                {user?.role !== 'Admin' && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center transition-colors"
                    >
                        Create Portfolio
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Column 1: Performance */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Performance</h3>
                    <div className="h-48 bg-gray-50 dark:bg-gray-900 rounded flex items-center justify-center">
                        {/* Chart Placeholder / Implementation */}
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                    itemStyle={{ color: '#f3f4f6' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Column 2: Recent Transactions */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Transactions</h3>
                    <div className="space-y-3 text-sm">
                        {transactions.map((t, i) => (
                            <div key={i} className="pb-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <div className="text-gray-500 dark:text-gray-400 text-xs">{t.date}</div>
                                <div className="text-gray-800 dark:text-gray-200">{t.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 3: Assets Table */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto transition-colors duration-200">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Assets</h3>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                <th className="pb-2">Asset</th>
                                <th className="pb-2">Qty</th>
                                <th className="pb-2">Value ($)</th>
                                <th className="pb-2">% Alloc</th>
                                <th className="pb-2">Gain/Loss ($)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {portfolio.Holdings.slice(0, 5).map((h, i) => (
                                <tr key={i} className="text-gray-800 dark:text-gray-200">
                                    <td className="py-2 font-medium">{h.Asset.AssetName}</td>
                                    <td className="py-2">{h.Quantity}</td>
                                    <td className="py-2">${h.MarketValue.toLocaleString()}</td>
                                    <td className="py-2">{h.Allocation.toFixed(0)}%</td>
                                    <td className="py-2 text-green-600 dark:text-green-400">$500</td> {/* Dummy Gain/Loss */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Column 4: Upload Portfolio Form */}
                {user?.role !== 'Admin' && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Upload Portfolio</h3>
                        <div className="space-y-4">
                            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Drag and drop or click to upload
                                </p>
                                <input
                                    type="file"
                                    accept=".csv, .xlsx"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-xs file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100
                                    "
                                />
                                <p className="text-xs text-gray-400 mt-2">Allowed: .csv, .xlsx</p>
                            </div>

                            {uploadFile && (
                                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded flex items-center">
                                    <FileText size={16} className="mr-2" />
                                    <span className="truncate">{uploadFile.name}</span>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!uploadFile || uploading}
                                className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium w-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? 'Uploading...' : 'Upload Portfolio'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Portfolio Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <ClientCreationForm
                        onClose={() => setIsCreateModalOpen(false)}
                        onSuccess={(id) => {
                            // Refresh portfolio or show success message
                            console.log("Portfolio Created with ID:", id);
                            if (id) {
                                navigate(`/client-details/${id}`);
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default PortfolioOverview;
