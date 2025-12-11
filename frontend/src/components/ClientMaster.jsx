import React, { useState, useEffect } from 'react';
import { Briefcase, Building, Users, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const ClientMaster = () => {
    const navigate = useNavigate();
    const [portfolioList, setPortfolioList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPortfolios = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/api/portfolios`);
                setPortfolioList(res.data);
            } catch (err) {
                console.error("Error fetching portfolios:", err);
                setError("Failed to load client data.");
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolios();
    }, []);

    if (loading) return <div className="p-8 text-gray-600 dark:text-gray-400">Loading Client Master...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    const TableHeader = ({ children }) => (
        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300 whitespace-nowrap bg-gray-50 dark:bg-gray-700 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-600">
            {children}
        </th>
    );

    const TableCell = ({ children }) => (
        <td className="p-4 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 whitespace-nowrap">
            {children || '-'}
        </td>
    );

    return (
        <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Client Master</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Clients: {portfolioList.length}</span>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <TableHeader>Action</TableHeader>
                                {/* Portfolio Information */}
                                <TableHeader>User ID</TableHeader>
                                <TableHeader>Portfolio Name</TableHeader>
                                <TableHeader>Portfolio Type</TableHeader>
                                <TableHeader>Product Type</TableHeader>
                                <TableHeader>Portfolio Level</TableHeader>
                                <TableHeader>Risk Level</TableHeader>
                                <TableHeader>Relationship Manager</TableHeader>
                                {/* Bank Details */}
                                <TableHeader>Bank Name</TableHeader>
                                <TableHeader>Bank Acc. No</TableHeader>
                                <TableHeader>IFSC Code</TableHeader>
                                {/* Broker & Nominee Details */}
                                <TableHeader>Broker Name</TableHeader>
                                <TableHeader>Broker Acc. No</TableHeader>
                                <TableHeader>Nominee Name</TableHeader>
                                <TableHeader>Allocation %</TableHeader>
                                <TableHeader>Relationship</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolioList.length === 0 ? (
                                <tr>
                                    <td colSpan="18" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No clients found.
                                    </td>
                                </tr>
                            ) : (
                                portfolioList.map((p) => (
                                    <tr key={p.PortfolioID} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <TableCell>
                                            <button
                                                onClick={() => navigate(`/client-details/${p.PortfolioID}`)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center"
                                            >
                                                View <ChevronRight size={16} className="ml-1" />
                                            </button>
                                        </TableCell>
                                        <TableCell><span className="font-mono text-gray-800 dark:text-gray-200">{p.UserID}</span></TableCell>
                                        <TableCell><span className="font-medium text-gray-900 dark:text-white">{p.PortfolioName}</span></TableCell>
                                        <TableCell>{p.PortfolioType}</TableCell>
                                        <TableCell>{p.ProductType}</TableCell>
                                        <TableCell>{p.PortfolioLevel}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.RiskLevel === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                    p.RiskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                {p.RiskLevel}
                                            </span>
                                        </TableCell>
                                        <TableCell>{p.RelationshipManager}</TableCell>
                                        <TableCell>{p.BankName}</TableCell>
                                        <TableCell>{p.BankAccountNo}</TableCell>
                                        <TableCell>{p.IfscCode}</TableCell>
                                        <TableCell>{p.BrokerName}</TableCell>
                                        <TableCell>{p.BrokerAccountNo}</TableCell>
                                        <TableCell>{p.NomineeName}</TableCell>
                                        <TableCell>{p.AllocationPercentage ? `${p.AllocationPercentage}%` : '-'}</TableCell>
                                        <TableCell>{p.Relationship}</TableCell>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientMaster;
