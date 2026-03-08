import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy, TrendingUp, AlertTriangle, Info, BarChart3, ArrowRight, Clock, FlaskConical } from 'lucide-react';
import { fetchLatestReport, fetchCustomCategories } from '../lib/db';
import { useLanguage } from '../context/LanguageContext';

const SAMPLE_DATA = {
    income: 45000,
    totalExpenses: 37500,
    expenses: {
        rent: 15000, food: 8000, upi: 4500, emis: 3000,
        transport: 2500, entertainment: 2000, family: 1500,
        subscriptions: 500, misc: 500
    },
    generatedAt: new Date().toISOString(),
    isSample: true
};

const CATEGORIES_META = {
    rent: { name: 'Rent/Hostel', recommended: 30, color: '#ff4d00' },
    food: { name: 'Food & Dining', recommended: 15, color: '#ff6a2a' },
    upi: { name: 'UPI/Online Spends', recommended: 10, color: '#ff8554' },
    emis: { name: 'EMIs', recommended: 10, color: '#ffa17e' },
    transport: { name: 'Transport', recommended: 5, color: '#ffbda8' },
    entertainment: { name: 'Entertainment', recommended: 5, color: '#ffd9d2' },
    family: { name: 'Family Remittances', recommended: 10, color: '#ffeae5' },
    subscriptions: { name: 'Subscriptions', recommended: 5, color: '#ffffff' },
    misc: { name: 'Miscellaneous', recommended: 10, color: '#555555' },
};

function EmptyState() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-md"
            >
                <div className="w-20 h-20 rounded-full bg-bgSurface border border-borderSubtle flex items-center justify-center mx-auto mb-8">
                    <BarChart3 size={36} className="text-accent stroke-[1.5px]" />
                </div>

                <span className="font-mono text-[11px] text-accent uppercase tracking-widest mb-3 block">
                    {t('No Data Yet')}
                </span>

                <h1 className="font-heading font-bold text-3xl text-textPrimary tracking-tight mb-4">
                    {t('Your report is waiting to be written.')}
                </h1>

                <p className="font-body text-textSecondary text-[15px] leading-relaxed mb-10">
                    {t('Your financial health report is generated from your actual numbers.')}
                    <br />
                    {t('Head to the Dashboard, fill in your income and expenses, and hit')} <strong className="text-textPrimary">{t('Analyse My Finances')}</strong> — {t('your personalised report will appear right here.')}
                </p>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accentHover text-bgBase font-heading font-semibold text-[13px] uppercase tracking-widest px-8 py-4 rounded-md transition-colors"
                >
                    {t('Go to Dashboard')}
                    <ArrowRight size={16} />
                </button>
            </motion.div>
        </div>
    );
}

export default function ReportPage() {
    const { t, formatCurrency } = useLanguage();
    const [reportData, setReportData] = useState(null);
    const [customCats, setCustomCats] = useState([]);
    const [animatedScore, setAnimatedScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const isSampleMode = searchParams.get('sample') === 'true';

    useEffect(() => {
        if (isSampleMode) {
            setReportData(SAMPLE_DATA);
            setLoading(false);
            return;
        }

        Promise.all([
            fetchLatestReport(),
            fetchCustomCategories()
        ]).then(([report, customCategories]) => {
            setReportData(report);
            setCustomCats(customCategories);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [isSampleMode]);

    // Build categories from user data
    const categories = reportData && reportData.expenses
        ? Object.entries(reportData.expenses).map(([id, amountStr]) => {
            const actual = parseInt(amountStr) || 0;
            if (actual <= 0) return null;

            const actualPct = reportData.totalExpenses > 0
                ? Math.round((actual / reportData.income) * 100)
                : 0;

            // Check if it's a base category
            if (CATEGORIES_META[id]) {
                return { ...CATEGORIES_META[id], actual: actualPct, id };
            }

            // Check if it's a custom category
            const custom = customCats.find(c => c.id === id);
            if (custom) {
                return { name: custom.label, recommended: 0, color: custom.color, actual: actualPct, id };
            }

            return null;
        }).filter(Boolean)
        : [];

    // Compute financial health score from user data
    const score = reportData
        ? (() => {
            const savingsRate = Math.max(0, ((reportData.income - reportData.totalExpenses) / reportData.income) * 100);
            const debtRatio = (parseInt(reportData.expenses?.emis) || 0) / reportData.income;
            const rawScore = Math.round(
                (savingsRate / 100) * 40 +
                Math.max(0, 1 - debtRatio) * 30 +
                0.6 * 20 +   // goal & habit assumed mid for now
                0.8 * 10
            );
            return Math.min(100, Math.max(0, rawScore));
        })()
        : 0;

    const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C+' : score >= 40 ? 'C' : 'D';

    useEffect(() => {
        if (reportData) {
            const timer = setTimeout(() => setAnimatedScore(score), 300);
            return () => clearTimeout(timer);
        }
    }, [reportData, score]);

    if (loading) {
        return <div className="min-h-screen pt-24 pb-32 flex items-center justify-center text-textMuted font-mono text-[12px] uppercase">{t('Loading Report...')}</div>;
    }

    if (!reportData) {
        return <EmptyState />;
    }
    const radius = 100;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    const savingsAmount = reportData.income - reportData.totalExpenses;
    const savingsRate = Math.max(0, Math.round((savingsAmount / reportData.income) * 100));

    const getGradeColor = (g) => {
        if (g.startsWith('A')) return 'text-success border-success/30 bg-success/10';
        if (g.startsWith('B')) return 'text-[#3b82f6] border-[#3b82f6]/30 bg-[#3b82f6]/10';
        if (g.startsWith('C')) return 'text-warning border-warning/30 bg-warning/10';
        return 'text-danger border-danger/30 bg-danger/10';
    };

    const generatedDate = new Date(reportData.generatedAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="w-full min-h-screen p-6 pt-24 md:pt-16 pb-32 md:pb-16 max-w-[1000px] mx-auto">

            {/* Sample Mode Banner */}
            {isSampleMode && (
                <div className="mb-8 flex items-center gap-3 bg-accent/10 border border-accent/30 rounded-[10px] px-5 py-3">
                    <FlaskConical size={16} className="text-accent shrink-0" />
                    <p className="font-body text-[13px] text-textSecondary">
                        <span className="text-accent font-semibold">{t('Sample Report')}</span> — {t('This is a demo using fictional data for a ₹45,000/mo earner.')}{' '}
                        <a href="/quiz" className="text-accent underline hover:opacity-80">{t('Take the quiz')}</a> {t('to generate your real report.')}
                    </p>
                </div>
            )}

            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="font-mono text-[11px] text-accent uppercase tracking-widest mb-2 block">/report</span>
                    <h1 className="font-heading font-bold text-3xl md:text-[40px] text-textPrimary tracking-tight">
                        {isSampleMode ? t('Sample Financial Health Report.') : t('Your Financial Health.')}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-2 text-textMuted font-mono text-[11px]">
                        <Clock size={12} />
                        <span>{isSampleMode ? t('Sample data — for illustration only') : `${t('Generated')} ${generatedDate}`}</span>
                    </div>
                </div>
                {!isSampleMode ? (
                    <button
                        onClick={() => { localStorage.removeItem('arthsaathi_report'); window.location.reload(); }}
                        className="bg-transparent border border-borderSubtle hover:border-accent hover:text-accent text-textSecondary font-heading font-semibold text-[13px] uppercase tracking-widest px-6 py-2.5 rounded-md transition-colors w-full md:w-auto"
                    >
                        {t('Reset Report')}
                    </button>
                ) : (
                    <a href="/auth"
                        className="bg-accent hover:bg-accentHover text-bgBase font-heading font-semibold text-[13px] uppercase tracking-widest px-6 py-2.5 rounded-md transition-colors w-full md:w-auto text-center flex items-center gap-2 justify-center"
                    >
                        {t('Create Your Account')} <ArrowRight size={14} />
                    </a>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Score Ring */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-5 bg-bgSurface border border-borderSubtle rounded-[16px] p-8 flex flex-col items-center justify-center relative overflow-hidden hover:border-borderDefault transition-colors"
                >
                    <div className="absolute top-4 right-4 z-10">
                        <div className={`font-display text-[24px] px-3 pt-1 pb-0 rounded-[8px] border flex items-center justify-center ${getGradeColor(grade)}`}>
                            {grade}
                        </div>
                    </div>

                    <div className="relative w-[240px] h-[240px] flex items-center justify-center mb-6">
                        <svg width="240" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
                            <circle cx="120" cy="120" r={radius} fill="none" stroke="#1f1f1f" strokeWidth="16" />
                            <circle
                                cx="120" cy="120" r={radius}
                                fill="none" stroke="#ff4d00" strokeWidth="16" strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)]"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="font-display text-[64px] text-textPrimary leading-none mb-1">{animatedScore}</span>
                            <span className="font-mono text-textSecondary text-[11px] uppercase tracking-widest">{t('Out of 100')}</span>
                        </div>
                    </div>

                    <details className="w-full bg-bgElevated border border-borderSubtle rounded-[8px] [&_summary::-webkit-details-marker]:hidden">
                        <summary className="font-mono text-[11px] text-textSecondary uppercase tracking-widest p-4 cursor-pointer flex items-center justify-between select-none">
                            <span>{t('View Score Formula')}</span>
                            <Info size={14} />
                        </summary>
                        <div className="p-4 pt-0 border-t border-borderSubtle mt-2 font-mono text-[10px] text-textMuted leading-relaxed bg-[#111111]">
                            <span className="text-accent">{t('Score')}</span> = ({t('Savings Rate')} × 40) + ((1 - {t('EMI Ratio')}) × 30) + ({t('Goal Progress')} × 20) + ({t('Habit Consistency')} × 10)
                            <br /><br />
                            {t('Your calc')}: ({savingsRate}% {t('savings')}) → {t('Score')} ≈ {animatedScore}
                        </div>
                    </details>
                </motion.div>

                {/* Stats Column */}
                <div className="lg:col-span-7 flex flex-col gap-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: t('Monthly Income'), value: formatCurrency(reportData.income), color: 'text-textPrimary' },
                            { label: t('Total Spent'), value: formatCurrency(reportData.totalExpenses), color: savingsAmount < 0 ? 'text-danger' : 'text-textPrimary' },
                            { label: t('Savings Rate'), value: `${savingsRate}%`, color: savingsRate >= 20 ? 'text-success' : savingsRate >= 10 ? 'text-warning' : 'text-danger' },
                        ].map((s, i) => (
                            <div key={i} className="bg-bgSurface border border-borderSubtle rounded-[12px] p-4 hover:border-borderDefault transition-colors">
                                <span className="font-mono text-[10px] text-textMuted uppercase tracking-widest block mb-2">{s.label}</span>
                                <span className={`font-display text-[22px] ${s.color} leading-none`}>{s.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Category Breakdown */}
                    <div className="bg-bgSurface border border-borderSubtle rounded-[12px] p-6 flex-1 hover:border-borderDefault transition-colors">
                        <h3 className="font-heading font-semibold text-[15px] uppercase tracking-widest text-textPrimary mb-6">
                            <TrendingUp size={16} className="inline mr-2 text-accent" />
                            {t('Spending Breakdown')}
                        </h3>

                        {categories.length === 0 ? (
                            <p className="text-textMuted font-body text-sm">{t('No expense categories entered.')}</p>
                        ) : (
                            <div className="flex flex-col gap-5">
                                {categories.map((cat, idx) => {
                                    const isOver = cat.actual > cat.recommended;
                                    return (
                                        <div key={idx} className="w-full">
                                            <div className="flex justify-between font-mono text-[11px] uppercase tracking-widest mb-2">
                                                <span className="text-textSecondary flex items-center gap-1.5">
                                                    {isOver && <AlertTriangle size={12} className="text-warning stroke-[2px]" />}
                                                    {cat.name}
                                                </span>
                                                <span className={isOver ? 'text-warning' : 'text-textPrimary'}>
                                                    {cat.actual}% <span className="text-textMuted lowercase tracking-normal font-body">{t('vs')}</span> {cat.recommended}% {t('rec')}
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-bgElevated rounded-full overflow-hidden flex relative">
                                                <div className="h-full border-r border-[#000]" style={{ width: `${cat.actual}%`, backgroundColor: cat.color }} />
                                                <div className="absolute h-full w-[2px] bg-textPrimary/50 shadow-[0_0_4px_rgba(255,255,255,0.5)]" style={{ left: `${cat.recommended}%`, zIndex: 10 }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Improvements */}
            <section className="bg-bgSurface border border-borderSubtle rounded-[16px] p-8 hover:border-borderDefault transition-colors">
                <div className="flex items-center gap-3 mb-8">
                    <Trophy size={20} className="text-accent stroke-[1.5px]" />
                    <h2 className="font-heading font-semibold text-[24px] text-textPrimary">{t('What You Can Improve')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories
                        .filter(c => c.actual > c.recommended)
                        .slice(0, 3)
                        .map((cat, idx) => (
                            <div key={idx} className="bg-bgElevated border border-borderSubtle rounded-[10px] p-6 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                                <span className="font-display text-[40px] text-borderDefault absolute top-3 right-4 select-none pointer-events-none">0{idx + 1}</span>
                                <h4 className="font-heading font-semibold text-[16px] text-textPrimary mb-4 mt-2 relative z-10 pr-8">
                                    {t('Overspending on')} {cat.name}
                                </h4>
                                <div className="flex flex-col gap-3 relative z-10">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-[10px] text-danger uppercase tracking-widest mb-1">{t('Current')}</span>
                                        <span className="font-body text-[13px] text-textSecondary">{cat.actual}% {t('of income')}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-mono text-[10px] text-success uppercase tracking-widest mb-1">{t('Target')}</span>
                                        <span className="font-body text-[13px] text-textPrimary">{t('Aim for')} {cat.recommended}% — {t('save')} {formatCurrency(Math.round(((cat.actual - cat.recommended) / 100) * reportData.income))}/mo</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                    {categories.filter(c => c.actual > c.recommended).length === 0 && (
                        <div className="md:col-span-3 text-center py-8">
                            <span className="font-mono text-[11px] text-success uppercase tracking-widest block mb-2">✓ {t('All Good')}</span>
                            <p className="font-body text-textSecondary">{t("You're within recommended limits across all categories. Great discipline!")}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
