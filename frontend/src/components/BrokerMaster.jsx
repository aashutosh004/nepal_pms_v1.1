import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Upload, X, Check, Search, Save, Trash2, Edit2, AlertCircle, FileSpreadsheet, Phone } from 'lucide-react';
import * as XLSX from 'xlsx';

const BrokerMaster = () => {
    // Mock Data
    const [brokers, setBrokers] = useState([
        { id: 1, name: 'ABC Securities', code: 'ABC001', contactPerson: 'John Doe', contactNumber: '+977-9800000001', email: 'contact@abc.com', commission: '0.4%', notes: 'Top tier' },
        { id: 2, name: 'Himalayan Capital', code: 'HIM002', contactPerson: 'Jane Smith', contactNumber: '+977-9800000002', email: 'info@himalayan.com', commission: 'Flat Rs 25', notes: '' },
    ]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [fileUploadError, setFileUploadError] = useState('');

    // Country Codes
    const countryCodes = ['+977', '+91', '+1', '+44', '+86', '+81'];

    const initialFormState = {
        name: '',
        code: '',
        contactPerson: '',
        countryCode: '+91', // Default as per requirements
        phoneNumber: '',
        email: '',
        commission: '',
        notes: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'code') {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase().slice(0, 50) }));
        } else if (name === 'phoneNumber') {
            // Allow only numbers
            if (/^\d*$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setIsFormOpen(false);
        setFileUploadError('');
    };

    const handleEdit = (broker) => {
        // Split contact number back into code and number if possible
        let cCode = '+91';
        let pNum = '';

        if (broker.contactNumber.includes('-')) {
            const parts = broker.contactNumber.split('-');
            cCode = parts[0];
            pNum = parts[1];
        } else {
            pNum = broker.contactNumber;
        }

        setFormData({
            name: broker.name,
            code: broker.code,
            contactPerson: broker.contactPerson,
            countryCode: cCode,
            phoneNumber: pNum,
            email: broker.email,
            commission: broker.commission,
            notes: broker.notes
        });
        setEditingId(broker.id);
        setIsFormOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this broker?')) {
            setBrokers(prev => prev.filter(b => b.id !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Concatenate Phone Number
        const fullContactNumber = `${formData.countryCode}-${formData.phoneNumber}`;
        console.log("Submitting Payload with Phone:", fullContactNumber);

        const newBroker = {
            name: formData.name,
            code: formData.code,
            contactPerson: formData.contactPerson,
            contactNumber: fullContactNumber,
            email: formData.email,
            commission: formData.commission,
            notes: formData.notes
        };

        if (editingId) {
            setBrokers(prev => prev.map(b => b.id === editingId ? { ...newBroker, id: b.id } : b));
        } else {
            setBrokers(prev => [...prev, { ...newBroker, id: Date.now() }]);
        }
        resetForm();
    };

    // File Upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileType = file.name.split('.').pop().toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
            alert('Invalid file format. Please upload CSV or Excel.');
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

            // Strict Column Validation
            const requiredColumns = [
                'Broker Name', 'Broker Code', 'Contact Person', 'Contact Number',
                'Email', 'Commission Structure', 'Notes'
            ];

            const fileColumns = Object.keys(data[0]);
            const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));

            if (missingColumns.length > 0) {
                const errorMsg = `Missing columns: ${missingColumns.join(', ')}`;
                alert(errorMsg);
                setFileUploadError(errorMsg);
                return;
            }

            // Parse Data
            const newEntry = data.map((row, idx) => ({
                id: Date.now() + idx,
                name: row['Broker Name'] || '',
                code: (row['Broker Code'] || '').toUpperCase().slice(0, 50),
                contactPerson: row['Contact Person'] || '',
                contactNumber: row['Contact Number'] || '', // Assuming file has full number or we might need logic, keeping as is for flexibility
                email: row['Email'] || '',
                commission: row['Commission Structure'] || '',
                notes: row['Notes'] || ''
            }));

            setBrokers(prev => [...prev, ...newEntry]);
            setFileUploadError('');
            alert(`Imported ${newEntry.length} brokers successfully.`);
            e.target.value = null;
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Broker Master</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage trading brokers and commissions</p>
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
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors shadow-sm"
                        >
                            <FileSpreadsheet size={18} />
                            Import Data
                        </label>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Add Broker
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {fileUploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    {fileUploadError}
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Broker Name</th>
                                <th className="px-6 py-4">Contact Person</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Commission</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {brokers.map((broker) => (
                                <tr key={broker.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-blue-600 dark:text-blue-400">{broker.code}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{broker.name}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        <div className="flex flex-col">
                                            <span>{broker.contactPerson}</span>
                                            <span className="text-xs text-gray-400">{broker.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{broker.contactNumber}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{broker.commission}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEdit(broker)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(broker.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                            {brokers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No brokers found. Add a new broker or import from CSV.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {/* Modal Form */}
            {isFormOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/50 backdrop-blur-sm">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200 my-8">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {editingId ? 'Edit Broker' : 'Add New Broker'}
                                </h3>
                                <button onClick={resetForm}><X size={24} className="text-gray-500 hover:text-gray-700" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Broker Name */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Broker Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Acme Securities Pvt Ltd"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {/* Broker Code */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Broker Code <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        required
                                        maxLength={50}
                                        placeholder="e.g. ACM001"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                                    />
                                    <p className="text-xs text-gray-500">Auto-converts to uppercase. Max 50 chars.</p>
                                </div>

                                {/* Contact Person */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Contact Person <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. John Doe"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {/* Contact Number (Merged Input) */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Contact Number <span className="text-red-500">*</span></label>
                                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                                        <select
                                            name="countryCode"
                                            value={formData.countryCode}
                                            onChange={handleInputChange}
                                            className="bg-gray-50 dark:bg-gray-800 px-3 py-2.5 border-r border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white outline-none min-w-[80px]"
                                        >
                                            {countryCodes.map(code => (
                                                <option key={code} value={code}>{code}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Mobile Number"
                                            className="flex-1 px-4 py-2.5 bg-transparent text-gray-900 dark:text-white outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Email Address <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="john@example.com"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {/* Commission Structure */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Commission Structure</label>
                                    <input
                                        type="text"
                                        name="commission"
                                        value={formData.commission}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 0.35% or Flat Rs 500"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {/* Notes */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Notes <span className="text-xs text-gray-500 font-normal">(Optional)</span></label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Additional details..."
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    ></textarea>
                                </div>

                                {/* Actions */}
                                <div className="md:col-span-2 pt-4 flex gap-3 border-t border-gray-100 dark:border-gray-700 mt-2">
                                    <button type="button" onClick={resetForm} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                                        <Save size={18} />
                                        {editingId ? 'Update Broker' : 'Save Broker'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default BrokerMaster;
