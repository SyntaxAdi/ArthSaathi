import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Info, Trash2, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { deleteUserAccount } from '../lib/db';
import { useLanguage } from '../context/LanguageContext';

export default function ProfilePage() {
    const { user, signOut } = useAuth();
    const {
        lang, toggleLanguage, t,
        numSystem, setNumSystem,
        currency, setCurrency,
        fontSize, setFontSize
    } = useLanguage();
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Format dates
    const lastLogin = user?.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date();
    const createdDate = user?.created_at ? new Date(user.created_at) : new Date();

    const formatDateTime = (date) => {
        const d = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const t = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        // en-GB gives DD/MM/YYYY
        return `${d.replace(/\//g, ':')} - ${t}`;
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await deleteUserAccount();
            navigate('/');
        } catch (error) {
            console.error('Failed to delete account', error);
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="w-full min-h-screen bg-bgBase flex justify-center py-12 md:py-24 px-6 overflow-hidden">
            <motion.div
                className="w-full max-w-[800px] flex flex-col gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-bgSurface border border-borderDefault rounded-xl flex items-center justify-center shadow-sm">
                        <User size={24} className="text-accent stroke-[1.5px]" />
                    </div>
                    <div>
                        <h1 className="font-heading font-bold text-3xl tracking-tight text-textPrimary">{t('Profile')}</h1>
                        <p className="font-body text-[14px] text-textSecondary mt-1">{t('Manage your account and preferences.')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Column 1: Personal + Account Info */}
                    <div className="flex flex-col gap-8">

                        {/* Personal Information */}
                        <section className="bg-bgSurface border border-borderDefault rounded-[12px] p-6 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                                <img src="/logo.png" alt="ArthSaathi" className="w-24 h-24 grayscale rounded-[22px]" />
                            </div>
                            <h2 className="font-heading font-semibold text-[15px] uppercase tracking-widest text-textPrimary mb-6 flex items-center gap-2">
                                <User size={16} className="text-accent" /> {t('Personal Info')}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <span className="block font-mono text-[11px] text-textMuted uppercase mb-1">{t('Full Name')}</span>
                                    <p className="font-body text-[15px] text-textPrimary font-medium">{user?.user_metadata?.full_name || 'ArthSaathi User'}</p>
                                </div>
                                <div>
                                    <span className="block font-mono text-[11px] text-textMuted uppercase mb-1">{t('Email Address')}</span>
                                    <p className="font-body text-[15px] text-textSecondary">{user?.email}</p>
                                </div>
                                <div>
                                    <span className="block font-mono text-[11px] text-textMuted uppercase mb-1">{t('Account Companion')}</span>
                                    <div className="flex items-center gap-2 mt-2">
                                        <img src="/logo.png" alt="ArthSaathi" className="w-6 h-6 rounded-[5px] border border-borderSubtle" />
                                        <p className="font-body text-[14px] text-textPrimary">ArthSaathi</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Account Information */}
                        <section className="bg-bgSurface border border-borderDefault rounded-[12px] p-6 shadow-sm">
                            <h2 className="font-heading font-semibold text-[15px] uppercase tracking-widest text-textPrimary mb-6 flex items-center gap-2">
                                <Info size={16} className="text-accent" /> {t('Account Info')}
                            </h2>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center pb-3 border-b border-borderSubtle">
                                    <span className="font-mono text-[12px] text-textMuted uppercase tracking-wider">{t('Member Since')}</span>
                                    <span className="font-mono text-[13px] text-textPrimary">{formatDateTime(createdDate).split(' - ')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-borderSubtle">
                                    <span className="font-mono text-[12px] text-textMuted uppercase tracking-wider">{t('Last Login')}</span>
                                    <span className="font-mono text-[13px] text-textPrimary">{formatDateTime(lastLogin)}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-danger/5 border border-danger/20 rounded-[8px]">
                                <h3 className="font-heading font-semibold text-[14px] text-danger mb-2 flex items-center gap-2">
                                    <ShieldAlert size={16} /> {t('Danger Zone')}
                                </h3>
                                <p className="font-body text-[12px] text-textSecondary mb-4 leading-relaxed">
                                    {t('Delete Account Warning')}
                                </p>

                                {showDeleteConfirm ? (
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting}
                                            className="w-full bg-danger hover:bg-danger/90 text-white font-heading font-semibold text-[13px] uppercase tracking-widest py-3 rounded-md transition-colors disabled:opacity-50"
                                        >
                                            {isDeleting ? 'Deleting...' : t('Yes, Delete Everything')}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={isDeleting}
                                            className="w-full bg-transparent border border-borderSubtle hover:border-borderDefault text-textSecondary font-heading font-semibold text-[13px] uppercase tracking-widest py-3 rounded-md transition-colors"
                                        >
                                            {t('Cancel')}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger font-heading font-semibold text-[13px] uppercase tracking-widest py-3 pl-4 pr-1 rounded-md transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} className="stroke-[2.5px]" /> {t('Delete Account')}
                                    </button>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Column 2: Preferences */}
                    <div className="flex flex-col gap-8">
                        <section className="bg-bgSurface border border-borderDefault rounded-[12px] p-6 shadow-sm h-full">
                            <h2 className="font-heading font-semibold text-[15px] uppercase tracking-widest text-textPrimary mb-6 flex items-center gap-2">
                                <Settings size={16} className="text-accent" /> {t('Preferences')}
                            </h2>

                            <div className="space-y-6">
                                {/* Numbering System */}
                                <div>
                                    <label className="block font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-3">{t('Numbering System')}</label>
                                    <div className="flex bg-[#161616] p-1 rounded-md border border-borderSubtle">
                                        <button
                                            onClick={() => setNumSystem('indian')}
                                            className={`flex-1 py-2 font-heading font-medium text-[13px] tracking-wide rounded transition-all ${numSystem === 'indian' ? 'bg-bgElevated text-accent shadow-sm' : 'text-textMuted hover:text-textSecondary'}`}
                                        >
                                            {t('Indian')}
                                        </button>
                                        <button
                                            onClick={() => setNumSystem('international')}
                                            className={`flex-1 py-2 font-heading font-medium text-[13px] tracking-wide rounded transition-all ${numSystem === 'international' ? 'bg-bgElevated text-accent shadow-sm' : 'text-textMuted hover:text-textSecondary'}`}
                                        >
                                            {t('International')}
                                        </button>
                                    </div>
                                    <p className="font-body text-[11px] text-textMuted mt-2 px-1">
                                        {numSystem === 'indian' ? t('Example: ₹ 1,50,000') : t('Example: $ 150,000')}
                                    </p>
                                </div>

                                {/* Language */}
                                <div>
                                    <label className="block font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-3">{t('Language Strategy')}</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['EN', 'हिं', 'தமிழ்', 'मराठी'].map(l => (
                                            <button
                                                key={l}
                                                onClick={() => toggleLanguage(l)}
                                                className={`py-2 px-3 flex justify-between items-center rounded-md border transition-all ${lang === l ? 'border-accent bg-accent/10 text-accent' : 'border-borderSubtle bg-[#161616] text-textSecondary hover:border-borderDefault'}`}
                                            >
                                                <span className="font-body text-[14px] font-medium">{l === 'EN' ? 'English' : l === 'हिं' ? 'Hindi' : l === 'தமிழ்' ? 'Tamil' : 'Marathi'}</span>
                                                {lang === l && <Check size={14} className="text-accent" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Currency */}
                                <div>
                                    <label className="block font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-3">{t('Currency')}</label>
                                    <div className="flex gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer font-body text-[14px] text-textPrimary">
                                            <input type="radio" checked={currency === 'inr'} onChange={() => setCurrency('inr')} className="accent-accent" />
                                            Rupees (₹)
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer font-body text-[14px] text-textSecondary hover:text-textPrimary transition-colors">
                                            <input type="radio" checked={currency === 'usd'} onChange={() => setCurrency('usd')} className="accent-accent" />
                                            Dollars ($)
                                        </label>
                                    </div>
                                </div>

                                {/* Font Size */}
                                <div>
                                    <label className="block font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-3">{t('Display Density')}</label>
                                    <select
                                        value={fontSize}
                                        onChange={(e) => setFontSize(e.target.value)}
                                        className="w-full bg-[#161616] border border-borderSubtle rounded-md py-2.5 px-4 text-textPrimary font-body text-[14px] focus:outline-none focus:border-accent transition-colors"
                                    >
                                        <option value="small">{t('Compact (Smaller Text)')}</option>
                                        <option value="medium">{t('Default (Medium Text)')}</option>
                                        <option value="large">{t('Spacious (Larger Text)')}</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
