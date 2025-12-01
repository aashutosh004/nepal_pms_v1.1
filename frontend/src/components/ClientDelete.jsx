import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, AlertTriangle } from 'lucide-react';

const ClientDelete = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPortfolios = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/portfolios');
            setPortfolios(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching portfolios:", err);
            setError("Failed to load portfolios.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolios();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
            try {
                await axios.delete(`http://localhost:8000/api/portfolio/${id}`);
                // Remove from local state
                setPortfolios(portfolios.filter(p => p.PortfolioID !== id));
                alert("Client deleted successfully.");
            } catch (err) {
                console.error("Error deleting client:", err);
                alert("Failed to delete client.");
            }
        }
    };

    if (loading) return <div className="p-8 text-gray-600 dark:text-gray-400">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <div className="flex items-center space-x-3 text-red-600">
                <AlertTriangle size={32} />
                <h1 className="text-2xl font-bold">Delete Client Records</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-900 overflow-hidden">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/50 text-red-800 dark:text-red-200 text-sm">
                    <strong>Warning:</strong> Deleting a client will permanently remove their portfolio and all associated data.
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">ID</th>
                            <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Portfolio Name</th>
                            <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Client Name</th>
                            <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Type</th>
                            <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {portfolios.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-500 dark:text-gray-400">No clients found.</td>
                            </tr>
                        ) : (
                            portfolios.map((p) => (
                                <tr key={p.PortfolioID} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="p-4 text-gray-900 dark:text-white font-mono text-sm">{p.PortfolioID}</td>
                                    <td className="p-4 text-gray-900 dark:text-white font-medium">{p.PortfolioName}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">{p.ClientName}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">{p.PortfolioType}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDelete(p.PortfolioID)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            <Trash2 size={16} className="mr-1" /> Delete
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
};

export default ClientDelete;
