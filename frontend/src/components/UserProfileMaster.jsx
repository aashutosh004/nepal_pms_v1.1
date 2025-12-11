import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';

const UserProfileMaster = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/api/users`);
                setUsers(res.data);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div className="p-8 text-gray-600 dark:text-gray-400">Loading User Profiles...</div>;
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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">User Profile Master</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Users: {users.length}</span>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Email</TableHeader>
                                <TableHeader>Phone</TableHeader>
                                <TableHeader>Role</TableHeader>
                                <TableHeader>Address</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <TableCell><span className="font-medium text-gray-900 dark:text-white">{user.name}</span></TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell>{user.address}</TableCell>
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

export default UserProfileMaster;
