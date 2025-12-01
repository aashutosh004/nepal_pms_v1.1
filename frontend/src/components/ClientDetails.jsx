import React, { useState, useEffect } from 'react';
import { Briefcase, Building, Users, ArrowLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../config';

const ClientDetails = () => {
    const { portfolioId } = useParams();
    const navigate = useNavigate();
    const [clientData, setClientData] = useState(null);
    const [portfolioList, setPortfolioList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (portfolioId) {
                    // Detail View
                    const res = await axios.get(`${API_URL}/portfolio/${portfolioId}`);
                    setClientData(res.data);
                } else {
                    // List View
                    const res = await axios.get(`${API_URL}/api/portfolios`);
                    setPortfolioList(res.data);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [portfolioId]);

    if (loading) return <div className="p-8 text-gray-600 dark:text-gray-400">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    // --- List View ---
    if (!portfolioId) {
        return (
            <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Client Portfolios</h1>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Portfolio Name</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Client Name</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Type</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Total Value</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {portfolioList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-4 text-center text-gray-500 dark:text-gray-400">No portfolios found.</td>
                                </tr>
                            ) : (
                                portfolioList.map((p) => (
                                    <tr key={p.PortfolioID} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="p-4 text-gray-900 dark:text-white font-medium">{p.PortfolioName}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300">{p.ClientName}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300">{p.PortfolioType}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300">${p.TotalValue?.toLocaleString()}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => navigate(`/client-details/${p.PortfolioID}`)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                                            >
                                                View Details <ChevronRight size={16} className="ml-1" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // --- Detail View ---
    if (!clientData) return <div className="p-8 text-gray-600 dark:text-gray-400">No client details found.</div>;

    const DisplayField = ({ label, value }) => (
        <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
            <div className="text-gray-900 dark:text-white font-medium text-sm">{value || 'N/A'}</div>
        </div>
    );

    return (
        <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/client-details')}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Client Details</h1>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Portfolio ID: <span className="font-mono text-gray-800 dark:text-gray-200">{clientData.PortfolioID}</span>
                </div>
            </div>

            <div className="space-y-6">
                {/* Section 1: Portfolio Information */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                        <Briefcase className="text-blue-600 mr-2" size={20} />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Portfolio Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DisplayField label="User ID" value={clientData.UserID} />
                        <DisplayField label="Portfolio Name" value={clientData.PortfolioName} />
                        <DisplayField label="Portfolio Type" value={clientData.PortfolioType} />
                        <DisplayField label="Product Type" value={clientData.ProductType} />
                        <DisplayField label="Portfolio Level" value={clientData.PortfolioLevel} />
                        <DisplayField label="Risk Level" value={clientData.RiskLevel} />
                        <DisplayField label="Relationship Manager" value={clientData.RelationshipManager} />
                    </div>
                </div>

                {/* Section 2: Bank Details */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                        <Building className="text-blue-600 mr-2" size={20} />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Bank Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DisplayField label="Bank Name" value={clientData.BankName} />
                        <DisplayField label="Bank Account No" value={clientData.BankAccountNo} />
                        <DisplayField label="IFSC Code" value={clientData.IfscCode} />
                    </div>
                </div>

                {/* Section 3: Broker & Nominee Details */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                        <Users className="text-blue-600 mr-2" size={20} />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Broker & Nominee Details</h2>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Broker Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DisplayField label="Broker Name" value={clientData.BrokerName} />
                            <DisplayField label="Broker Account No." value={clientData.BrokerAccountNo} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Nominee Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DisplayField label="Nominee Name" value={clientData.NomineeName} />
                            <DisplayField label="Allocation Percentage" value={clientData.AllocationPercentage ? `${clientData.AllocationPercentage}%` : ''} />
                            <DisplayField label="Relationship" value={clientData.Relationship} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDetails;

