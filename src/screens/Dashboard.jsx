import { CloudRain, Sun, Activity, Droplets, ArrowRight } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const CircularProgress = ({ value, color, icon: Icon }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg className="transform -rotate-90 w-24 h-24">
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100"
                />
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={`${color} transition-all duration-1000 ease-out`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-slate-700">
                <Icon size={20} className={`mb-1 ${color.replace('text-', 'text-')}`} />
                <span className="text-sm font-bold">{value}%</span>
            </div>
        </div>
    );
};

const Dashboard = ({ setActiveTab }) => {
    const { t } = useTranslation();

    return (
        <div className="p-5 space-y-6 pb-20">
            {/* Greeting Section */}
            <section className="animate-fade-in">
                <h2 className="text-sm text-slate-500 font-medium">{t('नमस्ते,')}</h2>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">Kishan Kumar</h1>
                <p className="text-xs text-earth-600 mt-1 flex items-center font-medium">
                    <Sun size={14} className="mr-1" /> {t('Sunny')}, 32°C • {t('Maharashtra')}
                </p>
            </section>

            {/* Quick Action Grid */}
            <section className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setActiveTab('AIDoctor')}
                    className="bg-gradient-to-br from-earth-50 to-earth-100 border border-earth-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left flex flex-col justify-between h-28"
                >
                    <div className="bg-white p-2 w-fit rounded-full text-earth-600 shadow-sm">
                        <Activity size={20} />
                    </div>
                    <span className="font-semibold text-slate-800 text-sm mt-3">{t('Crop Doctor')}</span>
                </button>

                <button
                    onClick={() => setActiveTab('Market')}
                    className="bg-gradient-to-br from-leaf-50 to-leaf-100 border border-leaf-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left flex flex-col justify-between h-28"
                >
                    <div className="bg-white p-2 w-fit rounded-full text-leaf-600 shadow-sm">
                        <ArrowRight size={20} />
                    </div>
                    <span className="font-semibold text-slate-800 text-sm mt-3">{t('Market Prices')}</span>
                </button>
            </section>

            {/* Crop Health Card */}
            <section className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 bg-leaf-50 w-32 h-32 rounded-full opacity-50 blur-2xl"></div>
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{t('Overall Health')}</h3>
                        <p className="text-xs text-slate-500 mb-4 max-w-[140px]">{t('Your wheat crop layout is looking excellent today.')}</p>
                        <span className="inline-block bg-leaf-100 text-leaf-700 text-xs font-semibold px-2 py-1 rounded-lg">{t('Optimal')}</span>
                    </div>
                    <CircularProgress value={85} color="text-leaf-500" icon={Activity} />
                </div>
            </section>

            {/* Smart Irrigation Widget */}
            <section className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -left-10 -bottom-10 bg-blue-500 w-32 h-32 rounded-full opacity-20 blur-2xl"></div>
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <Droplets size={18} className="text-blue-400" />
                            <h3 className="font-semibold text-sm">{t('Soil Moisture')}</h3>
                        </div>
                        <div className="text-3xl font-bold mb-1">35<span className="text-lg text-slate-400">%</span></div>
                        <p className="text-xs text-slate-400">{t('Critical level reached')}</p>
                    </div>
                    <div className="text-right">
                        <div className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-3 py-1.5 rounded-full inline-flex flex-col items-center justify-center animate-pulse">
                            {t('Watering Needed')}
                        </div>
                    </div>
                </div>

                <div className="mt-5 bg-slate-800/50 rounded-xl p-3 flex border border-slate-700/50 items-center justify-between relative z-10">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                            <CloudRain size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-medium">{t('Forecast')}</p>
                            <p className="text-[10px] text-slate-400">{t('No rain for next 3 days')}</p>
                        </div>
                    </div>
                    <button className="text-xs bg-white text-slate-900 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                        {t('Start Pump')}
                    </button>
                </div>
            </section>

        </div>
    );
};

export default Dashboard;
