import { Mic } from 'lucide-react';

const VoiceAssistant = () => {
    return (
        <div className="fixed bottom-24 right-4 z-50">
            <button
                className="relative group bg-earth-500 text-white p-4 rounded-full shadow-xl hover:bg-earth-600 transition-colors duration-200 flex items-center justify-center transform hover:scale-105"
                aria-label="Voice Assistant"
            >
                <div className="absolute inset-0 rounded-full bg-earth-500 opacity-40 animate-ping" style={{ animationDuration: '2s' }}></div>
                <Mic size={28} className="relative z-10" />
            </button>
        </div>
    );
};

export default VoiceAssistant;
