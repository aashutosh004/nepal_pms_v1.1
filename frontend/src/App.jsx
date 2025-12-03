import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Reconciliation from './components/Reconciliation';
import PortfolioRebalancing from './components/PortfolioRebalancing';
import ManualRebalancing from './components/ManualRebalancing';
import PortfolioOverview from './components/PortfolioOverview';
import ClientDetails from './components/ClientDetails';
import AssetDetails from './components/AssetDetails';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import Settings from './components/Settings';
import ClientDelete from './components/ClientDelete';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import EquityMaster from './components/EquityMaster';
import BondMaster from './components/BondMaster';
import CorporateAction from './components/CorporateAction';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Menu } from 'lucide-react';

const MainLayout = () => {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!user) {
        return <Login />;
    }

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans dark:bg-gray-900 transition-colors duration-200">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 transition-all duration-300">
                {/* Mobile Header */}
                <div className="md:hidden bg-white dark:bg-gray-800 p-4 flex items-center shadow-sm sticky top-0 z-10">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-semibold text-gray-800 dark:text-white">NIMB PMS</span>
                </div>

                <main className="p-6">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/portfolio" element={<PortfolioOverview />} />
                        <Route path="/client-details" element={<ClientDetails />} />
                        <Route path="/client-details/delete" element={<ClientDelete />} />
                        <Route path="/client-details/:portfolioId" element={<ClientDetails />} />
                        <Route path="/asset-details" element={<AssetDetails />} />
                        <Route path="/asset-details/equity" element={<EquityMaster />} />
                        <Route path="/asset-details/bond" element={<BondMaster />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/corporate-action" element={<Navigate to="/corporate-action/voluntary" replace />} />
                        <Route path="/corporate-action/voluntary" element={<CorporateAction />} />
                        <Route path="/corporate-action/non-voluntary" element={<CorporateAction />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/rebalancing" element={<PortfolioRebalancing />} />
                        <Route path="/manual-rebalancing" element={<ManualRebalancing />} />
                        <Route path="/reconciliation" element={<Reconciliation />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/user-management/hidden" element={<UserManagement />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <MainLayout />
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
