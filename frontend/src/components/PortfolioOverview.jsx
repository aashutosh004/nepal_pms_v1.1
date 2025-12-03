import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, Plus, Minus, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ClientCreationForm from './ClientCreationForm';
import API_URL from '../config';

const PortfolioOverview = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    // Mock Data for Portfolios
    const mockPortfolios = {
        'Portfolio-NIBLEQ777731': {
            PortfolioID: 'Portfolio-NIBLEQ777731',
            performanceData: [
                { month: 'Jan', value: 120000 }, { month: 'Feb', value: 125000 }, { month: 'Mar', value: 130000 },
                { month: 'Apr', value: 128000 }, { month: 'May', value: 140000 }, { month: 'Jun', value: 150000 }
            ],
            transactions: [
                { date: '2025-11-18', desc: 'Bought 50 shares of Nabil Bank' },
                { date: '2025-11-17', desc: 'Sold 20 shares of NRIC' },
                { date: '2025-11-15', desc: 'Portfolio rebalanced (Equity Focus)' }
            ],
            Holdings: [
                { Asset: { AssetName: 'Nabil Bank' }, Quantity: 100, MarketValue: 120000, Allocation: 41 },
                { Asset: { AssetName: 'NTC' }, Quantity: 50, MarketValue: 45000, Allocation: 15 },
                { Asset: { AssetName: 'Shivm Cement' }, Quantity: 200, MarketValue: 80000, Allocation: 27 },
                { Asset: { AssetName: 'Himalayan Distillery' }, Quantity: 30, MarketValue: 50000, Allocation: 17 }
            ]
        },
        'Portfolio-NIBLFI888842': {
            PortfolioID: 'Portfolio-NIBLFI888842',
            performanceData: [
                { month: 'Jan', value: 80000 }, { month: 'Feb', value: 81000 }, { month: 'Mar', value: 82000 },
                { month: 'Apr', value: 81500 }, { month: 'May', value: 83000 }, { month: 'Jun', value: 85000 }
            ],
            transactions: [
                { date: '2025-11-20', desc: 'Bought 100 units of NIBL Debenture' },
                { date: '2025-11-19', desc: 'Sold 50 units of Govt Bond 2084' },
                { date: '2025-11-10', desc: 'Bought 200 units of Fixed Deposit' }
            ],
            Holdings: [
                { Asset: { AssetName: 'Govt Bond 2085' }, Quantity: 500, MarketValue: 50000, Allocation: 59 },
                { Asset: { AssetName: 'NIBL Debenture' }, Quantity: 200, MarketValue: 20000, Allocation: 24 },
                { Asset: { AssetName: 'Fixed Deposit' }, Quantity: 1, MarketValue: 15000, Allocation: 17 }
            ]
        },
        'Portfolio-NIBLMF999953': {
            PortfolioID: 'Portfolio-NIBLMF999953',
            performanceData: [
                { month: 'Jan', value: 240000 }, { month: 'Feb', value: 242000 }, { month: 'Mar', value: 244000 },
                { month: 'Apr', value: 246000 }, { month: 'May', value: 248000 }, { month: 'Jun', value: 250000 }
            ],
            transactions: [
                { date: '2025-11-25', desc: 'Bought Treasury Bills' },
                { date: '2025-11-22', desc: 'Sold NIBL Sahabhagita Fund (Partial)' },
                { date: '2025-11-05', desc: 'Bought Citizen Unit Scheme' }
            ],
            Holdings: [
                { Asset: { AssetName: 'NIBL Sahabhagita Fund' }, Quantity: 5000, MarketValue: 150000, Allocation: 60 },
                { Asset: { AssetName: 'Treasury Bills' }, Quantity: 1000, MarketValue: 100000, Allocation: 40 }
            ]
        }
    };

    const [selectedPortfolioId, setSelectedPortfolioId] = useState('');
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (selectedPortfolioId) {
            setPortfolio(mockPortfolios[selectedPortfolioId]);
        } else {
            setPortfolio(null);
        }
    }, [selectedPortfolioId]);

    const handlePortfolioChange = (e) => {
        setSelectedPortfolioId(e.target.value);
    };

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
            const res = await axios.post(`${API_URL}/api/portfolio/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("Portfolio uploaded successfully!");
            setUploadFile(null);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.detail || "Error uploading file.";
            alert(`Upload failed: ${msg}`);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    const performanceData = portfolio?.performanceData || [];
    const allTransactions = portfolio?.transactions || [];
    const transactions = allTransactions.filter(t =>
        t.desc.toLowerCase().includes('bought') || t.desc.toLowerCase().includes('sold')
    );

    return (
        <div className="p-4 md:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Portfolio Overview</h1>
            </div>

            <div className="flex flex-wrap gap-3 mb-6 items-center">
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

            {!portfolio ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-lg text-gray-600 dark:text-gray-300">Please select a portfolio to view overview.</p>
                </div>
            ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Column 1: Performance */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Performance</h3>
                        <div className="h-48 bg-gray-50 dark:bg-gray-900 rounded flex items-center justify-center">
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
                    {
                        user?.role !== 'Admin' && (
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
                        )
                    }
                </div>
            )}

            {/* Create Portfolio Modal */}
            {
                isCreateModalOpen && (
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
                )
            }
        </div >
    );
};

export default PortfolioOverview;
