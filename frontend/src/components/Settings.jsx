import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Save, UserPlus, Shield, Type, Bell, Link as LinkIcon, LogOut } from 'lucide-react';
import axios from 'axios';
import API_URL from '../config';

const Settings = () => {
    const { user, logout } = useAuth();
    // Default tab depends on role
    const [activeTab, setActiveTab] = useState(user?.role === 'Admin' ? 'Navigation Rights for PMS' : 'Page and Font Adjustments');

    // User Creation State
    const [userForm, setUserForm] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
        role: 'Investment Manager',
        userId: '',
        password: ''
    });

    // Rights State
    const [rights, setRights] = useState({
        navRights: true,
        userRights: true,
        pageAdjustments: true
    });

    // Use Global Theme Context
    const { theme, setTheme, fontSize, setFontSize } = useTheme();

    let menuItems = [
        { name: 'Navigation Rights for PMS', icon: Shield, roles: ['Admin'] },
        { name: 'User Creation', icon: UserPlus, roles: ['Admin'] },
        { name: 'User Rights', icon: Shield, roles: ['Admin'] },
        { name: 'Page and Font Adjustments', icon: Type, roles: ['Admin', 'Investment Manager'] },
        { name: 'Notification Preferences', icon: Bell, roles: ['Admin', 'Investment Manager'] },
        { name: 'Integration (Brokerage APIs, Bank Accounts)', icon: LinkIcon, roles: ['Admin', 'Investment Manager'] }
    ];

    // Filter menu items based on role
    const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role || 'Investment Manager'));

    const toggleRight = (key) => {
        setRights(prev => ({ ...prev, [key]: !prev[key] }));
    };

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

    const renderContent = () => {
        switch (activeTab) {
            case 'Navigation Rights for PMS':
                return (
                    <section className="max-w-2xl">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Navigation Rights for PMS</h2>
                        <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">

                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Navigation Rights for PMS</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Allow access to PMS navigation menu</p>
                                </div>
                                <button
                                    onClick={() => toggleRight('navRights')}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${rights.navRights ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${rights.navRights ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">User Rights</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Allow management of user permissions</p>
                                </div>
                                <button
                                    onClick={() => toggleRight('userRights')}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${rights.userRights ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${rights.userRights ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Page and Font Adjustments</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Allow customization of appearance</p>
                                </div>
                                <button
                                    onClick={() => toggleRight('pageAdjustments')}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${rights.pageAdjustments ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${rights.pageAdjustments ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </section>
                );

            case 'User Creation':
                return (
                    <section className="max-w-2xl">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">User Creation</h2>
                        <form onSubmit={handleCreateUser} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
                            <div className="pt-4">
                                <button type="submit" className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors flex items-center justify-center">
                                    <UserPlus size={18} className="mr-2" />
                                    Create User
                                </button>
                            </div>
                        </form>
                    </section>
                );

            case 'Page and Font Adjustments':
                return (
                    <section className="max-w-2xl">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Page and Font Adjustments</h2>
                        <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">

                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                                        <select
                                            value={theme}
                                            onChange={(e) => setTheme(e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="Light">Light</option>
                                            <option value="Dark">Dark</option>
                                            <option value="System">System</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Size: {fontSize}px</label>
                                        <input
                                            type="range"
                                            min="12"
                                            max="20"
                                            value={fontSize}
                                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>Small</span>
                                            <span>Large</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        This is a preview of how your text will look. The font size adjustment applies globally across the application.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                );

            default:
                return (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                            <Save size={32} />
                        </div>
                        <h3 className="text-lg font-medium mb-1">{activeTab}</h3>
                        <p>This section is currently under development.</p>
                    </div>
                );
        }
    };

    return (
        <div className="p-8 space-y-6 bg-gray-50 min-h-screen dark:bg-gray-900 transition-colors duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex min-h-[600px]">
                {/* Internal Sidebar */}
                <div className="w-64 bg-[#0f172a] text-gray-300 flex-shrink-0 flex flex-col">
                    <div className="p-6 border-b border-gray-800">
                        <h2 className="text-lg font-bold text-white">Settings</h2>
                    </div>
                    <div className="py-4 flex-1 overflow-y-auto">
                        {filteredMenuItems.map((item) => (
                            <div
                                key={item.name}
                                onClick={() => setActiveTab(item.name)}
                                className={`px-6 py-4 cursor-pointer text-sm font-medium transition-colors flex items-center space-x-3 ${activeTab === item.name
                                    ? 'bg-[#1e293b] text-white border-l-4 border-blue-500'
                                    : 'hover:bg-[#1e293b] hover:text-white border-l-4 border-transparent'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span>{item.name}</span>
                            </div>
                        ))}
                    </div>
                    {/* Logout Button */}
                    <div className="p-4 border-t border-gray-800">
                        <button
                            onClick={logout}
                            className="w-full flex items-center space-x-3 px-6 py-3 text-sm font-medium text-red-400 hover:bg-[#1e293b] hover:text-red-300 rounded transition-colors"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Settings;
