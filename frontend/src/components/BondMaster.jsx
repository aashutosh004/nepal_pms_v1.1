import React, { useState, useEffect } from 'react';
import { Upload, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BondMaster = () => {
    const { user } = useAuth();
    const [bonds, setBonds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        BondName: '',
        ISIN: '',
        Ticker: '',
        BBGID: '',
        SecurityType: 'Non-Convertible Debenture',
        IssueDate: '',
        IssueSize: 0,
        ModeOfIssue: 'Private',
        OutstandingAmount: 0,
        MaturityDate: '',
        ListingStatus: 'Listed',
        Exchange: 'NSE',
        IssuerName: '',
        IssueType: 'Private Placement',
        CouponRate: 0.0,
        CouponType: 'Fixed',
        Frequency: 'Annually',
        DayCount: '',
        NextCouponDate: '',
        ResetIndex: '',
        FaceValue: 1000,
        Currency: 'INR',
        Amortization: '',
        RedemptionType: '',
        EmbeddedOptions: '',
        MinTradableLot: 0,
        CreditRating: '',
        RatingAgency: '',
        Seniority: 'Unsecured',
        Security: '',
        TaxStatus: 'Taxable',
        WithholdingTDS: '',
        CapitalGains: '',
        RegulatoryTags: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchBonds();
    }, []);

    const fetchBonds = async () => {
        try {
            const response = await fetch(`${API_URL}/api/bond-master`);
            if (response.ok) {
                const data = await response.json();
                setBonds(data);
            }
        } catch (error) {
            console.error("Error fetching bonds:", error);
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
            const response = await fetch(`${API_URL}/api/bond-master`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                alert("Bond created successfully");
                fetchBonds();
            } else {
                const err = await response.json();
                alert(`Error: ${err.detail}`);
            }
        } catch (error) {
            console.error("Error creating bond:", error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/api/bond-master/upload`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                fetchBonds();
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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bond Master</h1>
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

            {/* Main Form Grid - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Security Details */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">Security Details</h3>
                    <div className="space-y-3">
                        <InputField label="ISIN" name="ISIN" value={formData.ISIN} onChange={handleInputChange} required placeholder="INE..." />
                        <InputField label="Bond Name" name="BondName" value={formData.BondName} onChange={handleInputChange} required />
                        <InputField label="Ticker" name="Ticker" value={formData.Ticker} onChange={handleInputChange} />
                        <InputField label="BBG ID" name="BBGID" value={formData.BBGID} onChange={handleInputChange} />
                        <InputField label="Security Type" name="SecurityType" value={formData.SecurityType} onChange={handleInputChange} />
                    </div>
                </div>

                {/* 2. Issue Details */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">Issue Details</h3>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <InputField label="Issue Date" name="IssueDate" type="date" value={formData.IssueDate} onChange={handleInputChange} />
                            <InputField label="Maturity Date" name="MaturityDate" type="date" value={formData.MaturityDate} onChange={handleInputChange} />
                        </div>
                        <InputField label="Issue Size" name="IssueSize" type="number" value={formData.IssueSize} onChange={handleInputChange} />
                        <InputField label="Mode of Issue" name="ModeOfIssue" value={formData.ModeOfIssue} onChange={handleInputChange} />
                        <InputField label="Outstanding Amount" name="OutstandingAmount" type="number" value={formData.OutstandingAmount} onChange={handleInputChange} />
                        <SelectField label="Listing Status" name="ListingStatus" value={formData.ListingStatus} onChange={handleInputChange} options={['Listed', 'Unlisted']} />
                        <InputField label="Exchange" name="Exchange" value={formData.Exchange} onChange={handleInputChange} />
                        <InputField label="Issuer Name" name="IssuerName" value={formData.IssuerName} onChange={handleInputChange} />
                        <InputField label="Issue Type" name="IssueType" value={formData.IssueType} onChange={handleInputChange} />
                    </div>
                </div>

                {/* 3. Coupon Details */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">Coupon Details</h3>
                    <div className="space-y-3">
                        <InputField label="Coupon Rate (%)" name="CouponRate" type="number" step="0.01" value={formData.CouponRate} onChange={handleInputChange} />
                        <SelectField label="Type" name="CouponType" value={formData.CouponType} onChange={handleInputChange} options={['Fixed', 'Floating', 'Zero Coupon']} />
                        <SelectField label="Frequency" name="Frequency" value={formData.Frequency} onChange={handleInputChange} options={['Annually', 'Semi-Annually', 'Quarterly', 'Monthly']} />
                        <InputField label="Day Count" name="DayCount" value={formData.DayCount} onChange={handleInputChange} />
                        <InputField label="Next Coupon Date" name="NextCouponDate" type="date" value={formData.NextCouponDate} onChange={handleInputChange} />
                        <InputField label="Reset Index" name="ResetIndex" value={formData.ResetIndex} onChange={handleInputChange} />
                    </div>
                </div>

                {/* 4. Principal Details */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">Principal Details</h3>
                    <div className="space-y-3">
                        <InputField label="Face Value" name="FaceValue" type="number" value={formData.FaceValue} onChange={handleInputChange} />
                        <InputField label="Currency" name="Currency" value={formData.Currency} onChange={handleInputChange} />
                        <InputField label="Amortization" name="Amortization" value={formData.Amortization} onChange={handleInputChange} />
                        <InputField label="Redemption Type" name="RedemptionType" value={formData.RedemptionType} onChange={handleInputChange} />
                        <InputField label="Embedded Options" name="EmbeddedOptions" value={formData.EmbeddedOptions} onChange={handleInputChange} />
                        <InputField label="Min Tradable Lot" name="MinTradableLot" type="number" value={formData.MinTradableLot} onChange={handleInputChange} />
                    </div>
                </div>

                {/* 5. Credit & Risk */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">Credit & Risk</h3>
                    <div className="space-y-3">
                        <InputField label="Credit Rating" name="CreditRating" value={formData.CreditRating} onChange={handleInputChange} />
                        <InputField label="Rating Agency" name="RatingAgency" value={formData.RatingAgency} onChange={handleInputChange} />
                        <SelectField label="Seniority" name="Seniority" value={formData.Seniority} onChange={handleInputChange} options={['Senior', 'Subordinated', 'Junior']} />
                        <SelectField label="Security" name="Security" value={formData.Security} onChange={handleInputChange} options={['Secured', 'Unsecured']} />
                    </div>
                </div>

                {/* 6. Tax Details */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">Tax Details</h3>
                    <div className="space-y-3">
                        <SelectField label="Tax Status" name="TaxStatus" value={formData.TaxStatus} onChange={handleInputChange} options={['Taxable', 'Tax Free']} />
                        <InputField label="Withholding / TDS" name="WithholdingTDS" value={formData.WithholdingTDS} onChange={handleInputChange} />
                        <InputField label="Capital Gains" name="CapitalGains" value={formData.CapitalGains} onChange={handleInputChange} />
                        <InputField label="Regulatory Tags" name="RegulatoryTags" value={formData.RegulatoryTags} onChange={handleInputChange} />
                    </div>
                </div>

            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-6">
                <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Existing Bonds</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ISIN</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Coupon</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Maturity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {bonds.map((bond) => (
                                <tr key={bond.ISIN}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{bond.ISIN}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{bond.BondName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{bond.CouponRate}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{bond.MaturityDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{bond.CreditRating}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BondMaster;
