import React, { useState } from 'react';
import { LayoutDashboard, FileCheck, Settings, PieChart, FileText, ChevronDown, ChevronRight, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/nimb-blue_1.png';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [expanded, setExpanded] = useState({ Portfolio: true });

    const toggleExpand = (name) => {
        setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        {
            name: 'Portfolio',
            icon: PieChart,
            path: '/portfolio',
            subItems: [
                { name: 'Client Details', icon: User, path: '/client-details' }
            ]
        },
        { name: 'Asset Details', icon: FileText, path: '/asset-details' },
        { name: 'Transactions', icon: FileText, path: '/transactions' },
        { name: 'Reports', icon: FileText, path: '/reports' },
        { name: 'Reconciliation', icon: FileCheck, path: '/reconciliation' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

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
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
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
                    <div className="text-sm text-gray-400">Logged in as</div>
                    <div className="font-semibold">{getDisplayName()}</div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
