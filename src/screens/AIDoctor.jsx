import { useState } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const AIDoctor = () => {
    const [file, setFile] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);

    const handleUpload = (e) => {
        // Simulate file selection
        setFile("leaf-sample.jpg");
        setScanning(true);
        setResult(null);

        // Simulate AI scan delay
        setTimeout(() => {
            setScanning(false);
            setResult({
                disease: "Leaf Blight",
                confidence: 94,
                severity: "Medium",
                treatment: [
                    "Remove and burn infected leaves immediately",
                    "Apply Mancozeb 75% WP @ 2.5g/L of water",
                    "Ensure proper spacing between crops for air circulation"
                ]
            });
        }, 2500);
    };

    const resetForm = () => {
        setFile(null);
        setResult(null);
        setScanning(false);
    };

    return (
        <div className="p-5 pb-24 max-w-md mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('AI Doctor')}</h2>
                <p className="text-slate-500 text-sm mt-1">{t('Upload a photo of your sick plant for instant diagnosis and treatment.')}</p>
            </div>

            {!file && (
                <div
                    className="border-2 border-dashed border-earth-300 rounded-3xl p-8 flex flex-col items-center justify-center bg-earth-50/50 hover:bg-earth-50 transition-colors cursor-pointer text-center h-64 shadow-inner"
                    onClick={handleUpload}
                >
                    <div className="bg-white p-4 rounded-full shadow-sm text-earth-500 mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud size={32} />
                    </div>
                    <h3 className="font-semibold text-slate-700">{t('Tap to Upload Image')}</h3>
                    <p className="text-xs text-slate-400 mt-2">{t('Supports JPG, PNG (Max 5MB)')}</p>
                    <button className="mt-6 bg-earth-600 text-white px-6 py-2 rounded-full font-medium text-sm shadow-md hover:bg-earth-700 transition">
                        {t('Select from Gallery')}
                    </button>
                </div>
            )}

            {scanning && (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-sm border border-slate-100 h-64">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-earth-100 border-t-earth-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCw size={20} className="text-earth-400 animate-pulse" />
                        </div>
                    </div>
                    <h3 className="mt-6 font-semibold text-slate-800">{t('Scanning Image...')}</h3>
                    <p className="text-xs text-slate-500 mt-1">{t('Our AI is analyzing the crop patterns')}</p>
                </div>
            )}

            {result && (
                <div className="space-y-4 animate-fade-in">
                    {/* Result Card */}
                    <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                        <div className="flex items-start gap-4">
                            <div className="bg-red-50 p-3 rounded-2xl text-red-500 shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-800">{t(result.disease)}</h3>
                                    <span className="bg-earth-100 text-earth-700 text-xs font-semibold px-2 py-1 rounded-lg">
                                        {result.confidence}% {t('Match')}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">{t('Severity:')} <span className="font-bold text-red-500">{t(result.severity)}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Treatment Steps */}
                    <div className="bg-gradient-to-b from-earth-50 to-white rounded-3xl p-5 border border-earth-100 shadow-sm">
                        <h4 className="font-semibold text-earth-800 mb-4 flex items-center">
                            <CheckCircle size={18} className="mr-2 text-earth-600" />
                            {t('Recommended Treatment')}
                        </h4>
                        <div className="space-y-3">
                            {result.treatment.map((step, index) => (
                                <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-50">
                                    <div className="bg-earth-100 text-earth-700 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                                        {index + 1}
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">{t(step)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                            onClick={resetForm}
                            className="bg-slate-100 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-200 transition"
                        >
                            {t('Scan Another')}
                        </button>
                        <button className="bg-earth-600 text-white font-medium py-3 rounded-xl hover:bg-earth-700 transition shadow-md flex items-center justify-center gap-2">
                            {t('Buy Medicine')} <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIDoctor;
