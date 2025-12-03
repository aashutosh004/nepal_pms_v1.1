import React, { useState, useEffect } from 'react';
import { Upload, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EquityMaster = () => {
    const { user } = useAuth();
    const [equities, setEquities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        ISIN: '',
        TickerNSE: '', // Combined NSE/BSE Ticker in UI, but separate in DB. We'll use this for NSE.
        TickerBSE: '',
        SecurityName: '',
        IssuerLEI: '',
        Country: 'IN',
        Currency: 'INR',
        ListingDate: '',
        Status: 'Active',
        AssetClass: 'Equity',
        SubAssetClass: 'Common Stock',
        Sector: '',
        Industry: '',
        MarketSegment: '',
        Identifiers: '',
        PrimaryExchange: 'NSE',
        MIC: '',
        FaceValue: 10,
        LotSize: 1,
        TickSize: '',
        SettlementCycle: 'T+1',
        TradingStatus: 'Active',
        ActionType: '',
        EffectiveDate: '',
        Details: '',
        AdjustmentFactor: '',
        Notes: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchEquities();
    }, []);

    const fetchEquities = async () => {
        try {
            const response = await fetch(`${API_URL}/api/equity-master`);
            if (response.ok) {
                const data = await response.json();
                setEquities(data);
            }
        } catch (error) {
            console.error("Error fetching equities:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/equity-master`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                alert("Equity created successfully");
                fetchEquities();
            } else {
                const err = await response.json();
                alert(`Error: ${err.detail}`);
            }
        } catch (error) {
            console.error("Error creating equity:", error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/api/equity-master/upload`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                fetchEquities();
            } else {
                alert(`Upload failed: ${result.detail}`);
            }
        } catch (error) {
            console.error("Upload error:", error);
        }
    };

    // Helper for input fields
    const InputField = ({ label, name, type = "text", value, onChange, required = false, placeholder = "" }) => (
        <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            />
        </div>
    );

    const SelectField = ({ label, name, value, onChange, options }) => (
        <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Equity Master</h1>
                <div className="flex space-x-4">
                    <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-sm font-medium transition-colors">
                        <Upload size={18} className="mr-2" />
                        Upload CSV
                        <input type="file" accept=".csv, .xlsx" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button onClick={handleSubmit} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                        <Save size={18} className="mr-2" />
                        Save
                    </button>
                </div>
            </div>

            {/* Main Form Grid - 2x2 Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Security Details */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">Security Details</h3>
                    <div className="space-y-3">
                        <InputField label="ISIN" name="ISIN" value={formData.ISIN} onChange={handleInputChange} required placeholder="INE..." />
                        <div className="grid grid-cols-2 gap-2">
                            <InputField label="NSE Ticker" name="TickerNSE" value={formData.TickerNSE} onChange={handleInputChange} placeholder="RELIANCE" />
                            <InputField label="BSE Ticker" name="TickerBSE" value={formData.TickerBSE} onChange={handleInputChange} placeholder="500325" />
                        </div>
                        <InputField label="Security Name" name="SecurityName" value={formData.SecurityName} onChange={handleInputChange} required />
                        <InputField label="Issuer LEI" name="IssuerLEI" value={formData.IssuerLEI} onChange={handleInputChange} />
                        <div className="grid grid-cols-2 gap-2">
                            <InputField label="Country" name="Country" value={formData.Country} onChange={handleInputChange} />
                            <InputField label="Currency" name="Currency" value={formData.Currency} onChange={handleInputChange} />
                        </div>
                        <InputField label="Listing Date" name="ListingDate" type="date" value={formData.ListingDate} onChange={handleInputChange} />
                        <SelectField label="Status" name="Status" value={formData.Status} onChange={handleInputChange} options={['Active', 'Inactive', 'Suspended']} />
                    </div>
                </div>

                {/* 2. Instrument Classification */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">Instrument Classification</h3>
                    <div className="space-y-3">
                        <InputField label="Asset Class" name="AssetClass" value={formData.AssetClass} onChange={handleInputChange} />
                        <InputField label="Sub-Type" name="SubAssetClass" value={formData.SubAssetClass} onChange={handleInputChange} />
                        <InputField label="Sector (GICS)" name="Sector" value={formData.Sector} onChange={handleInputChange} />
                        <InputField label="Industry" name="Industry" value={formData.Industry} onChange={handleInputChange} />
                        <InputField label="Market Segment" name="MarketSegment" value={formData.MarketSegment} onChange={handleInputChange} />
                        <InputField label="Identifiers (BBGID / RIC)" name="Identifiers" value={formData.Identifiers} onChange={handleInputChange} />
                    </div>
                </div>

                {/* 3. Trading Details */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">Trading Details</h3>
                    <div className="space-y-3">
                        <InputField label="Primary Exchange" name="PrimaryExchange" value={formData.PrimaryExchange} onChange={handleInputChange} />
                        <InputField label="MIC" name="MIC" value={formData.MIC} onChange={handleInputChange} />
                        <InputField label="Face Value" name="FaceValue" type="number" value={formData.FaceValue} onChange={handleInputChange} />
                        <InputField label="Lot Size (Cash)" name="LotSize" type="number" value={formData.LotSize} onChange={handleInputChange} />
                        <InputField label="Tick Size" name="TickSize" value={formData.TickSize} onChange={handleInputChange} />
                        <SelectField label="Settlement Cycle" name="SettlementCycle" value={formData.SettlementCycle} onChange={handleInputChange} options={['T+1', 'T+2', 'T+0']} />
                        <SelectField label="Trading Status" name="TradingStatus" value={formData.TradingStatus} onChange={handleInputChange} options={['Active', 'Suspended', 'Delisted']} />
                    </div>
                </div>

                {/* 4. Corporate Actions */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">Corporate Actions</h3>
                    <div className="space-y-3">
                        <SelectField label="Action Type" name="ActionType" value={formData.ActionType} onChange={handleInputChange} options={['', 'Dividend', 'Bonus', 'Split', 'Rights']} />
                        <InputField label="Effective Date" name="EffectiveDate" type="date" value={formData.EffectiveDate} onChange={handleInputChange} />
                        <InputField label="Details / Ratio" name="Details" value={formData.Details} onChange={handleInputChange} placeholder="e.g. Bonus 1:1" />
                        <InputField label="Adjustment Factor" name="AdjustmentFactor" value={formData.AdjustmentFactor} onChange={handleInputChange} placeholder="Auto-calculated" />
                        <div className="flex flex-col space-y-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Notes / History Log</label>
                            <textarea
                                name="Notes"
                                value={formData.Notes}
                                onChange={handleInputChange}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                </div>

            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-6">
                <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Existing Equities</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ISIN</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ticker</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sector</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {equities.map((eq) => (
                                <tr key={eq.ISIN}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{eq.ISIN}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{eq.SecurityName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{eq.TickerNSE}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{eq.Sector}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{eq.Status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EquityMaster;
