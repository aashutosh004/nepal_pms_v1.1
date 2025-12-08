import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Upload, X, Check, Search, Save, Trash2, Edit2, AlertCircle, FileSpreadsheet, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

const HolidayMaster = () => {
    // Mock Data
    const [holidays, setHolidays] = useState([
        { id: 1, calendarDate: '2025-01-01', dayOfWeek: 'Wednesday', dayNumberOfWeek: 3, weekNumber: 1, month: 'January', monthNumber: 1, quarter: 'Q1', year: 2025, isWeekend: false, isHoliday: true, holidayDescription: 'New Year Day', isTradingDay: false },
        { id: 2, calendarDate: '2025-01-04', dayOfWeek: 'Saturday', dayNumberOfWeek: 6, weekNumber: 1, month: 'January', monthNumber: 1, quarter: 'Q1', year: 2025, isWeekend: true, isHoliday: false, holidayDescription: '', isTradingDay: false },
    ]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [fileUploadError, setFileUploadError] = useState('');

    const initialFormState = {
        calendarDate: '',
        dayOfWeek: '',
        dayNumberOfWeek: '',
        weekNumber: '',
        month: '',
        monthNumber: '',
        quarter: '',
        year: '',
        isWeekend: false,
        isHoliday: false,
        holidayDescription: '',
        isTradingDay: true
    };

    const [formData, setFormData] = useState(initialFormState);

    // --- Date Calculation Logic ---

    const getWeekNumber = (d) => {
        // Copy date so don't modify original
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        // Get first day of year
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        // Calculate full weeks to nearest Thursday
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    };

    const calculateDateFields = (dateString, currentIsHoliday = false) => {
        if (!dateString) return initialFormState;

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return initialFormState;

        const dayIndex = date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
        const dayNumberOfWeek = dayIndex === 0 ? 7 : dayIndex; // 1 = Mon ... 7 = Sun
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const monthNumber = date.getMonth() + 1;
        const year = date.getFullYear();
        const quarter = `Q${Math.ceil(monthNumber / 3)}`;
        const weekNumber = getWeekNumber(date);
        const isWeekend = dayIndex === 0 || dayIndex === 6;

        // Trading Day Logic
        // Default False if Weekend OR Holiday
        // Otherwise Default True
        // Note: User can manually toggle it later, but calculations enforce defaults on change
        const isTradingDay = !(isWeekend || currentIsHoliday);

        return {
            calendarDate: dateString,
            dayOfWeek,
            dayNumberOfWeek,
            weekNumber,
            month,
            monthNumber,
            quarter,
            year,
            isWeekend,
            isTradingDay
        };
    };

    const handleDateChange = (e) => {
        const dateStr = e.target.value;
        const calculations = calculateDateFields(dateStr, formData.isHoliday);
        setFormData(prev => ({
            ...prev,
            ...calculations
        }));
    };

    const handleHolidayToggle = (e) => {
        const isHoliday = e.target.checked;
        // Recalculate trading day based on new holiday status
        const isTradingDay = !(formData.isWeekend || isHoliday);

        setFormData(prev => ({
            ...prev,
            isHoliday,
            isTradingDay,
            holidayDescription: isHoliday ? prev.holidayDescription : '' // Clear desc if not holiday
        }));
    };

    const handleTradingDayToggle = (e) => {
        setFormData(prev => ({ ...prev, isTradingDay: e.target.checked }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Final Validation just in case
        if (formData.isHoliday && !formData.holidayDescription.trim()) {
            alert("Description is required for holidays.");
            return;
        }

        if (editingId) {
            setHolidays(prev => prev.map(h => h.id === editingId ? { ...h, ...formData, id: h.id } : h));
        } else {
            setHolidays(prev => [...prev, { ...formData, id: Date.now() }]);
        }
        resetForm();
    };

    const handleEdit = (holiday) => {
        setFormData(holiday);
        setEditingId(holiday.id);
        setIsFormOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure?')) {
            setHolidays(prev => prev.filter(h => h.id !== id));
        }
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
                'CalendarDate', 'DayOfWeek', 'DayNumberOfWeek', 'WeekNumber',
                'Month', 'MonthNumber', 'Quarter', 'Year',
                'IsWeekend', 'IsHoliday', 'HolidayDescription', 'IsTradingDay'
            ];

            const fileColumns = Object.keys(data[0]);
            const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));

            if (missingColumns.length > 0) {
                alert(`Error: Missing columns - ${missingColumns.join(', ')}`);
                setFileUploadError(`Missing columns: ${missingColumns.join(', ')}`);
                return;
            }

            // Parse Data
            const newHolidays = data.map((row, idx) => ({
                id: Date.now() + idx,
                calendarDate: row['CalendarDate'],
                dayOfWeek: row['DayOfWeek'],
                dayNumberOfWeek: parseInt(row['DayNumberOfWeek']),
                weekNumber: parseInt(row['WeekNumber']),
                month: row['Month'],
                monthNumber: parseInt(row['MonthNumber']),
                quarter: row['Quarter'],
                year: parseInt(row['Year']),
                isWeekend: row['IsWeekend'] === true || row['IsWeekend'] === 'TRUE' || row['IsWeekend'] === 1,
                isHoliday: row['IsHoliday'] === true || row['IsHoliday'] === 'TRUE' || row['IsHoliday'] === 1,
                holidayDescription: row['HolidayDescription'] || '',
                isTradingDay: row['IsTradingDay'] === true || row['IsTradingDay'] === 'TRUE' || row['IsTradingDay'] === 1,
            }));

            setHolidays(prev => [...prev, ...newHolidays]);
            setFileUploadError('');
            alert(`Imported ${newHolidays.length} records successfully.`);
            e.target.value = null;
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Holiday Master</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage calendar, holidays, and trading days</p>
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
                        Add Date
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
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Day</th>
                                <th className="px-6 py-4">Wk #</th>
                                <th className="px-6 py-4">Month</th>
                                <th className="px-6 py-4">Qtr</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Trading?</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {holidays.map((h) => (
                                <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{h.calendarDate}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{h.dayOfWeek}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{h.weekNumber}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{h.month}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{h.quarter}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col gap-1 items-center">
                                            {h.isWeekend && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Weekend</span>}
                                            {h.isHoliday && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Holiday</span>}
                                            {!h.isWeekend && !h.isHoliday && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Working</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {h.isTradingDay
                                            ? <Check size={18} className="text-green-500 mx-auto" />
                                            : <X size={18} className="text-gray-300 mx-auto" />
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                                        {h.holidayDescription || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEdit(h)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(h.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {isFormOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingId ? 'Edit Date Details' : 'Add New Date'}
                            </h3>
                            <button onClick={resetForm}><X size={24} className="text-gray-500 hover:text-gray-700" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">

                            {/* Row 1: Primary Date Input */}
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-sm font-bold text-gray-900 dark:text-white">Calendar Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    name="calendarDate"
                                    value={formData.calendarDate}
                                    onChange={handleDateChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* Auto-Calculated Fields (Read-Only) */}
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Day of Week</label>
                                <input type="text" value={formData.dayOfWeek} readOnly className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Wk # (ISO)</label>
                                <input type="text" value={formData.weekNumber} readOnly className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Quarter</label>
                                <input type="text" value={formData.quarter} readOnly className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                            </div>

                            {/* Row 2: More Auto-calc */}
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Month</label>
                                <input type="text" value={formData.month} readOnly className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Year</label>
                                <input type="text" value={formData.year} readOnly className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Is Weekend?</label>
                                <input type="text" value={formData.isWeekend ? 'Yes' : 'No'} readOnly className={`w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 font-bold cursor-not-allowed ${formData.isWeekend ? 'text-red-500' : 'text-green-600'}`} />
                            </div>
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Day #</label>
                                <input type="text" value={formData.dayNumberOfWeek} readOnly className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                            </div>


                            {/* Row 3: Toggles & Description */}
                            <div className="md:col-span-4 border-t border-gray-100 dark:border-gray-700 pt-6 mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Is Holiday Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">Is Holiday?</div>
                                        <div className="text-xs text-gray-500">Enable if this date is a public holiday</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={formData.isHoliday} onChange={handleHolidayToggle} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>

                                {/* Is Trading Day Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">Is Trading Day?</div>
                                        <div className="text-xs text-gray-500">Exchange open for trading</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={formData.isTradingDay} onChange={handleTradingDayToggle} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>

                                {/* Holiday Description (Conditional) */}
                                {formData.isHoliday && (
                                    <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Holiday Description <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="holidayDescription"
                                            value={formData.holidayDescription}
                                            onChange={handleInputChange}
                                            maxLength={50}
                                            placeholder="e.g. Christmas Day"
                                            className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <div className="text-xs text-right text-gray-400 mt-1">{formData.holidayDescription.length}/50</div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-4 pt-4 flex gap-3 border-t border-gray-100 dark:border-gray-700">
                                <button type="button" onClick={resetForm} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]">
                                    {editingId ? 'Update Date' : 'Save Date'}
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

export default HolidayMaster;
