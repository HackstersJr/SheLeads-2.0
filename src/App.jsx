import { useState } from 'react';
import { Users, Globe } from 'lucide-react';
import { useTranslation } from './context/LanguageContext';
import BottomNav from './components/BottomNav';
import VoiceAssistant from './components/VoiceAssistant';
import Dashboard from './screens/Dashboard';
import AIDoctor from './screens/AIDoctor';
import Marketplace from './screens/Marketplace';

function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const { t, language, toggleLanguage } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl flex flex-col">
        {/* Header/App Bar */}
        <header className="bg-earth-600 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wide">{t('Gram-Drishti')}</h1>
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1 bg-earth-700/50 hover:bg-earth-800/50 px-3 py-1.5 rounded-full transition text-sm font-medium"
          >
            <Globe size={16} />
            <span className="uppercase">{language}</span>
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
          {activeTab === 'Home' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'Market' && <Marketplace />}
          {activeTab === 'AIDoctor' && <AIDoctor />}
          {activeTab === 'Community' && (
            <div className="p-5 flex flex-col items-center justify-center h-full text-center mt-20">
              <div className="bg-earth-100 p-4 rounded-full text-earth-600 mb-4">
                <Users size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{t('Community')}</h2>
              <p className="text-slate-500 text-sm mt-2 max-w-[250px]">
                {t('Connect with other farmers, share your knowledge, and ask for help.')}
              </p>
              <button className="mt-6 bg-earth-600 text-white px-6 py-2 rounded-full font-medium text-sm">
                {t('Join Discussion')}
              </button>
            </div>
          )}
        </main>

        <VoiceAssistant />
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
