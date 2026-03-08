import { useLanguage } from '../context/LanguageContext';
import { Languages as LangIcon, CheckCircle2 } from 'lucide-react';

export default function LanguagesPage() {
    const { lang, toggleLanguage } = useLanguage();

    const languages = [
        { code: 'EN', name: 'English', script: 'Latin', native: 'English' },
        { code: 'हिं', name: 'Hindi', script: 'Devanagari', native: 'हिन्दी' },
        { code: 'தமிழ்', name: 'Tamil', script: 'Tamil', native: 'தமிழ்' }
    ];

    return (
        <div className="w-full min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">

            <div className="text-center mb-16 max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 text-accent">
                    <LangIcon size={32} />
                </div>
                <h1 className="font-heading font-bold text-4xl md:text-5xl text-textPrimary mb-4">Native Support.</h1>
                <p className="font-body text-[15px] text-textSecondary leading-relaxed">
                    ArthSaathi's AI engine is trained to understand and respond natively, including nuances and idioms.
                </p>
            </div>

            <div className="max-w-[700px] w-full flex flex-col gap-4">
                {languages.map((l) => {
                    const isActive = lang === l.code;
                    return (
                        <button
                            key={l.code}
                            onClick={() => toggleLanguage(l.code)}
                            className={`w-full flex items-center justify-between p-6 rounded-[12px] border transition-all text-left ${isActive
                                ? 'bg-accent/10 border-accent shadow-[0_0_20px_rgba(255,77,0,0.1)]'
                                : 'bg-bgSurface border-borderSubtle hover:border-borderDefault hover:bg-bgElevated'
                                }`}
                        >
                            <div className="flex flex-col gap-1">
                                <span className={`font-heading font-semibold text-[20px] ${isActive ? 'text-textPrimary' : 'text-textSecondary'}`}>
                                    {l.native} <span className="text-textMuted mx-2">/</span> {l.name}
                                </span>
                                <span className="font-mono text-[11px] text-textMuted uppercase tracking-widest">
                                    {l.script} Script
                                </span>
                            </div>

                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? 'text-accent' : 'text-borderSubtle'
                                }`}>
                                <CheckCircle2 size={24} className={isActive ? 'opacity-100' : 'opacity-0 scale-75'} />
                            </div>
                        </button>
                    )
                })}

                {/* Coming Soon */}
                <div className="w-full flex items-center justify-between p-6 rounded-[12px] border bg-bgSurface/50 border-borderSubtle border-dashed opacity-60">
                    <div className="flex flex-col gap-1">
                        <span className="font-heading font-semibold text-[20px] text-textSecondary">
                            More coming soon...
                        </span>
                        <span className="font-mono text-[11px] text-textMuted uppercase tracking-widest">
                            Bengali, Marathi, Telugu
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="font-mono text-[11px] text-textMuted uppercase tracking-widest">
                    AI responses dynamically match your selected language preferences globally.
                </p>
            </div>
        </div>
    );
}
