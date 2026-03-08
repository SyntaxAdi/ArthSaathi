import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Calendar, ChevronDown, ChevronUp, Trash2, FlagTriangleRight } from 'lucide-react';
import { fetchGoals, createGoal, deleteGoal } from '../lib/db';
import { useLanguage } from '../context/LanguageContext';

const STORAGE_KEY = 'arthsaathi_goals'; // kept for legacy read, Supabase is now primary

function EmptyGoals({ onAdd }) {
    const { t } = useLanguage();
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center text-center py-24 px-6"
        >
            <div className="w-16 h-16 rounded-full bg-bgSurface border border-borderSubtle flex items-center justify-center mb-6">
                <FlagTriangleRight size={28} className="text-accent stroke-[1.5px]" />
            </div>
            <span className="font-mono text-[11px] text-accent uppercase tracking-widest mb-3 block">{t('No Goals Yet')}</span>
            <h2 className="font-heading font-bold text-2xl text-textPrimary tracking-tight mb-3">
                {t('Set a goal, build a habit.')}
            </h2>
            <h3 className="font-heading font-semibold text-textPrimary text-[18px] mb-2">{t('Goals')}</h3>
            <p className="font-body text-textSecondary text-[14px] max-w-sm mb-6">
                {t('Start telling your money where to go. Set up your first savings goal.')}
            </p>
            <button
                onClick={onAdd}
                className="bg-accent hover:bg-accent/90 text-[#0a0a0a] font-heading font-semibold text-[13px] uppercase tracking-widest px-6 py-3 rounded-full transition-colors inline-flex items-center gap-2"
            >
                <Plus size={16} className="stroke-[2.5px]" /> {t('Add New Goal')}
            </button>
        </motion.div>
    );
}

export default function GoalsPage() {
    const { t, formatCurrency, formatInputStr, currencySymbol } = useLanguage();
    const [goals, setGoals] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', target: '', date: '' });
    const [loading, setLoading] = useState(true);

    // Compute minimum allowed date (tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDateStr = tomorrow.toISOString().split('T')[0];

    // Load goals from Supabase
    useEffect(() => {
        fetchGoals()
            .then(data => { setGoals(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (!newGoal.name || !newGoal.target || !newGoal.date) return;

        const today = new Date();
        const targetDate = new Date(newGoal.date);
        const diffMs = targetDate - today;
        const diffWeeks = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));

        try {
            const created = await createGoal({
                name: newGoal.name,
                target: parseInt(String(newGoal.target).replace(/\D/g, '')) || 0,
                saved: 0,
                targetDate: newGoal.date,
                weeksRemaining: diffWeeks,
            });
            setGoals(prev => [...prev, created]);
        } catch (err) { console.error(err); }

        setNewGoal({ name: '', target: '', date: '' });
        setShowForm(false);
    };

    const handleDelete = async (id) => {
        setGoals(prev => prev.filter(g => g.id !== id)); // optimistic
        await deleteGoal(id);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ahead': return 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.3)]';
            case 'on-track': return 'bg-warning shadow-[0_0_10px_rgba(245,158,11,0.3)]';
            case 'behind': return 'bg-danger shadow-[0_0_10px_rgba(239,68,68,0.3)]';
            default: return 'bg-borderDefault';
        }
    };

    return (
        <div className="w-full min-h-screen p-6 pt-24 md:pt-16 pb-32 md:pb-16 max-w-[1000px] mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="font-mono text-[11px] text-accent uppercase tracking-widest mb-2 block">/goals</span>
                    <h1 className="font-heading font-bold text-3xl md:text-[40px] text-textPrimary tracking-tight">{t('Your Financial Roadmap.')}</h1>
                    <h1 className="font-heading font-bold text-3xl tracking-tight text-textPrimary mb-8 hidden md:block">{t('Goals')}</h1>
                </div>
                {goals.length > 0 && (
                    <button
                        onClick={() => setShowForm(prev => !prev)}
                        className="inline-flex items-center gap-2 bg-accent hover:bg-accentHover text-bgBase font-heading font-semibold text-[13px] uppercase tracking-widest px-6 py-2.5 rounded-md transition-colors w-full md:w-auto justify-center"
                    >
                        <Plus size={16} className="stroke-[2.5px]" />
                        {t('Add Goal')}
                    </button>
                )}
            </header>

            {/* Add Goal Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        key="add-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-8"
                    >
                        <div className="bg-bgSurface border border-accent/30 rounded-[12px] p-6">
                            <h3 className="font-heading font-semibold text-textPrimary text-[16px] mb-5">{t('New Goal')}</h3>
                            <form onSubmit={handleAddGoal} className="flex flex-col md:flex-row items-end gap-6">
                                <div className="w-full flex-1">
                                    <label className="block font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-2">{t('Goal Name')}</label>
                                    <input
                                        type="text"
                                        value={newGoal.name}
                                        onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                                        placeholder={t('e.g. Trip to Manali')}
                                        className="w-full bg-[#161616] border border-borderSubtle rounded-md py-2.5 px-4 text-textPrimary font-body text-[15px] focus:outline-none focus:border-accent transition-colors"
                                    />
                                </div>
                                <div className="w-full md:w-[200px]">
                                    <label className="block font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-2">{t('Target Amount')}</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-textMuted text-[14px]">{currencySymbol}</span>
                                        <input
                                            type="text"
                                            value={newGoal.target}
                                            onChange={e => setNewGoal({ ...newGoal, target: formatInputStr(e.target.value) })}
                                            placeholder="0"
                                            className="w-full bg-[#161616] border border-borderSubtle rounded-md py-2.5 pl-10 pr-4 text-textPrimary font-body text-[15px] focus:outline-none focus:border-accent transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="w-full md:w-[200px]">
                                    <label className="block font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-2">{t('Target Date')}</label>
                                    <input
                                        type="date"
                                        min={minDateStr}
                                        value={newGoal.date}
                                        onChange={e => setNewGoal({ ...newGoal, date: e.target.value })}
                                        className="w-full bg-[#161616] border border-borderSubtle rounded-md py-2.5 px-4 text-textPrimary font-body text-[15px] focus:outline-none focus:border-accent transition-colors [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
                                    />
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button type="button" onClick={() => setShowForm(false)}
                                        className="h-[46px] px-5 border border-borderSubtle hover:border-borderDefault text-textSecondary font-heading font-semibold text-[13px] uppercase tracking-widest rounded-md transition-colors"
                                    >
                                        {t('Cancel')}
                                    </button>
                                    <button type="submit"
                                        className="h-[46px] bg-accent hover:bg-accentHover text-bgBase font-heading font-semibold text-[13px] uppercase tracking-widest px-6 rounded-md transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={16} className="stroke-[2.5px]" /> {t('Save Goal')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {goals.length === 0 && !showForm && (
                <EmptyGoals onAdd={() => setShowForm(true)} />
            )}

            {/* Goals List */}
            <div className="flex flex-col gap-6">
                {goals.map(goal => {
                    const progressPercent = Math.min(100, Math.round((goal.saved / goal.target) * 100));
                    const weeklyRequired = Math.ceil((goal.target - goal.saved) / Math.max(1, goal.weeksRemaining));
                    const isExpanded = expandedId === goal.id;

                    return (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-bgSurface border border-borderSubtle rounded-[12px] overflow-hidden hover:border-borderDefault transition-colors"
                        >
                            {/* Card Header */}
                            <div
                                className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                                onClick={() => setExpandedId(isExpanded ? null : goal.id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Target size={20} className="text-accent stroke-[1.5px]" />
                                        <h3 className="font-heading font-bold text-[20px] text-textPrimary">{goal.name}</h3>
                                    </div>

                                    <div className="flex items-center gap-4 font-mono text-[12px] text-textSecondary uppercase tracking-wider mb-6">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} className="stroke-[1.5px]" />
                                            {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                        </span>
                                        <span>•</span>
                                        <span>{goal.weeksRemaining} {t('Weeks left')}</span>
                                    </div>

                                    <div className="w-full space-y-2">
                                        <div className="flex justify-between font-mono text-[12px] tracking-wide">
                                            <span className="text-textPrimary">{formatCurrency(goal.saved)} {t('saved')}</span>
                                            <span className="text-textSecondary">{formatCurrency(goal.target)} {t('target')}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-bgElevated rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-accent to-accentHover rounded-full transition-all duration-700"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <div className="text-right font-mono text-[11px] text-textMuted">{progressPercent}% {t('complete')}</div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex items-center justify-between md:flex-col md:items-end md:justify-center border-t md:border-t-0 md:border-l border-borderSubtle pt-4 md:pt-0 md:pl-8 gap-4">
                                    <div className="flex flex-col md:items-end">
                                        <span className="font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-1">{t('Weekly Plan')}</span>
                                        <span className="font-mono text-[20px] text-accent font-medium">{formatCurrency(weeklyRequired)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(goal.id); }}
                                            className="p-2 text-textMuted hover:text-danger transition-colors"
                                            title="Delete goal"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="text-textMuted hover:text-textPrimary transition-colors p-2 bg-bgElevated rounded-full border border-borderSubtle md:border-transparent md:bg-transparent">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Section */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-borderSubtle bg-bgElevated/30"
                                    >
                                        <div className="p-6 md:p-8">
                                            <h4 className="font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-4">{t('Week-by-week Tracking')}</h4>
                                            {goal.history.length === 0 ? (
                                                <p className="font-body text-[13px] text-textMuted italic">{t('No tracking history yet. Check back after your first week.')}</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="border-b border-borderSubtle">
                                                                <th className="font-mono text-[11px] text-textMuted uppercase tracking-wider py-3 px-4 font-normal">{t('Week')}</th>
                                                                <th className="font-mono text-[11px] text-textMuted uppercase tracking-wider py-3 px-4 font-normal">{t('Target')}</th>
                                                                <th className="font-mono text-[11px] text-textMuted uppercase tracking-wider py-3 px-4 font-normal">{t('Actual Save')}</th>
                                                                <th className="font-mono text-[11px] text-textMuted uppercase tracking-wider py-3 px-4 font-normal text-right">{t('Status')}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {goal.history.map((record, idx) => (
                                                                <tr key={idx} className="border-b border-borderSubtle/50 last:border-0 hover:bg-bgElevated/50 transition-colors">
                                                                    <td className="font-mono text-[13px] text-textPrimary py-3 px-4">{t('Week')} {record.week}</td>
                                                                    <td className="font-mono text-[13px] text-textSecondary py-3 px-4">{formatCurrency(record.target)}</td>
                                                                    <td className="font-mono text-[13px] text-textPrimary py-3 px-4">{formatCurrency(record.actual)}</td>
                                                                    <td className="py-3 px-4">
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <span className="font-mono text-[11px] text-textSecondary uppercase tracking-widest hidden sm:inline">{record.status.replace('-', ' ')}</span>
                                                                            <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(record.status)}`} />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
