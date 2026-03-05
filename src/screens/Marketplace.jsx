import { useState } from 'react';
import { TrendingUp, TrendingDown, MapPin, Search } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const crops = [
    { id: 1, name: 'Wheat (Sharbati)', location: 'Indore Mandi', price: 2850, change: 45, trend: 'up', unit: 'Quintal' },
    { id: 2, name: 'Soybean (Yellow)', location: 'Ujjain Mandi', price: 4600, change: -120, trend: 'down', unit: 'Quintal' },
    { id: 3, name: 'Cotton (BT)', location: 'Khandwa Mandi', price: 7100, change: 200, trend: 'up', unit: 'Quintal' },
    { id: 4, name: 'Gram (Desi)', location: 'Sehore Mandi', price: 5400, change: 10, trend: 'up', unit: 'Quintal' },
    { id: 5, name: 'Mustard', location: 'Morena Mandi', price: 5100, change: -50, trend: 'down', unit: 'Quintal' },
];

const Marketplace = () => {
    const [showMandiOnly, setShowMandiOnly] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();

    const filteredCrops = crops.filter(crop =>
        t(crop.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        t(crop.location).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-5 pb-24 max-w-md mx-auto">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t('Market Prices')}</h2>
                    <p className="text-slate-500 text-sm mt-1">{t('Live rates from your nearby mandis')}</p>
                </div>
            </div>

            <div className="relative mb-5">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder={t('Search crop or mandi...')}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-earth-500 focus:border-transparent text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex items-center justify-between mb-5 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                <button
                    onClick={() => setShowMandiOnly(true)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${showMandiOnly ? 'bg-earth-100 text-earth-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    {t('Govt. Mandi')}
                </button>
                <button
                    onClick={() => setShowMandiOnly(false)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${!showMandiOnly ? 'bg-earth-100 text-earth-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    {t('Private Buyers')}
                </button>
            </div>

            <div className="space-y-4">
                {filteredCrops.map(crop => (
                    <div key={crop.id} className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col hover:border-earth-200 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-slate-800">{t(crop.name)}</h3>
                                <p className="text-xs text-slate-500 flex items-center mt-1">
                                    <MapPin size={12} className="mr-1" /> {t(crop.location)}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-lg text-slate-900">₹{crop.price}</div>
                                <div className={`text-xs font-semibold flex items-center justify-end mt-0.5 ${crop.trend === 'up' ? 'text-leaf-600' : 'text-red-500'}`}>
                                    {crop.trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                                    {Math.abs(crop.change)}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-50">
                            <button className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2 rounded-xl text-sm hover:bg-slate-200 transition">
                                {t('Sell')}
                            </button>
                            <button className="flex-1 bg-earth-600 text-white font-semibold py-2 rounded-xl text-sm hover:bg-earth-700 transition">
                                {t('Buy')}
                            </button>
                        </div>
                    </div>
                ))}

                {filteredCrops.length === 0 && (
                    <div className="text-center py-10 text-slate-500 text-sm">
                        {t('No crops found matching your search.')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;
