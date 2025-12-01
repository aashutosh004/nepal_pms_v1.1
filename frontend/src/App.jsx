import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const MainLayout = () => {
    const { user } = useAuth();

    if (!user) {
        return <Login />;
    }

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans dark:bg-gray-900 transition-colors duration-200">
            <Sidebar />
            <div className="flex-1 ml-64">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/portfolio" element={<PortfolioOverview />} />
                    <Route path="/client-details" element={<ClientDetails />} />
                    <Route path="/client-details/delete" element={<ClientDelete />} />
                    <Route path="/client-details/:portfolioId" element={<ClientDetails />} />
                    <Route path="/asset-details" element={<AssetDetails />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/rebalancing" element={<PortfolioRebalancing />} />
                    <Route path="/manual-rebalancing" element={<ManualRebalancing />} />
                    <Route path="/reconciliation" element={<Reconciliation />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/user-management/hidden" element={<UserManagement />} />
                </Routes>
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
