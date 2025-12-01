import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, AlertTriangle } from 'lucide-react';
import API_URL from '../config';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/users`);
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch users.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId) => {
        if (!window.confirm(`Are you sure you want to delete user ${userId}?`)) return;

        try {
            await axios.delete(`${API_URL}/api/users/${userId}`);
            alert("User deleted successfully");
            fetchUsers(); // Refresh list
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || "Failed to delete user");
        }
    };

    if (loading) return <div className="p-8">Loading users...</div>;

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center mb-6 text-yellow-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <AlertTriangle className="mr-3" />
                    <div>
                        <h2 className="font-bold">Restricted Area</h2>
                        <p className="text-sm">This page is hidden and for administrative use only.</p>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">User Management</h1>

                {error && <div className="text-red-500 mb-4">{error}</div>}

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="p-4 font-medium text-gray-600 dark:text-gray-300">User ID</th>
                                <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Name</th>
                                <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Email</th>
                                <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Role</th>
                                <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 text-gray-800 dark:text-gray-200 font-mono text-sm">{user.userId}</td>
                                    <td className="p-4 text-gray-800 dark:text-gray-200">{user.name}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'Admin'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {user.userId !== 'superadmin@nimb' && (
                                            <button
                                                onClick={() => handleDelete(user.userId)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
