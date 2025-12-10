import React, { useState } from 'react';
import { Save, Briefcase, Building, Users } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const ClientMaster = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        // Section 1: Portfolio Information
        userId: 'Auto-generated',
        portfolioId: '',
        portfolioType: '',
        productType: '',
        portfolioLevel: '',
        riskLevel: '',
        relationshipManager: '',

        // Section 2: Bank Details
        bankName: '',
        bankAccountNo: '',
        ifscCode: '',

        // Section 3: Broker & Nominee Details
        brokerName: '',
        brokerAccountNo: '',
        nomineeName: '',
        allocationPercentage: '',
        relationship: ''
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const generatePortfolioId = (productType) => {
        const prefix = "NIBL";
        const assetClass = productType === 'EQ' ? 'EQ' : (productType === 'FI' ? 'FI' : 'XX');
        const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit random
        return `${prefix}${assetClass}${randomNum}`;
    };

    const validateField = (name, value) => {
        let error = '';

        // Common Regex Patterns
        const noSpecialChars = /^[a-zA-Z0-9 ]*$/;
        const noDoubleSpaces = /  /;
        const numericOnly = /^[0-9]*$/;
        const alphanumericOnly = /^[a-zA-Z0-9]*$/;

        switch (name) {
            case 'portfolioType':
            case 'productType':
            case 'riskLevel':
            case 'relationship':
            case 'portfolioLevel':
                if (!value) error = 'Select a value';
                break;

            case 'relationshipManager':
            case 'bankName':
            case 'brokerName':
            case 'nomineeName':
                if (!noSpecialChars.test(value)) error = 'No special characters allowed';
                else if (noDoubleSpaces.test(value)) error = 'Max one space between words allowed';
                break;

            case 'bankAccountNo':
            case 'brokerAccountNo':
                if (!numericOnly.test(value)) error = 'Accept only numbers (0-9)';
                break;

            case 'ifscCode':
                if (!alphanumericOnly.test(value)) error = 'Alphanumeric only';
                break;

            case 'allocationPercentage':
                if (value !== '' && (Number(value) < 0 || Number(value) > 100)) error = 'Value must be between 0 and 100';
                break;

            default:
                break;
        }
        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if ((name === 'bankAccountNo' || name === 'brokerAccountNo') && !/^[0-9]*$/.test(value)) {
            return; // Ignore non-numeric input
        }

        let updatedFormData = { ...formData, [name]: value };

        // Auto-generate Portfolio ID when Product Type changes
        if (name === 'productType') {
            updatedFormData.portfolioId = generatePortfolioId(value);
        }

        setFormData(updatedFormData);

        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setSubmitting(true);
            try {
                // Call backend API
                const res = await axios.post(`${API_URL}/api/portfolio/create`, formData);
                alert("Client created successfully!");
                navigate('/client-details');
            } catch (error) {
                console.error("Error submitting form:", error);
                alert("Error submitting form. Please try again.");
            } finally {
                setSubmitting(false);
            }
        } else {
            alert("Please fix the errors before saving.");
        }
    };

    return (
        <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Client Master</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Portfolio Information */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                        <Briefcase className="text-blue-600 mr-2" size={20} />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Portfolio Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User ID</label>
                            <input type="text" name="userId" value={formData.userId} readOnly className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio ID</label>
                            <input type="text" name="portfolioId" value={formData.portfolioId} readOnly className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio Type <span className="text-red-500">*</span></label>
                            <select name="portfolioType" value={formData.portfolioType} onChange={handleInputChange} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${errors.portfolioType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                <option value="">Select a value</option>
                                <option value="Discretionary">Discretionary</option>
                                <option value="Non-Discretionary">Non-Discretionary</option>
                            </select>
                            {errors.portfolioType && <p className="text-xs text-red-500 mt-1">{errors.portfolioType}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Type <span className="text-red-500">*</span></label>
                            <select name="productType" value={formData.productType} onChange={handleInputChange} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${errors.productType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                <option value="">Select a value</option>
                                <option value="EQ">EQ</option>
                                <option value="FI">FI</option>
                            </select>
                            {errors.productType && <p className="text-xs text-red-500 mt-1">{errors.productType}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio Level <span className="text-red-500">*</span></label>
                            <select name="portfolioLevel" value={formData.portfolioLevel} onChange={handleInputChange} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${errors.portfolioLevel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                <option value="">Select a value</option>
                                <option value="Standard">Standard</option>
                                <option value="VIP">VIP</option>
                                <option value="VVIP">VVIP</option>
                            </select>
                            {errors.portfolioLevel && <p className="text-xs text-red-500 mt-1">{errors.portfolioLevel}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Risk Level <span className="text-red-500">*</span></label>
                            <select name="riskLevel" value={formData.riskLevel} onChange={handleInputChange} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${errors.riskLevel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                <option value="">Select a value</option>
                                <option value="High">High</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Low">Low</option>
                            </select>
                            {errors.riskLevel && <p className="text-xs text-red-500 mt-1">{errors.riskLevel}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relationship Manager</label>
                            <input type="text" name="relationshipManager" value={formData.relationshipManager} onChange={handleInputChange} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${errors.relationshipManager ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {errors.relationshipManager && <p className="text-xs text-red-500 mt-1">{errors.relationshipManager}</p>}
                        </div>
                    </div>
                </div>

                {/* Section 2: Bank Details */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                        <Building className="text-blue-600 mr-2" size={20} />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Bank Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                            <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${errors.bankName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {errors.bankName && <p className="text-xs text-red-500 mt-1">{errors.bankName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Acc. No</label>
                            <input type="text" name="bankAccountNo" value={formData.bankAccountNo} onChange={handleInputChange} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${errors.bankAccountNo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder="0-9 only" />
                            {errors.bankAccountNo && <p className="text-xs text-red-500 mt-1">{errors.bankAccountNo}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC Code</label>
                            <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${errors.ifscCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {errors.ifscCode && <p className="text-xs text-red-500 mt-1">{errors.ifscCode}</p>}
                        </div>
                    </div>
                </div>

                {/* Section 3: Broker & Nominee Details */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                        <Users className="text-blue-600 mr-2" size={20} />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Broker & Nominee Details</h3>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Broker Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Broker Name</label>
                                <input type="text" name="brokerName" value={formData.brokerName} onChange={handleInputChange} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${errors.brokerName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.brokerName && <p className="text-xs text-red-500 mt-1">{errors.brokerName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Broker Account No.</label>
                                <input type="text" name="brokerAccountNo" value={formData.brokerAccountNo} onChange={handleInputChange} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${errors.brokerAccountNo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder="0-9 only" />
                                {errors.brokerAccountNo && <p className="text-xs text-red-500 mt-1">{errors.brokerAccountNo}</p>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Nominee Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nominee Name</label>
                                <input type="text" name="nomineeName" value={formData.nomineeName} onChange={handleInputChange} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${errors.nomineeName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.nomineeName && <p className="text-xs text-red-500 mt-1">{errors.nomineeName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allocation Percentage (%)</label>
                                <input type="number" name="allocationPercentage" value={formData.allocationPercentage} onChange={handleInputChange} min="0" max="100" className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${errors.allocationPercentage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.allocationPercentage && <p className="text-xs text-red-500 mt-1">{errors.allocationPercentage}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relationship <span className="text-red-500">*</span></label>
                                <select name="relationship" value={formData.relationship} onChange={handleInputChange} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${errors.relationship ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                    <option value="">Select a value</option>
                                    <option value="Son">Son</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Daughter">Daughter</option>
                                </select>
                                {errors.relationship && <p className="text-xs text-red-500 mt-1">{errors.relationship}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center disabled:opacity-50">
                        <Save size={16} className="mr-2" /> {submitting ? 'Submitting...' : 'Submit Form'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClientMaster;
