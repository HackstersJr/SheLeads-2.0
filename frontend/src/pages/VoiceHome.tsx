/**
 * VoiceHome.tsx — Gemini Live-style voice screen (sphere fixed to center)
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mic, Leaf, Camera, Video } from 'lucide-react'
import Orb from '../components/Orb'
import type { UIAction } from '../App'

type VoiceState = 'idle' | 'listening' | 'responding' | 'camera'

interface VoiceHomeProps {
    initialContext?: string
    onClearContext?: () => void
    onVoiceAction?: (action: UIAction) => void
    autoListen?: boolean
    onAutoListenConsumed?: () => void
    langCode: string
    onLangChange: (code: string) => void
}

// Sarvam-supported Indian language codes
const LANGUAGES: { label: string; code: string; geminiLang: string }[] = [
    { label: 'हिं', code: 'hi-IN', geminiLang: 'HI' },
    { label: 'EN', code: 'en-IN', geminiLang: 'EN' },
    { label: 'தமி', code: 'ta-IN', geminiLang: 'TA' },
    { label: 'తెలు', code: 'te-IN', geminiLang: 'TE' },
    { label: 'ಕನ್ನ', code: 'kn-IN', geminiLang: 'KN' },
    { label: 'বাং', code: 'bn-IN', geminiLang: 'BN' },
    { label: 'ગુજ', code: 'gu-IN', geminiLang: 'GU' },
    { label: 'मरा', code: 'mr-IN', geminiLang: 'MR' },
    { label: 'ਪੰਜ', code: 'pa-IN', geminiLang: 'PA' },
]

export default function VoiceHome({ initialContext, onClearContext, onVoiceAction, autoListen, onAutoListenConsumed, langCode, onLangChange }: VoiceHomeProps) {
    const [state, setState] = useState<VoiceState>('idle')
    const [displayText, setDisplayText] = useState('')
    const [fullText, setFullText] = useState('')
    const audioChunksRef = useRef<BlobPart[]>([])
    const activeAudioRef = useRef<HTMLAudioElement | null>(null)
    const recorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    const isListening = state === 'listening'
    const isResponding = state === 'responding'

    // Auto-start listening when triggered from floating FAB on other tabs
    useEffect(() => {
        if (autoListen && state === 'idle') {
            const t = setTimeout(() => {
                toggleMic()
                onAutoListenConsumed?.()
            }, 350)
            return () => clearTimeout(t)
        }
    }, [autoListen])

    // Microphone capture and API payload
    const toggleMic = async () => {
        // If it's already responding, tapping mic interrupts playback and starts fresh
        if (state === 'responding') {
            if (activeAudioRef.current) activeAudioRef.current.pause()
            setDisplayText('')
            setFullText('')
            // Continue below to start recording immediately
        }

        // Stop Recording if already recording
        if (recorderRef.current && recorderRef.current.state === 'recording') {
            recorderRef.current.stop()
            return
        }

        // Start Recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            audioChunksRef.current = []

            recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data)
            recorder.onstop = async () => {
                recorderRef.current = null
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                stream.getTracks().forEach(t => t.stop()) // Free up hardware

                setState('responding')
                setDisplayText('Thinking...')

                // Read as base64 string
                const reader = new FileReader()
                reader.readAsDataURL(audioBlob)
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string

                    try {
                        const res = await fetch('/api/ai/voice', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'X-Farmer-ID': 'test-farmer-1' },
                            body: JSON.stringify({
                                audio_base64: base64Audio,
                                context: initialContext || 'General dashboard',
                                language: langCode
                            })
                        })
                        const data = await res.json()
                        setFullText(data.structured_response.verbal_response)

                        // Trigger UI action if AI returned one
                        if (data.structured_response.ui_action && onVoiceAction) {
                            onVoiceAction(data.structured_response.ui_action)
                        }

                        // Play Sarvam TTS Audio
                        if (data.tts_audio_base64) {
                            const audio = new Audio('data:audio/wav;base64,' + data.tts_audio_base64)
                            activeAudioRef.current = audio
                            audio.play()
                            audio.onended = () => setState('idle')
                        } else {
                            // If no audio returned, wait long enough for text to stream then go idle
                            setTimeout(() => setState('idle'), 5000)
                        }

                    } catch (e) {
                        setFullText('सर्वर से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।') // Could not connect
                        setTimeout(() => setState('idle'), 3000)
                    }
                }
            }

            recorder.start()
            recorderRef.current = recorder
            setState('listening')
            setDisplayText('')
            setFullText('')
        } catch (err) {
            console.error(err)
            alert("Microphone access denied or not available.")
        }
    }

    // Auto-trigger on initial context (e.g navigating with 'Ask Kisan Mitra')
    useEffect(() => {
        if (initialContext && state === 'idle') {
            setDisplayText(`Listening about ${initialContext}...`)

            // Small delay to let user see transition before auto-starting mic
            const t = setTimeout(() => {
                // To safely prevent auto-playing microphone without user gesture, 
                // in true production we should require a first click, 
                // but since they just clicked a button on the previous page, we'll try to trigger it.
                toggleMic()
                if (onClearContext) onClearContext()
            }, 500)
            return () => clearTimeout(t)
        }
    }, [initialContext])

    // Streaming text effect
    useEffect(() => {
        if (state !== 'responding' || !fullText) return
        setDisplayText('')
        let i = 0
        streamRef.current = setInterval(() => {
            i++
            setDisplayText(fullText.slice(0, i))
            if (i >= fullText.length) clearInterval(streamRef.current!)
        }, 28)
        return () => clearInterval(streamRef.current!)
    }, [state, fullText])

    // ── Live Camera Feed Setup ──
    useEffect(() => {
        if (state !== 'camera') return

        let stream: MediaStream | null = null

        async function startCamera() {
            try {
                // Request the rear camera
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
            } catch (err) {
                console.error("Camera access denied or unavailable", err)
            }
        }

        startCamera()

        return () => {
            // Stop all camera tracks when exiting camera state
            if (stream) stream.getTracks().forEach(t => t.stop())
        }
    }, [state])



    const bg = isListening
        ? 'from-[#1c1006] via-[#1a1208] to-[#0e0e0e]'
        : isResponding
            ? 'from-[#090f0d] via-[#091210] to-[#0e0e0e]'
            : 'from-[#111111] to-[#0e0e0e]'

    return (
        <div className={`relative flex flex-col w-full h-full bg-gradient-to-b ${bg} transition-colors duration-700 overflow-hidden`}>

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-5 pt-5 z-10 shrink-0">
                {/* Source pills */}


                {/* Scrollable language picker */}
                <AnimatePresence>
                    {!isResponding && !isListening && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-1 bg-white/8 rounded-full p-1 overflow-x-auto max-w-[65vw] scrollbar-none"
                            style={{ scrollbarWidth: 'none' }}
                        >
                            {LANGUAGES.map(l => (
                                <button key={l.code} onClick={() => onLangChange(l.code)}
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${langCode === l.code ? 'bg-white/25 text-white' : 'text-white/35'
                                        }`}>
                                    {l.label}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Brand chip */}
                <div className="flex items-center gap-1.5 ml-auto">
                    <Leaf size={12} className="text-green-400" />
                    <span className="text-white/30 text-xs">Gram-Drishti</span>
                </div>
            </div>

            {/* ── Streaming text — displayed in lower half, not overlapping orb ── */}
            <AnimatePresence>
                {(isResponding || (state === 'idle' && displayText)) && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute inset-x-0 bottom-32 px-6 z-10 max-h-[40vh] overflow-y-auto"
                    >
                        <p className={`text-[1.25rem] leading-relaxed font-light text-white/90 ${fullText.length > displayText.length ? 'streaming-cursor' : ''}`}
                            style={{ fontFamily: 'var(--font-display)' }}>
                            {displayText}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── ReactBits WebGL Orb — fixed to viewport center ── */}
            {state !== 'camera' && (
                <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center">
                    <div style={{ width: 280, height: 280 }}>
                        <Orb
                            hue={isListening ? 30 : isResponding ? 120 : 220}
                            hoverIntensity={2}
                            rotateOnHover
                            forceHoverState={isListening || isResponding}
                            backgroundColor="#0e0e0e"
                        />
                    </div>
                </div>
            )}

            {/* Idle label */}
            <div className="flex-1 pointer-events-none flex flex-col justify-end pb-8">
                <AnimatePresence>
                    {state === 'idle' && (
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-white/25 text-sm text-center w-full z-10"
                        >
                            बोलें / Speak · {LANGUAGES.find(l => l.code === langCode)?.label ?? langCode} · Sarvam AI
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Camera Fullscreen Overlay ── */}
            <AnimatePresence>
                {state === 'camera' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className="absolute inset-0 z-50 flex flex-col bg-black overflow-hidden"
                    >
                        {/* Live camera feed */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover opacity-85"
                        />

                        {/* Top bar — Live badge */}
                        <div className="relative z-10 flex justify-center pt-12">
                            <div className="bg-black/40 backdrop-blur px-3 py-1.5 rounded-md border border-white/10 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-white text-xs font-medium tracking-wide">Live</span>
                                <Video size={14} className="text-white/70 ml-1" />
                            </div>
                        </div>

                        <div className="flex-1" />

                        {/* Bottom camera controls */}
                        <div className="relative z-10 flex items-center justify-center gap-6 pb-12 pt-8 bg-gradient-to-t from-black/80 to-transparent">
                            {/* Switch Camera */}
                            <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/80">
                                <Camera size={20} />
                            </button>
                            {/* Mic */}
                            <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
                                <Mic size={24} />
                            </button>
                            <button onClick={() => setState('idle')} className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Bottom bar (Idle / Voice) ── */}
            <div className="relative z-10 tab-bar shrink-0">
                {/* Removed redundant tiny sphere as main sphere now persists */}


                <div className="flex items-center justify-between px-10 pb-8 pt-2">
                    {/* Left: Camera / Vision button */}
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setState('camera')} disabled={isResponding}
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/60 hover:text-white transition-opacity disabled:opacity-0">
                        <Camera size={20} />
                    </motion.button>

                    <AnimatePresence>
                        {isListening && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="text-white/35 text-sm absolute left-1/2 -translate-x-1/2 mt-3">
                                Say something…
                            </motion.span>
                        )}
                        {isResponding && (
                            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={toggleMic}
                                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex flex-col items-center justify-center text-white/60 hover:text-white absolute left-1/2 -translate-x-1/2"
                            >
                                <X size={20} />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Right: Mic button (Always visible now) */}
                    <motion.button whileTap={{ scale: 0.88 }} onClick={toggleMic} disabled={state === 'camera'}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-amber-500/25 ring-2 ring-amber-400/60 text-amber-300 animate-pulse' : 'bg-white/10 backdrop-blur text-white/60 hover:text-white'
                            }`}>
                        <Mic size={20} />
                    </motion.button>
                </div>
            </div>
        </div>
    )
}
