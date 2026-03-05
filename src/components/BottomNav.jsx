import { Home, ShoppingBag, Stethoscope, Users } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const BottomNav = ({ activeTab, setActiveTab }) => {
    const { t } = useTranslation();

    const tabs = [
        { id: 'Home', label: t('Home'), icon: Home },
        { id: 'Market', label: t('Market'), icon: ShoppingBag },
        { id: 'AIDoctor', label: t('AI Doctor'), icon: Stethoscope },
        { id: 'Community', label: t('Community'), icon: Users },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg px-6 py-2 pb-safe">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center justify-center space-y-1 p-2 transition-all duration-200
                ${isActive ? 'text-earth-600 scale-110' : 'text-slate-400 hover:text-earth-500'}`}
                        >
                            <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
