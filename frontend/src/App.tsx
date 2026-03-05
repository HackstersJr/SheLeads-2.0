/**
 * App.tsx — Gram-Drishti PWA Shell
 */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, LayoutGrid, Bell, CloudRain, Bug, Sprout } from 'lucide-react'

import VoiceHome from './pages/VoiceHome'
import DashboardScreen from './pages/DashboardScreen'
import FarmDetailModal, { FARMS, type Farm } from './components/FarmDetailModal'

type Tab = 'voice' | 'fields' | 'alerts'

export interface UIAction {
  action: 'navigate' | 'show_farm' | 'show_image' | 'show_soil' | 'switch_language'
  target: string
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'voice', label: 'Voice', icon: <Mic size={20} /> },
  { id: 'fields', label: 'Fields', icon: <LayoutGrid size={20} /> },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={20} /> },
]
const tabAccent: Record<Tab, string> = {
  voice: 'text-amber-400', fields: 'text-green-400', alerts: 'text-red-400',
}
const tabIndicator: Record<Tab, string> = {
  voice: 'bg-amber-400', fields: 'bg-green-400', alerts: 'bg-red-400',
}

const actionAlerts = [
  { icon: <CloudRain size={28} className="text-white" />, bg: 'bg-blue-500', title: 'Water Cotton Field', body: 'The soil is very dry. Please water it today to save the crop.', action: 'Show on Map', time: '2 hours ago' },
  { icon: <Bug size={28} className="text-white" />, bg: 'bg-red-500', title: 'Pests in Wheat', body: 'Drone saw small bugs in the North corner. Spray pesticide soon.', action: 'Call Expert', time: '5 hours ago' },
  { icon: <Sprout size={28} className="text-white" />, bg: 'bg-green-600', title: 'Rice is Healthy!', body: 'Good job! The rice field is growing perfectly. No action needed.', action: 'Dismiss', time: 'Yesterday' },
]

function AlertsScreen({ onAskAI }: { onAskAI: (context: string) => void }) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#110a0a] to-[#0e0e0e] overflow-y-auto">
      <div className="px-5 pt-8 pb-6">
        <h1 className="text-white text-2xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>Kisan Actions</h1>
        <p className="text-white/50 text-sm mt-1">What to do today</p>
      </div>
      <div className="px-5 flex flex-col gap-4 pb-24">
        {actionAlerts.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
            <div className={`p-4 ${a.bg} flex items-center gap-3`}>{a.icon}<h2 className="text-white text-lg font-bold">{a.title}</h2></div>
            <div className="p-4">
              <p className="text-white/80 text-[15px] leading-relaxed mb-4">{a.body}</p>
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-xs">{a.time}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => onAskAI(a.title)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-amber-400"><Mic size={18} /></button>
                  <button className={`px-4 py-2 rounded-full text-sm font-semibold ${a.bg === 'bg-green-600' ? 'bg-white/10 text-white/50' : 'bg-white text-black'}`}>{a.action}</button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('voice')
  const [voiceContext, setVoiceContext] = useState('')
  const [langCode, setLangCode] = useState('hi-IN')
  const [modalFarm, setModalFarm] = useState<Farm | null>(null)
  const [modalShowImage, setModalShowImage] = useState(false)
  const [modalShowSoil, setModalShowSoil] = useState(false)
  const [autoListen, setAutoListen] = useState(false)

  const handleAskAI = (context: string) => { setVoiceContext(context); setActiveTab('voice') }

  const handleVoiceAction = (action: UIAction) => {
    setTimeout(() => {
      if (action.action === 'navigate') {
        const tab = action.target as Tab
        if (['voice', 'fields', 'alerts'].includes(tab)) setActiveTab(tab)
      } else if (action.action === 'show_farm') {
        const farm = FARMS.find(f => f.id === action.target) ?? FARMS[0]
        setModalFarm(farm); setModalShowImage(false); setModalShowSoil(false)
      } else if (action.action === 'show_image') {
        const farm = action.target === 'latest' ? FARMS[0] : (FARMS.find(f => f.id === action.target) ?? FARMS[0])
        setModalFarm(farm); setModalShowImage(true); setModalShowSoil(false)
      } else if (action.action === 'show_soil') {
        const farm = FARMS.find(f => f.id === action.target) ?? FARMS[0]
        setModalFarm(farm); setModalShowImage(false); setModalShowSoil(true)
      } else if (action.action === 'switch_language') {
        // Instantly switch the app language — next voice turn uses the new lang
        setLangCode(action.target)
      }
    }, 800)
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'voice': return (
        <VoiceHome
          initialContext={voiceContext}
          onClearContext={() => setVoiceContext('')}
          onVoiceAction={handleVoiceAction}
          autoListen={autoListen}
          onAutoListenConsumed={() => setAutoListen(false)}
          langCode={langCode}
          onLangChange={setLangCode}
        />
      )
      case 'fields': return <DashboardScreen onAskAI={handleAskAI} />
      case 'alerts': return <AlertsScreen onAskAI={handleAskAI} />
    }
  }

  return (
    <div className="relative flex flex-col w-full max-w-md mx-auto h-dvh bg-[#0e0e0e] overflow-hidden select-none">
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="absolute inset-0">
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Mic FAB — always accessible from Fields & Alerts */}
      <AnimatePresence>
        {activeTab !== 'voice' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 300 }}
            onClick={() => { setAutoListen(true); setActiveTab('voice') }}
            className="absolute right-5 z-30 w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center"
            style={{ bottom: '72px', boxShadow: '0 0 24px 8px rgba(245,158,11,0.4)' }}
          >
            <Mic size={24} className="text-black" />
          </motion.button>
        )}
      </AnimatePresence>

      <nav className="relative z-20 tab-bar border-t border-white/8 bg-black/60 backdrop-blur-xl">
        <div className="flex items-center">
          {tabs.map(tab => {
            const active = tab.id === activeTab
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex-1 flex flex-col items-center gap-1 py-3 relative">
                <span className={`transition-colors duration-200 ${active ? tabAccent[tab.id] : 'text-white/30'}`}>{tab.icon}</span>
                <span className={`text-[10px] font-medium transition-colors duration-200 ${active ? tabAccent[tab.id] : 'text-white/25'}`}>{tab.label}</span>
                {active && <motion.div layoutId="tab-indicator" className={`absolute bottom-0 h-0.5 w-8 rounded-full ${tabIndicator[tab.id]}`} />}
              </button>
            )
          })}
        </div>
      </nav>

      <AnimatePresence>
        {modalFarm && <FarmDetailModal farm={modalFarm} showImage={modalShowImage} showSoil={modalShowSoil} onClose={() => setModalFarm(null)} onAskAI={handleAskAI} />}
      </AnimatePresence>
    </div>
  )
}
