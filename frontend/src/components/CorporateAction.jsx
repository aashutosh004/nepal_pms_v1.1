import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, CheckCircle } from 'lucide-react';

const CorporateAction = () => {
    const location = useLocation();
    const isVoluntary = location.pathname.includes('voluntary') && !location.pathname.includes('non-voluntary');
    const type = isVoluntary ? 'Voluntary' : 'Non-Voluntary';

    const [assetClass, setAssetClass] = useState('Equity');
    const [eventType, setEventType] = useState('');
    const [recordDate, setRecordDate] = useState('');
    const [paymentDate, setPaymentDate] = useState('');

    // Reset event type when asset class changes
    useEffect(() => {
        setEventType('');
    }, [assetClass]);

    const eventOptions = assetClass === 'Equity'
        ? ['Dividend Payout']
        : ['Coupon Payout'];

    const handleSubmit = () => {
        if (!eventType || !recordDate || !paymentDate) {
            alert("Please fill all fields.");
            return;
        }
        alert(`Corporate Action Triggered!\nType: ${type}\nAsset: ${assetClass}\nEvent: ${eventType}\nRecord Date: ${recordDate}\nPayment Date: ${paymentDate}`);
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Corporate Action</h1>
            </div>

            {/* Context Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Corporate Action Context</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    You are currently viewing <strong>{type}</strong> corporate actions.
                    Choose whether the action is voluntary or non-voluntary from the sidebar.
                </p>
            </div>

            {/* Details Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Corporate Action Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Asset Class */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Asset Class</label>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setAssetClass('Equity')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${assetClass === 'Equity'
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800'
                                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                    }`}
                            >
                                Equity
                            </button>
                            <button
                                onClick={() => setAssetClass('Bond')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${assetClass === 'Bond'
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800'
                                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                    }`}
                            >
                                Bond
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Pick the class to auto-adjust allowed events.</p>
                    </div>

                    {/* Event Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Event Type</label>
                        <select
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                        >
                            <option value="">Select event</option>
                            {eventOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Equity → Dividend Payout • Bond → Coupon Payout</p>
                    </div>

                    {/* Record Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Record Date (placeholder)</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={recordDate}
                                onChange={(e) => setRecordDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Payment Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Payment Date (placeholder)</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Trigger Button */}
                <div className="mt-8">
                    <button
                        onClick={handleSubmit}
                        className="w-full flex justify-center items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                    >
                        Trigger Corporate Action
                    </button>
                </div>
            </div>

            {/* Wireframe Notes */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">How it Works (Wireframe Notes)</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Use the left navigation to pick <strong>Voluntary</strong> or <strong>Non-Voluntary</strong>.</li>
                    <li>Select <strong>Equity</strong> or <strong>Bond</strong> under Asset Class.</li>
                    <li>The <strong>Event Type</strong> list will restrict to Dividend (Equity) or Coupon (Bond).</li>
                    <li>Click <strong>Trigger Corporate Action</strong> to see a confirmation message.</li>
                </ul>
            </div>
        </div>
    );
};

export default CorporateAction;
