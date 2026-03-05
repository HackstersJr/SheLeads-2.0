/**
 * DashboardScreen.tsx — Simple crop photo card grid
 *
 * Shows 3 field cards with aerial crop photos.
 * Tapping a card expands it fullscreen with the photo as background
 * and shows simple key stats as a bottom sheet overlay.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, CheckCircle, Droplets, Leaf, ChevronRight, Mic } from 'lucide-react'

interface Field {
    id: string
    name: string
    crop: string
    area: string
    photo: string
    health: 'good' | 'warning' | 'critical'
    moisture: string
    ph: string
    nitrogen: string
    advice: string
}

const FIELDS: Field[] = [
    {
        id: 'A',
        name: 'Field A',
        crop: 'Wheat',
        area: '4.2 acres',
        photo: '/field_wheat.png',
        health: 'good',
        moisture: '68%',
        ph: '6.8',
        nitrogen: '142 kg/ha',
        advice: 'Crop looks healthy. No action needed this week.',
    },
    {
        id: 'B',
        name: 'Field B',
        crop: 'Rice',
        area: '2.8 acres',
        photo: '/field_rice.png',
        health: 'warning',
        moisture: '28%',
        ph: '7.1',
        nitrogen: '38 kg/ha',
        advice: 'Low moisture — irrigate by Thursday. Phosphorus is low; apply DAP 3 kg/acre.',
    },
    {
        id: 'C',
        name: 'Field C',
        crop: 'Cotton',
        area: '6.0 acres',
        photo: '/field_cotton.png',
        health: 'critical',
        moisture: '22%',
        ph: '5.9',
        nitrogen: '19 kg/ha',
        advice: 'Critical: Very low moisture and nitrogen. Irrigate immediately and apply 5 kg urea/acre.',
    },
]

const healthColor = {
    good: { dot: 'bg-green-400', text: 'text-green-400', badge: 'bg-green-400/15 text-green-300 border-green-400/25', icon: <CheckCircle size={13} /> },
    warning: { dot: 'bg-amber-400', text: 'text-amber-400', badge: 'bg-amber-400/15 text-amber-300 border-amber-400/25', icon: <AlertTriangle size={13} /> },
    critical: { dot: 'bg-red-400', text: 'text-red-400', badge: 'bg-red-400/15 text-red-300 border-red-400/25', icon: <AlertTriangle size={13} /> },
}
const healthLabel = { good: 'Healthy', warning: 'Watch', critical: 'Alert' }

interface StatRowProps { label: string; value: string; icon: React.ReactNode }
function StatRow({ label, value, icon }: StatRowProps) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-white/8">
            <div className="flex items-center gap-2 text-white/50">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <span className="text-white font-semibold text-sm">{value}</span>
        </div>
    )
}

interface DashboardScreenProps {
    onAskAI: (context: string) => void
}

export default function DashboardScreen({ onAskAI }: DashboardScreenProps) {
    const [selected, setSelected] = useState<Field | null>(null)

    return (
        <div className="flex flex-col h-full bg-[#0a0f0d] overflow-y-auto">
            {/* Header */}
            <div className="px-5 pt-6 pb-4 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs font-medium">Bellary Village · Live</span>
                </div>
                <h1 className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    My Fields
                </h1>
                <p className="text-white/35 text-xs mt-0.5">Tap a field to see details</p>
            </div>

            {/* Field photo cards */}
            <div className="px-5 flex flex-col gap-4 pb-8">
                {FIELDS.map((field, i) => {
                    const hc = healthColor[field.health]
                    return (
                        <motion.button
                            key={field.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            onClick={() => setSelected(field)}
                            className="relative w-full rounded-2xl overflow-hidden text-left"
                            style={{ aspectRatio: '16/9' }}
                        >
                            {/* Crop photo */}
                            <img
                                src={field.photo}
                                alt={field.crop}
                                className="w-full h-full object-cover"
                            />

                            {/* Dark gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Health badge top-right */}
                            <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full border backdrop-blur-sm text-[11px] font-semibold ${hc.badge}`}>
                                {hc.icon}
                                {healthLabel[field.health]}
                            </div>

                            {/* Field info bottom */}
                            <div className="absolute bottom-0 inset-x-0 p-4">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-white font-bold text-lg leading-tight">{field.name}</p>
                                        <p className="text-white/60 text-sm">{field.crop} · {field.area}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-white/40">
                                        <span className="text-xs">Details</span>
                                        <ChevronRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    )
                })}
            </div>

            {/* ── Full-screen field detail overlay ── */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col"
                    >
                        {/* Full bleed photo background */}
                        <img
                            src={selected.photo}
                            alt={selected.crop}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/90" />

                        {/* Close button */}
                        <div className="relative z-10 flex justify-end p-5 pt-7">
                            <button
                                onClick={() => setSelected(null)}
                                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Spacer pushes sheet to bottom */}
                        <div className="flex-1" />

                        {/* Bottom sheet */}
                        <motion.div
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 26 }}
                            className="relative z-10 bg-black/70 backdrop-blur-2xl rounded-t-3xl px-6 pt-5 pb-10"
                        >
                            {/* Pull handle */}
                            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

                            {/* Field title */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <Leaf size={14} className="text-green-400" />
                                        <span className="text-green-400 text-xs font-medium">{selected.crop}</span>
                                    </div>
                                    <h2 className="text-white text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                                        {selected.name}
                                    </h2>
                                    <p className="text-white/40 text-xs">{selected.area}</p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${healthColor[selected.health].badge}`}>
                                    {healthColor[selected.health].icon}
                                    <span className="text-xs font-semibold">{healthLabel[selected.health]}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mb-4">
                                <StatRow label="Soil Moisture" value={selected.moisture} icon={<Droplets size={14} />} />
                                <StatRow label="Soil pH" value={selected.ph} icon={<Leaf size={14} />} />
                                <StatRow label="Nitrogen" value={selected.nitrogen} icon={<AlertTriangle size={14} />} />
                            </div>

                            {/* AI advice */}
                            <div className="bg-white/8 rounded-xl p-3.5 mb-4">
                                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-1">Kisan Mitra Advice</p>
                                <p className="text-white/80 text-sm leading-relaxed">{selected.advice}</p>
                            </div>

                            {/* Ask AI Context Button */}
                            <button
                                onClick={() => onAskAI(`Field: ${selected.name} (${selected.crop})`)}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500/20 text-amber-400 font-semibold active:scale-95 transition-transform"
                            >
                                <Mic size={18} />
                                <span>Talk to Kisan Mitra about this field</span>
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
