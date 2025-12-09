import React, { useState } from 'react';
import { LayoutDashboard, PieChart, FileText, Settings, Menu, X, ChevronDown, ChevronRight, User, LogOut, FileCheck, Briefcase, CheckCircle, AlertCircle, Database } from 'lucide-react';
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
            name: 'Master',
            icon: Database,
            path: '/master',
            roles: ['Investment Manager'],
            subItems: [
                {
                    name: 'Security Master',
                    icon: FileText,
                    path: '/master/security',
                    subItems: [
                        { name: 'Equity Master', icon: FileText, path: '/master/equity' },
                        { name: 'Bond Master', icon: FileText, path: '/master/bond' }
                    ]
                },
                { name: 'Broker Master', icon: FileText, path: '/master/broker' },
                { name: 'Holiday Master', icon: FileText, path: '/master/holiday' },
                { name: 'Currency Master', icon: FileText, path: '/master/currency' },
                { name: 'Validation Master', icon: FileText, path: '/master/validation' },
                { name: 'User Profile Master', icon: User, path: '/master/user-profile' }
            ]
        },
        {
            name: 'Asset Details',
            icon: FileText,
            path: '/asset-details',
            roles: ['Investment Manager'],
            subItems: [
                { name: 'Overview', icon: FileText, path: '/asset-details' }
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

    const renderMenuItem = (item, level = 0) => {
        const isActive = location.pathname === item.path || (item.subItems && item.subItems.some(sub => location.pathname === sub.path || (sub.subItems && sub.subItems.some(subSub => location.pathname === subSub.path))));
        const isExpanded = expanded[item.name];
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const paddingLeft = level * 12 + 12; // Dynamic padding based on level

        return (
            <div key={item.name}>
                <div
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ease-out cursor-pointer hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1 hover:scale-[1.02] ${isActive ? 'bg-blue-600 text-white shadow-md shadow-black/20 font-semibold' : 'text-gray-300 hover:bg-blue-800 hover:text-white'} ${level > 0 ? 'text-sm py-2' : ''}`}
                    style={{ paddingLeft: `${paddingLeft}px` }}
                >
                    <Link
                        to={item.path}
                        className="flex items-center space-x-3 flex-1"
                        onClick={(e) => {
                            if (item.name === 'Master' || item.name === 'Security Master') {
                                e.preventDefault();
                                toggleExpand(item.name);
                            } else if (window.innerWidth < 768) {
                                onClose();
                            }
                        }}
                    >
                        <item.icon size={level === 0 ? 20 : 16} />
                        <span>{item.name}</span>
                    </Link>
                    {hasSubItems && (
                        <div
                            className="p-1 hover:bg-blue-700 rounded text-gray-300"
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
                    <div className={`space-y-1 ${level === 0 ? 'mt-1 mb-2' : ''} border-l-2 border-blue-800 ml-4`}>
                        {item.subItems.map((sub) => renderMenuItem(sub, level + 1))}
                    </div>
                )}
            </div>
        );
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
                fixed left-0 top-0 h-screen bg-[#003366] text-white flex flex-col z-30
                transition-transform duration-300 ease-in-out w-64
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="p-6 border-b border-blue-800 flex justify-between items-center">
                    <div className="bg-white/90 p-2 rounded-lg shadow-lg shadow-blue-900/50 backdrop-blur-sm">
                        <img src={logo} alt="NIMB PMS" className="h-16 w-auto" />
                    </div>
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
                    {filteredMenuItems.map((item) => renderMenuItem(item))}
                </nav>
                <div className="p-4 border-t border-blue-800">
                    <div className="flex flex-col gap-4">
                        <div>
                            <div className="text-sm text-gray-400">Logged in as</div>
                            <div className="font-semibold text-sm text-white">{getDisplayName()}</div>
                        </div>
                        <button
                            onClick={logout}
                            className="group relative flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-red-400 shadow-sm hover:shadow-lg hover:shadow-red-500/20 hover:bg-gradient-to-r hover:from-red-900/80 hover:to-red-800/80 hover:text-white hover:border-transparent transition-all duration-300 ease-out overflow-hidden"
                            title="Logout"
                        >
                            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            <LogOut size={18} className="relative z-10 group-hover:-translate-x-1 transition-transform duration-300" />
                            <span className="relative z-10 font-semibold text-sm tracking-wide">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
