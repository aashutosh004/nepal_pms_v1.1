import React, { useState } from 'react';
import { LayoutDashboard, PieChart, FileText, Settings, Menu, X, ChevronDown, ChevronRight, User, LogOut, FileCheck, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/nimb-blue_1.png';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [expanded, setExpanded] = useState({ Portfolio: true });

    const toggleExpand = (name) => {
        setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['Admin', 'Investment Manager'] },
        {
            name: 'Portfolio',
            icon: PieChart,
            path: '/portfolio',
            roles: ['Investment Manager'],
            subItems: [
                { name: 'Client Details', icon: User, path: '/client-details' }
            ]
        },
        {
            name: 'Asset Details',
            icon: FileText,
            path: '/asset-details',
            roles: ['Investment Manager'],
            subItems: [
                { name: 'Overview', icon: FileText, path: '/asset-details' },
                { name: 'Equity Master', icon: FileText, path: '/asset-details/equity' },
                { name: 'Bond Master', icon: FileText, path: '/asset-details/bond' }
            ]
        },
        {
            name: 'Transactions',
            icon: FileText,
            path: '/transactions',
            roles: ['Investment Manager'],
            subItems: [
                { name: 'Overview', icon: FileText, path: '/transactions' },
                { name: 'Transaction Details', icon: FileText, path: '/transaction-details' }
            ]
        },
        {
            name: 'Corporate Action',
            icon: Briefcase,
            path: '/corporate-action',
            roles: ['Investment Manager'],
            subItems: [
                { name: 'Voluntary', icon: CheckCircle, path: '/corporate-action/voluntary' },
                { name: 'Non-Voluntary', icon: AlertCircle, path: '/corporate-action/non-voluntary' }
            ]
        },
        { name: 'Reports', icon: FileText, path: '/reports', roles: ['Investment Manager'] },
        { name: 'Reconciliation', icon: FileCheck, path: '/reconciliation', roles: ['Investment Manager'] },
        { name: 'Settings', icon: Settings, path: '/settings', roles: ['Admin', 'Investment Manager'] },
    ];

    const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role || 'Investment Manager'));

    const getDisplayName = () => {
        if (!user) return '';
        if (user.userId === 'superadmin@nimb') return 'Super Admin';
        if (user.role === 'Admin') return `${user.name} (Admin)`;
        return `${user.name} (IM)`;
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed left-0 top-0 h-screen bg-gray-900 text-white flex flex-col z-30
                transition-transform duration-300 ease-in-out w-64
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <img src={logo} alt="NIMB PMS" className="h-12 w-auto" />
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="md:hidden text-gray-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {filteredMenuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.subItems && item.subItems.some(sub => location.pathname === sub.path));
                        const isExpanded = expanded[item.name];
                        const hasSubItems = item.subItems && item.subItems.length > 0;

                        return (
                            <div key={item.name}>
                                <div
                                    className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    <Link
                                        to={item.path}
                                        className="flex items-center space-x-3 flex-1"
                                        onClick={() => {
                                            if (window.innerWidth < 768) onClose();
                                        }}
                                    >
                                        <item.icon size={20} />
                                        <span>{item.name}</span>
                                    </Link>
                                    {hasSubItems && (
                                        <div
                                            className="p-1 hover:bg-gray-700 rounded"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleExpand(item.name);
                                            }}
                                        >
                                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </div>
                                    )}
                                </div>

                                {hasSubItems && isExpanded && (
                                    <div className="ml-8 mt-1 space-y-1 border-l-2 border-gray-700 pl-2">
                                        {item.subItems.map((sub) => (
                                            <Link
                                                key={sub.name}
                                                to={sub.path}
                                                className={`flex items-center space-x-3 p-2 rounded-lg text-sm transition-colors ${location.pathname === sub.path ? 'text-blue-400 font-medium' : 'text-gray-500 hover:text-gray-300'}`}
                                                onClick={() => {
                                                    if (window.innerWidth < 768) onClose();
                                                }}
                                            >
                                                <sub.icon size={16} />
                                                <span>{sub.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <div className="flex flex-col gap-4">
                        <div>
                            <div className="text-sm text-gray-400">Logged in as</div>
                            <div className="font-semibold text-sm">{getDisplayName()}</div>
                        </div>
                        <button
                            onClick={logout}
                            className="group flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-900/50 text-red-400 hover:from-red-600 hover:to-red-700 hover:text-white hover:border-red-500 transition-all duration-300 shadow-lg hover:shadow-red-900/20"
                            title="Logout"
                        >
                            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
                            <span className="font-medium text-sm tracking-wide">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
