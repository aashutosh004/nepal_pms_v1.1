import React, { useState, useRef } from 'react';
import { Upload, Play, Download, Filter, X, FileText, AlertTriangle, CheckCircle, Activity, AlertCircle } from 'lucide-react';

const Reconciliation = () => {
    // State for files and delimiters
    const [files, setFiles] = useState({
        im: null,
        cust: null,
        ch: null
    });
    const [delimiters, setDelimiters] = useState({
        im: ',',
        cust: ',',
        ch: ','
    });

    // Validation State
    const [errors, setErrors] = useState({
        im: null,
        cust: null,
        ch: null
    });

    // Toast State
    const [toasts, setToasts] = useState([]);

    // State for processing and results
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [activityLog, setActivityLog] = useState([]);

    // State for filters
    const [filterType, setFilterType] = useState('All Types');
    const [filterTradeId, setFilterTradeId] = useState('');

    // Refs for file inputs to clear them programmatically
    const fileInputRefs = {
        im: useRef(null),
        cust: useRef(null),
        ch: useRef(null)
    };

    // Helper to log activity
    const logActivity = (message) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setActivityLog(prev => [`${time} - ${message}`, ...prev]);
    };

    // Helper to add toast
    const addToast = (message, type = 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    // Remove toast
    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Mock Data Generator
    const loadDemoData = () => {
        const mockIM = [
            { TradeID: 'T001', Amount: 1000, Type: 'Buy' }, // Match
            { TradeID: 'T002', Amount: 2000, Type: 'Sell' }, // Mismatch
            { TradeID: 'T003', Amount: 3000, Type: 'Buy' }, // Orphan (Missing in CH)
        ];
        const mockCust = [
            { TradeID: 'T001', Amount: 1000, Type: 'Buy' },
            { TradeID: 'T002', Amount: 2050, Type: 'Sell' },
            { TradeID: 'T003', Amount: 3000, Type: 'Buy' },
        ];
        const mockCH = [
            { TradeID: 'T001', Amount: 1000, Type: 'Buy' },
            { TradeID: 'T002', Amount: 2000, Type: 'Sell' },
            // T003 missing
        ];

        // Simulate file objects for state consistency (optional, but good for UI)
        // For demo, we skip file validation and directly process
        processReconciliation(mockIM, mockCust, mockCH);
        logActivity("Demo Data Loaded and Reconciled");

        // Clear any existing errors
        setErrors({ im: null, cust: null, ch: null });
    };

    // CSV Parser & Validator
    const validateAndParseFile = (file, delimiter, slot) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const lines = text.split('\n');

                if (lines.length === 0) {
                    reject("File is empty");
                    return;
                }

                const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());

                // Validation: Check for TradeID and Amount
                if (!headers.includes('tradeid') || !headers.includes('amount')) {
                    reject("Invalid columns. File must contain TradeID and Amount.");
                    return;
                }

                const data = lines.slice(1).filter(line => line.trim()).map(line => {
                    const values = line.split(delimiter).map(v => v.trim());
                    const obj = {};
                    lines[0].split(delimiter).map(h => h.trim()).forEach((header, index) => {
                        obj[header] = values[index];
                    });
                    // Normalize Amount to number
                    if (obj.Amount) obj.Amount = parseFloat(obj.Amount);
                    return obj;
                });
                resolve(data);
            };
            reader.onerror = () => reject("Error reading file");
            reader.readAsText(file);
        });
    };

    const handleFileChange = async (e, slot) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Check for Duplicate Files
        const isDuplicate = Object.entries(files).some(([key, existingFile]) => {
            return key !== slot && existingFile && existingFile.name === file.name && existingFile.size === file.size;
        });

        if (isDuplicate) {
            setErrors(prev => ({ ...prev, [slot]: "Duplicate file detected." }));
            addToast(`Warning: ${file.name} is already uploaded in another slot.`, 'warning');
            // We allow it but warn, or we could block. Requirement says "show a warning".
        } else {
            // Clear error if not duplicate (validation comes next)
            setErrors(prev => ({ ...prev, [slot]: null }));
        }

        // 2. Validate Content
        try {
            await validateAndParseFile(file, delimiters[slot], slot);
            // If valid:
            setFiles(prev => ({ ...prev, [slot]: file }));
            setErrors(prev => ({ ...prev, [slot]: null }));
            logActivity(`${slot.toUpperCase()} File Uploaded: ${file.name}`);
        } catch (error) {
            // If invalid:
            setErrors(prev => ({ ...prev, [slot]: error }));
            addToast(error, 'error');
            setFiles(prev => ({ ...prev, [slot]: null })); // Clear file from state
            if (fileInputRefs[slot].current) {
                fileInputRefs[slot].current.value = ""; // Clear input
            }
        }
    };

    const handleDelimiterChange = (e, slot) => {
        setDelimiters(prev => ({ ...prev, [slot]: e.target.value }));
        // If a file is already loaded, we might want to re-validate, but for now let's assume user sets delimiter first or re-uploads
    };

    // Reconciliation Logic
    const processReconciliation = (imData, custData, chData) => {
        setLoading(true);
        setTimeout(() => { // Simulate processing delay
            const allTradeIds = new Set([
                ...imData.map(d => d.TradeID),
                ...custData.map(d => d.TradeID),
                ...chData.map(d => d.TradeID)
            ]);

            const breaks = [];
            let matchedCount = 0;
            let orphanCount = 0;
            let mismatchCount = 0;

            allTradeIds.forEach(id => {
                const im = imData.find(d => d.TradeID === id);
                const cust = custData.find(d => d.TradeID === id);
                const ch = chData.find(d => d.TradeID === id);

                const existsInAll = im && cust && ch;

                let status = '';
                let difference = 0;

                if (existsInAll) {
                    if (im.Amount === cust.Amount && cust.Amount === ch.Amount) {
                        status = 'Matched';
                        matchedCount++;
                    } else {
                        status = 'Mismatch';
                        mismatchCount++;
                        // Calculate max difference for simplicity
                        const amounts = [im.Amount, cust.Amount, ch.Amount];
                        const max = Math.max(...amounts);
                        const min = Math.min(...amounts);
                        difference = max - min;
                    }
                } else {
                    status = 'Orphan';
                    orphanCount++;
                }

                if (status !== 'Matched') {
                    breaks.push({
                        TradeID: id,
                        Type: status,
                        IM_Amount: im ? im.Amount : null,
                        Cust_Amount: cust ? cust.Amount : null,
                        CH_Amount: ch ? ch.Amount : null,
                        Difference: difference
                    });
                }
            });

            setResults({
                Summary: {
                    TotalRecords: allTradeIds.size,
                    Matched: matchedCount,
                    MissingOrphans: orphanCount,
                    AmountMismatches: mismatchCount
                },
                Breaks: breaks
            });
            setLoading(false);
            logActivity("Reconciliation Completed");
        }, 800);
    };

    const handleTriggerRecon = async () => {
        if (!files.im || !files.cust || !files.ch) {
            addToast("Please upload all three valid files.", 'error');
            return;
        }

        try {
            const [imData, custData, chData] = await Promise.all([
                validateAndParseFile(files.im, delimiters.im, 'im'),
                validateAndParseFile(files.cust, delimiters.cust, 'cust'),
                validateAndParseFile(files.ch, delimiters.ch, 'ch')
            ]);

            logActivity("Files Parsed Successfully");
            processReconciliation(imData, custData, chData);

        } catch (error) {
            console.error("Error parsing files:", error);
            addToast("Error parsing files during reconciliation.", 'error');
        }
    };

    // Filter Logic
    const filteredBreaks = results?.Breaks.filter(b => {
        const matchesType = filterType === 'All Types' ||
            (filterType === 'Mismatch' && b.Type === 'Mismatch') ||
            (filterType === 'Orphan' && b.Type === 'Orphan');
        const matchesId = b.TradeID.toLowerCase().includes(filterTradeId.toLowerCase());
        return matchesType && matchesId;
    }) || [];

    // Export CSV
    const handleExportCSV = () => {
        if (!results) return;
        const rows = [
            ['TradeID', 'Type', 'IM Amount', 'Cust Amount', 'CH Amount', 'Difference'],
            ...filteredBreaks.map(b => [b.TradeID, b.Type, b.IM_Amount || '', b.Cust_Amount || '', b.CH_Amount || '', b.Difference])
        ];

        let csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reconciliation_breaks.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        logActivity("Breaks CSV Exported");
    };

    const isReconReady = files.im && files.cust && files.ch && !errors.im && !errors.cust && !errors.ch;

    return (
        <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200 relative">
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center p-4 rounded-md shadow-lg text-white ${toast.type === 'error' ? 'bg-red-600' : 'bg-yellow-600'} transition-all duration-300`}
                    >
                        {toast.type === 'error' ? <AlertCircle size={20} className="mr-2" /> : <AlertTriangle size={20} className="mr-2" />}
                        <span className="text-sm font-medium">{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="ml-4 hover:text-gray-200"><X size={16} /></button>
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <Activity className="mr-3 text-blue-600" />
                    3-Way Reconciliation
                </h1>
                <div className="flex space-x-3">
                    <button
                        onClick={loadDemoData}
                        className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                    >
                        Load Demo Data
                    </button>
                    <button
                        onClick={handleTriggerRecon}
                        disabled={loading || !isReconReady}
                        className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center ${loading || !isReconReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Play size={16} className="mr-2" /> {loading ? 'Running...' : 'Trigger Recon'}
                    </button>
                </div>
            </div>

            {/* Upload Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { slot: 'im', label: 'Investment Manager' },
                    { slot: 'cust', label: 'Custodian' },
                    { slot: 'ch', label: 'Clearing House' }
                ].map(({ slot, label }) => (
                    <div
                        key={slot}
                        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border transition-colors ${errors[slot] ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        <h3 className={`font-semibold text-sm mb-4 flex items-center ${errors[slot] ? 'text-red-700 dark:text-red-400' : 'dark:text-gray-200'}`}>
                            <FileText size={16} className={`mr-2 ${errors[slot] ? 'text-red-500' : 'text-gray-400'}`} />
                            {label}
                        </h3>

                        <input
                            type="file"
                            ref={fileInputRefs[slot]}
                            accept=".csv, .txt, text/csv, text/plain"
                            onChange={(e) => handleFileChange(e, slot)}
                            className="block w-full text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 mb-4"
                        />

                        {errors[slot] && (
                            <p className="text-xs text-red-600 dark:text-red-400 mb-3 font-medium flex items-center">
                                <AlertCircle size={12} className="mr-1" /> {errors[slot]}
                            </p>
                        )}

                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Delimiter:</span>
                            <select
                                value={delimiters[slot]}
                                onChange={(e) => handleDelimiterChange(e, slot)}
                                className="p-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                            >
                                <option value=",">Comma (,)</option>
                                <option value="|">Pipe (|)</option>
                                <option value="\t">Tab</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            {/* KPI Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Records</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{results ? results.Summary.TotalRecords : '-'}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Matched</div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{results ? results.Summary.Matched : '-'}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Missing / Orphans</div>
                    <div className="text-3xl font-bold text-orange-500 dark:text-orange-400 mt-2">{results ? results.Summary.MissingOrphans : '-'}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Amount Mismatches</div>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{results ? results.Summary.AmountMismatches : '-'}</div>
                </div>
            </div>

            {/* Breaks Dashboard */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Breaks Dashboard</h2>
                    <div className="flex space-x-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Filter by TradeID"
                                value={filterTradeId}
                                onChange={(e) => setFilterTradeId(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-48"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option>All Types</option>
                            <option>Mismatch</option>
                            <option>Orphan</option>
                        </select>
                        <button
                            onClick={handleExportCSV}
                            disabled={!results}
                            className={`bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium flex items-center ${!results ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Download size={16} className="mr-2" /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3">TradeID</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">IM Amount</th>
                                <th className="px-6 py-3">Cust Amount</th>
                                <th className="px-6 py-3">CH Amount</th>
                                <th className="px-6 py-3">Difference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBreaks.length > 0 ? (
                                filteredBreaks.map((b, i) => (
                                    <tr key={i} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{b.TradeID}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold flex w-fit items-center ${b.Type === 'Mismatch'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                                }`}>
                                                {b.Type === 'Mismatch' ? <AlertTriangle size={12} className="mr-1" /> : <AlertTriangle size={12} className="mr-1" />}
                                                {b.Type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{b.IM_Amount !== null ? b.IM_Amount.toLocaleString() : '-'}</td>
                                        <td className="px-6 py-4">{b.Cust_Amount !== null ? b.Cust_Amount.toLocaleString() : '-'}</td>
                                        <td className="px-6 py-4">{b.CH_Amount !== null ? b.CH_Amount.toLocaleString() : '-'}</td>
                                        <td className={`px-6 py-4 font-bold ${b.Difference !== 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                                            {b.Difference !== 0 ? b.Difference.toLocaleString() : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                                        {results ? 'No breaks found matching filters.' : 'Run reconciliation to see breaks.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Activity Log Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Activity Log</h4>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 h-32 overflow-y-auto text-xs font-mono text-gray-600 dark:text-gray-300">
                    {activityLog.length > 0 ? (
                        activityLog.map((log, i) => <div key={i} className="mb-1">{log}</div>)
                    ) : (
                        <span className="text-gray-400 italic">No activity yet.</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reconciliation;
