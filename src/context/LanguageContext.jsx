import { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../lib/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState('EN'); // 'EN', 'हिं', 'தமிழ்', 'मराठी'
    // Preferences:
    const [numSystem, setNumSystem] = useState('indian'); // 'indian' or 'international'
    const [currency, setCurrency] = useState('inr'); // 'inr' or 'usd'
    const [fontSize, setFontSize] = useState('medium'); // 'small', 'medium', 'large'

    useEffect(() => {
        if (fontSize === 'small') document.body.style.zoom = '0.9';
        else if (fontSize === 'large') document.body.style.zoom = '1.1';
        else document.body.style.zoom = '1';
    }, [fontSize]);

    const toggleLanguage = (newLang) => {
        setLang(newLang);
    };

    const t = (key) => {
        if (translations[key] && translations[key][lang]) {
            return translations[key][lang];
        }
        return key; // fallback to key
    };

    const currencySymbol = currency === 'inr' ? '₹' : '$';

    const formatCurrency = (amount) => {
        const value = Number(amount) || 0;
        const locale = numSystem === 'indian' ? 'en-IN' : 'en-US';
        const formattedRaw = value.toLocaleString(locale);
        return `${currencySymbol}${formattedRaw}`;
    };

    const formatInputStr = (val) => {
        const num = parseInt(String(val).replace(/\D/g, '')) || 0;
        const locale = numSystem === 'indian' ? 'en-IN' : 'en-US';
        return num > 0 ? num.toLocaleString(locale) : '';
    };

    return (
        <LanguageContext.Provider value={{
            lang, toggleLanguage, t,
            numSystem, setNumSystem,
            currency, setCurrency,
            fontSize, setFontSize,
            formatCurrency,
            currencySymbol,
            formatInputStr
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
