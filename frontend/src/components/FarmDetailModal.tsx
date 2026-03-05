/**
 * FarmDetailModal.tsx — Slide-up sheet showing farm details, soil stats, and latest drone image
 */
import { motion, AnimatePresence } from 'framer-motion'
import { X, Droplets, FlaskConical, Sprout, Image, AlertTriangle, CheckCircle } from 'lucide-react'

export interface Farm {
    id: string
    name: string
    crop: string
    area: string
    ph: number
    moisture: number
    status: string
    statusType: 'warning' | 'healthy' | 'critical'
    imageUrl?: string
    lastScan?: string
}

export const FARMS: Farm[] = [
    {
        id: 'farm_a',
        name: 'Farm A – Cotton',
        crop: 'Cotton',
        area: '2.5 acres',
        ph: 6.8,
        moisture: 42,
        status: 'Needs water urgently',
        statusType: 'warning',
        lastScan: 'Today, 7:30 AM',
    },
    {
        id: 'farm_b',
        name: 'Farm B – Wheat',
        crop: 'Wheat',
        area: '1.8 acres',
        ph: 7.1,
        moisture: 68,
        status: 'Healthy',
        statusType: 'healthy',
        lastScan: 'Yesterday, 6:00 PM',
    },
    {
        id: 'farm_c',
        name: 'Farm C – Rice',
        crop: 'Rice',
        area: '3.0 acres',
        ph: 6.5,
        moisture: 80,
        status: 'Ready to harvest in ~2 weeks',
        statusType: 'healthy',
        lastScan: '2 days ago',
    },
]

interface Props {
    farm: Farm | null
    showImage?: boolean
    showSoil?: boolean
    onClose: () => void
    onAskAI?: (context: string) => void
}

export default function FarmDetailModal({ farm, showImage = false, showSoil = false, onClose, onAskAI }: Props) {
    if (!farm) return null

    const farmContext = `Farm: ${farm.name} | Crop: ${farm.crop} | Area: ${farm.area} | Soil pH: ${farm.ph} | Moisture: ${farm.moisture}% | Status: ${farm.status} | Last drone scan: ${farm.lastScan}`

    const statusIcon = farm.statusType === 'healthy'
        ? <CheckCircle size={16} className="text-green-400" />
        : <AlertTriangle size={16} className="text-amber-400" />

    const moistureColor = farm.moisture < 50 ? 'text-red-400' : 'text-blue-400'
    const phColor = farm.ph >= 6.5 && farm.ph <= 7.5 ? 'text-green-400' : 'text-amber-400'

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-end justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

                {/* Sheet */}
                <motion.div
                    className="relative w-full max-w-md bg-[#161616] rounded-t-3xl border border-white/10 overflow-hidden"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                >
                    {/* Handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-white/20" />
                    </div>

                    {/* Close */}
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                        <X size={16} />
                    </button>

                    <div className="px-6 pb-10">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-green-500/15 flex items-center justify-center">
                                <Sprout size={24} className="text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-white text-xl font-bold">{farm.name}</h2>
                                <p className="text-white/40 text-sm">{farm.area} · Last scan: {farm.lastScan}</p>
                            </div>
                        </div>

                        {/* Status badge */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-5 ${farm.statusType === 'healthy' ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'
                            }`}>
                            {statusIcon}
                            <span className={`text-sm font-medium ${farm.statusType === 'healthy' ? 'text-green-300' : 'text-amber-300'}`}>
                                {farm.status}
                            </span>
                        </div>

                        {/* Soil metrics */}
                        {(showSoil || !showImage) && (
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Droplets size={16} className={moistureColor} />
                                        <span className="text-white/50 text-xs">Soil Moisture</span>
                                    </div>
                                    <p className={`text-2xl font-bold ${moistureColor}`}>{farm.moisture}%</p>
                                    <p className="text-white/30 text-xs mt-1">{farm.moisture < 50 ? 'Below optimal' : 'Good'}</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FlaskConical size={16} className={phColor} />
                                        <span className="text-white/50 text-xs">Soil pH</span>
                                    </div>
                                    <p className={`text-2xl font-bold ${phColor}`}>{farm.ph}</p>
                                    <p className="text-white/30 text-xs mt-1">{farm.ph >= 6.5 && farm.ph <= 7.5 ? 'Neutral' : 'Check needed'}</p>
                                </div>
                            </div>
                        )}

                        {/* Drone image placeholder */}
                        {(showImage || !showSoil) && (
                            <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-4">
                                <div className="h-48 bg-gradient-to-br from-green-900/40 to-emerald-800/20 flex flex-col items-center justify-center gap-2">
                                    <Image size={32} className="text-green-400/60" />
                                    <p className="text-white/40 text-sm">Drone Image · {farm.lastScan}</p>
                                    <p className="text-white/20 text-xs">Tap to view full resolution</p>
                                </div>
                                {/* NDVI strip */}
                                <div className="px-4 py-3 flex items-center justify-between">
                                    <span className="text-white/40 text-xs">NDVI Health Index</span>
                                    <div className="flex items-center gap-1">
                                        {['bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-lime-400', 'bg-green-500'].map((c, i) => (
                                            <div key={i} className={`w-6 h-2 rounded-sm ${c} ${i < (farm.statusType === 'healthy' ? 4 : 2) ? 'opacity-100' : 'opacity-20'}`} />
                                        ))}
                                        <span className={`text-xs ml-1 font-medium ${farm.statusType === 'healthy' ? 'text-green-400' : 'text-amber-400'}`}>
                                            {farm.statusType === 'healthy' ? 'Good' : 'Low'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick action */}
                        <button
                            onClick={() => { onAskAI?.(farmContext); onClose() }}
                            className="w-full py-3 rounded-2xl bg-green-500/15 border border-green-500/25 text-green-300 text-sm font-semibold active:scale-95 transition-transform"
                        >
                            🎙️ Ask Kisan Mitra about this farm
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
