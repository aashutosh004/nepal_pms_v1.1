import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import axios from 'axios';
import API_URL from '../config';

const UserProfileMaster = () => {
    const [userForm, setUserForm] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
        role: 'Investment Manager',
        userId: '',
        password: ''
    });

    const handleUserFormChange = (e) => {
        const { name, value } = e.target;
        setUserForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/users/create`, userForm);
            alert(`User ${userForm.name} created successfully!`);
            // Reset form
            setUserForm({
                name: '',
                address: '',
                email: '',
                phone: '',
                role: 'Investment Manager',
                userId: '',
                password: ''
            });
        } catch (err) {
            console.error("Error creating user:", err);
            alert(err.response?.data?.detail || "Failed to create user.");
        }
    };

    return (
        <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">User Profile Master</h1>
            </div>

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleCreateUser} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-6">
                        <UserPlus className="text-blue-600 mr-2" size={24} />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create New User</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={userForm.name}
                                onChange={handleUserFormChange}
                                required
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={userForm.email}
                                onChange={handleUserFormChange}
                                required
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={userForm.phone}
                                onChange={handleUserFormChange}
                                required
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                            <select
                                name="role"
                                value={userForm.role}
                                onChange={handleUserFormChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="Admin">Admin</option>
                                <option value="Investment Manager">Investment Manager</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                            <textarea
                                name="address"
                                value={userForm.address}
                                onChange={handleUserFormChange}
                                rows="2"
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User ID</label>
                            <input
                                type="text"
                                name="userId"
                                value={userForm.userId}
                                onChange={handleUserFormChange}
                                placeholder="Must end with @nimb"
                                required
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={userForm.password}
                                onChange={handleUserFormChange}
                                placeholder="Min 1 number, 1 special char"
                                required
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors flex items-center justify-center">
                            <UserPlus size={18} className="mr-2" />
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserProfileMaster;
