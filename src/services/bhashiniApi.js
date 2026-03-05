/**
 * Mock Bhashini API Service
 * 
 * In a production environment, this file would construct the REST API call to 
 * the Bhashini translation pipeline using:
 * - userID
 * - ulcaApiKey
 * - inferenceApiKey
 * 
 * We simulate that network latency and resolution here using a customized 
 * agricultural dictionary for Gram-Drishti.
 */

const DICTIONARY = {
    // Navigation & Global
    "Gram-Drishti": "ग्राम-दृष्टि",
    "Home": "होम",
    "Market": "बाज़ार",
    "AI Doctor": "फसल डॉक्टर",
    "Community": "समुदाय",
    "Dashboard placeholder": "डैशबोर्ड प्लेसहोल्डर",
    "Marketplace placeholder": "बाज़ार प्लेसहोल्डर",
    "AI Doctor placeholder": "एआई डॉक्टर प्लेसहोल्डर",
    "Community placeholder": "समुदाय प्लेसहोल्डर",

    // Dashboard
    "नमस्ते,": "Hello,",
    "Sunny": "धूप",
    "Maharashtra": "महाराष्ट्र",
    "Crop Doctor": "फसल डॉक्टर",
    "Market Prices": "बाज़ार भाव",
    "Overall Health": "समग्र स्वास्थ्य",
    "Your wheat crop layout is looking excellent today.": "आज आपकी गेहूं की फसल बहुत अच्छी दिख रही है।",
    "Optimal": "इष्टतम",
    "Soil Moisture": "मिट्टी की नमी",
    "Critical level reached": "महत्वपूर्ण स्तर पर पहुंच गया",
    "Watering Needed": "सिंचाई की आवश्यकता",
    "Forecast": "पूर्वानुमान",
    "No rain for next 3 days": "अगले 3 दिनों तक बारिश नहीं",
    "Start Pump": "पंप शुरू करें",

    // AI Doctor
    "Upload a photo of your sick plant for instant diagnosis and treatment.": "त्वरित निदान और उपचार के लिए अपने बीमार पौधे की एक तस्वीर अपलोड करें।",
    "Tap to Upload Image": "छवि अपलोड करने के लिए टैप करें",
    "Supports JPG, PNG (Max 5MB)": "JPG, PNG का समर्थन करता है (अधिकतम 5MB)",
    "Select from Gallery": "गैलरी से चुनें",
    "Scanning Image...": "छवि को स्कैन किया जा रहा है...",
    "Our AI is analyzing the crop patterns": "हमारा एआई फसल पैटर्न का विश्लेषण कर रहा है",
    "Match": "मैच",
    "Severity:": "गंभीरता:",
    "Medium": "मध्यम",
    "Recommended Treatment": "अनुशंसित उपचार",
    "Scan Another": "दूसरा स्कैन करें",
    "Buy Medicine": "दवा खरीदें",

    // Example Diseases / Diagnoses
    "Leaf Blight": "लीफ ब्लाइट",
    "Remove and burn infected leaves immediately": "संक्रमित पत्तियों को तुरंत हटा दें और जला दें",
    "Apply Mancozeb 75% WP @ 2.5g/L of water": "मैन्कोज़ेब 75% डब्ल्यूपी @ 2.5 ग्राम/लीटर पानी लागू करें",
    "Ensure proper spacing between crops for air circulation": "हवा के प्रवाह के लिए फसलों के बीच उचित दूरी सुनिश्चित करें",

    // Marketplace
    "Live rates from your nearby mandis": "आपके नजदीकी मंडियों से लाइव दरें",
    "Search crop or mandi...": "फसल या मंडी खोजें...",
    "Govt. Mandi": "सरकारी मंडी",
    "Private Buyers": "निजी खरीदार",
    "Wheat (Sharbati)": "गेहूं (शरबती)",
    "Indore Mandi": "इंदौर मंडी",
    "Soybean (Yellow)": "सोयाबीन (पीला)",
    "Ujjain Mandi": "उज्जैन मंडी",
    "Cotton (BT)": "कपास (बीटी)",
    "Khandwa Mandi": "खंडवा मंडी",
    "Gram (Desi)": "चना (देसी)",
    "Sehore Mandi": "सीहोर मंडी",
    "Mustard": "सरसों",
    "Morena Mandi": "मुरैना मंडी",
    "Quintal": "क्विंटल",
    "Sell": "बेचें",
    "Buy": "खरीदें",
    "No crops found matching your search.": "आपकी खोज से मेल खाने वाली कोई फसल नहीं मिली।",

    // Community
    "Connect with other farmers, share your knowledge, and ask for help.": "अन्य किसानों से जुड़ें, अपना ज्ञान साझा करें और मदद मांगें।",
    "Join Discussion": "चर्चा में शामिल हों"
};

/**
 * Simulates calling the Bhashini API for English to Hindi translation.
 *
 * @param {string} text - The input English text
 * @param {string} sourceLang - e.g., 'en'
 * @param {string} targetLang - e.g., 'hi'
 * @returns {Promise<string>} - The translated string
 */
export const translateTextBhashini = async (text, sourceLang = 'en', targetLang = 'hi') => {
    // Simulate network delay of 200-500ms
    const delay = Math.floor(Math.random() * 300) + 200;

    return new Promise((resolve) => {
        setTimeout(() => {
            // If we are strictly EN -> HI
            if (sourceLang === 'en' && targetLang === 'hi') {
                const translated = DICTIONARY[text];
                resolve(translated || text);
            }
            // If HI -> EN (Reverse lookup for greeting or names if necessary)
            else if (sourceLang === 'hi' && targetLang === 'en') {
                // Find key by value
                const engKey = Object.keys(DICTIONARY).find(key => DICTIONARY[key] === text);
                resolve(engKey || text);
            }
            else {
                resolve(text);
            }
        }, delay);
    });
};

/**
 * Synchronous dictionary access for instant UI rendering.
 * Used by the LanguageContext to avoid layout shift waiting for API bounds.
 */
export const getSyncTranslation = (text, targetLang) => {
    if (targetLang === 'en') return text;
    return DICTIONARY[text] || text;
};
