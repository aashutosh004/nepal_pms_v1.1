import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Upload, X, Check, Search, Save, Trash2, Edit2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const CurrencyMaster = () => {
    // Mock Data
    const [currencies, setCurrencies] = useState([
        { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States', decimalPlaces: 2, isActive: true, createdDate: '2023-01-01', updatedDate: '2023-06-15' },
        { id: 2, code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs.', country: 'Nepal', decimalPlaces: 2, isActive: true, createdDate: '2023-01-01', updatedDate: '2023-12-01' },
        { id: 3, code: 'INR', name: 'Indian Rupee', symbol: '₹', country: 'India', decimalPlaces: 2, isActive: true, createdDate: '2023-02-10', updatedDate: '2023-02-10' },
        { id: 4, code: 'EUR', name: 'Euro', symbol: '€', country: 'European Union', decimalPlaces: 2, isActive: true, createdDate: '2023-03-05', updatedDate: '2023-03-05' },
    ]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        symbol: '',
        country: '',
        decimalPlaces: 2,
        isActive: true
    });

    const [fileUploadError, setFileUploadError] = useState('');

    // Static Lists for Dropdowns
    const currencyCodes = ['USD', 'NPR', 'INR', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY', 'CHF'];
    const countries = ['United States', 'Nepal', 'India', 'United Kingdom', 'Australia', 'Canada', 'Japan', 'China', 'Switzerland', 'European Union'];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            symbol: '',
            country: '',
            decimalPlaces: 2,
            isActive: true
        });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleEdit = (currency) => {
        setFormData({
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
            country: currency.country,
            decimalPlaces: currency.decimalPlaces,
            isActive: currency.isActive
        });
        setEditingId(currency.id);
        setIsFormOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this currency?')) {
            setCurrencies(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const currentDate = new Date().toISOString().split('T')[0];

        if (editingId) {
            setCurrencies(prev => prev.map(c => c.id === editingId ? { ...c, ...formData, updatedDate: currentDate } : c));
        } else {
            const newCurrency = {
                id: Date.now(),
                ...formData,
                createdDate: currentDate,
                updatedDate: currentDate
            };
            setCurrencies(prev => [...prev, newCurrency]);
        }
        resetForm();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileType = file.name.split('.').pop().toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
            alert('Invalid file format. Please upload CSV or Excel file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const wsname = workbook.SheetNames[0];
            const ws = workbook.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            if (data.length === 0) {
                setFileUploadError('File is empty.');
                return;
            }

            // Validate Columns
            const requiredColumns = ['Currency Code', 'Currency Name', 'Symbol', 'Country', 'Decimal Places', 'IsActive'];
            const fileColumns = Object.keys(data[0]);
            const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));

            if (missingColumns.length > 0) {
                alert(`Missing required columns: ${missingColumns.join(', ')}`);
                setFileUploadError(`Missing columns: ${missingColumns.join(', ')}`);
                return;
            }

            // Add Data
            const newCurrencies = data.map((row, index) => ({
                id: Date.now() + index,
                code: row['Currency Code']?.toUpperCase() || '',
                name: row['Currency Name'] || '',
                symbol: row['Symbol'] || '',
                country: row['Country'] || '',
                decimalPlaces: parseInt(row['Decimal Places']) || 2,
                isActive: row['IsActive'] === 'TRUE' || row['IsActive'] === true || row['IsActive'] === 1,
                createdDate: new Date().toISOString().split('T')[0],
                updatedDate: new Date().toISOString().split('T')[0]
            }));

            setCurrencies(prev => [...prev, ...newCurrencies]);
            setFileUploadError('');
            alert(`Successfully imported ${newCurrencies.length} currencies.`);
            e.target.value = null; // Reset input
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Currency Master</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage system currencies</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".csv, .xlsx, .xls"
                            onChange={handleFileUpload}
                        />
                        <label
                            htmlFor="file-upload"
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors"
                        >
                            <FileSpreadsheet size={18} />
                            Import CSV/Excel
                        </label>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                        Add Currency
                    </button>
                </div>
            </div>

            {/* Error Message for Upload */}
            {fileUploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} />
                    {fileUploadError}
                </div>
            )}

            {/* List View */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Symbol</th>
                                <th className="px-6 py-4">Country</th>
                                <th className="px-6 py-4 text-center">Decimal</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4">Last Updated</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {currencies.map((currency) => (
                                <tr key={currency.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{currency.code}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{currency.name}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-lg">{currency.symbol}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{currency.country}</td>
                                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">{currency.decimalPlaces}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currency.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {currency.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{currency.updatedDate}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(currency)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(currency.id)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {currencies.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No currencies found. Add one or import from file.
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isFormOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingId ? 'Edit Currency' : 'Add New Currency'}
                            </h3>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Currency Code */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency Code <span className="text-red-500">*</span></label>
                                <select
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Code</option>
                                    {currencyCodes.map(code => <option key={code} value={code}>{code}</option>)}
                                </select>
                            </div>

                            {/* Currency Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. US Dollar"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* Symbol */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Symbol <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="symbol"
                                    value={formData.symbol}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. $"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* Country */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country <span className="text-red-500">*</span></label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Country</option>
                                    {countries.map(country => <option key={country} value={country}>{country}</option>)}
                                </select>
                            </div>

                            {/* Decimal Places */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Decimal Places</label>
                                <input
                                    type="number"
                                    name="decimalPlaces"
                                    value={formData.decimalPlaces}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="4"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* Is Active Toggle */}
                            <div className="flex items-center justify-between md:col-span-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                <span className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Active Status</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Enable or disable this currency</span>
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* Form Actions */}
                            <div className="md:col-span-2 pt-4 flex gap-3 border-t border-gray-100 dark:border-gray-700 mt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-medium rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    {editingId ? 'Update Currency' : 'Save Currency'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CurrencyMaster;
