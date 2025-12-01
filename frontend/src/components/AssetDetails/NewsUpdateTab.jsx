import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink, RefreshCw } from 'lucide-react';

const NewsUpdateTab = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStock, setSelectedStock] = useState('General Market News');

    const stockOptions = [
        'General Market News',
        'NABIL',
        'GBIME',
        'NICA',
        'HIDCL',
        'API'
    ];

    const fetchNews = async (symbol) => {
        setLoading(true);
        try {
            const querySymbol = symbol === 'General Market News' ? '' : symbol;
            const response = await axios.get(`http://localhost:8000/api/news?symbol=${querySymbol}`);
            setNews(response.data);
        } catch (error) {
            console.error("Error fetching news:", error);
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews(selectedStock);
    }, [selectedStock]);

    return (
        <div className="space-y-6">
            {/* Header Control */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-800">Latest Market Updates</h3>
                <div className="flex items-center space-x-4">
                    <select
                        value={selectedStock}
                        onChange={(e) => setSelectedStock(e.target.value)}
                        className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white min-w-[200px]"
                    >
                        {stockOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => fetchNews(selectedStock)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <RefreshCw size={24} className="animate-spin mb-2" />
                        <span className="text-sm">Fetching live updates...</span>
                    </div>
                ) : news.length > 0 ? (
                    news.map((item, index) => (
                        <div key={index} className="flex flex-col p-4 bg-white hover:bg-gray-50 rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 font-semibold text-base hover:underline flex items-start gap-2 leading-tight"
                            >
                                {item.title}
                                <ExternalLink size={14} className="mt-1 flex-shrink-0 opacity-50" />
                            </a>
                            <div className="flex items-center mt-2 space-x-2">
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.date}</span>
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-gray-400">{item.source}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        No news found for {selectedStock}.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsUpdateTab;
