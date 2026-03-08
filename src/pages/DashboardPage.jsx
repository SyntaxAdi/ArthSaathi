import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, BarChart3, CalendarDays, Plus, Trash2, TrendingDown, Target } from 'lucide-react';
import {
    saveMonthlyReport,
    fetchDailyEntries, createDailyEntry, deleteDailyEntry,
    fetchGoals, updateGoalSaved,
    fetchCustomCategories, addCustomCategory, removeCustomCategory,
    fetchHiddenCategories, hideBaseCategory,
} from '../lib/db';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
    { id: 'rent', label: 'Rent/Hostel', color: '#ff4d00' },
    { id: 'food', label: 'Food & Dining', color: '#ff6a2a' },
    { id: 'upi', label: 'UPI/Online Spends', color: '#ff8554' },
    { id: 'emis', label: 'EMIs', color: '#ffa17e' },
    { id: 'transport', label: 'Transport', color: '#ffbda8' },
    { id: 'entertainment', label: 'Entertainment', color: '#ffd9d2' },
    { id: 'family', label: 'Family Remittances', color: '#ffeae5' },
    { id: 'subscriptions', label: 'Subscriptions', color: '#ffffff' },
    { id: 'misc', label: 'Miscellaneous', color: '#555555' },
    { id: 'savings', label: 'Savings / Investment', color: '#22c55e' },
];

const parseAmountStr = (val) => parseInt(String(val).replace(/\D/g, '')) || 0;

const CUSTOM_PALETTE = [
    '#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#facc15',
    '#fb923c', '#e879f9', '#38bdf8', '#4ade80', '#f87171',
];

function pickColor(count) {
    return CUSTOM_PALETTE[count % CUSTOM_PALETTE.length];
}

// Inline "Add Category" row — shared by both tabs
// NOTE: Must NOT use <form> here — this component is rendered inside another <form>
// in DailyTab, and nested forms are invalid HTML (causes page reload on submit).
function AddCategoryRow({ onAdd }) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');

    const handleAdd = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        onAdd(trimmed);
        setName('');
        setOpen(false);
    };

    return (
        <div className="mt-4 pt-4 border-t border-borderSubtle">
            {!open ? (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 text-textMuted hover:text-accent font-mono text-[12px] uppercase tracking-widest transition-colors"
                >
                    <Plus size={14} className="stroke-[2.5px]" /> {t('Add Custom Category')}
                </button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <input
                        autoFocus
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                        placeholder={t('e.g. Pet Care')}
                        className="flex-1 bg-[#161616] border border-accent/40 rounded-md py-2 px-4 text-textPrimary font-body text-[14px] focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="h-9 px-4 bg-accent hover:bg-accentHover text-bgBase font-heading font-semibold text-[12px] uppercase tracking-widest rounded-md transition-colors whitespace-nowrap"
                    >
                        {t('Add')}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setOpen(false); setName(''); }}
                        className="h-9 px-3 border border-borderSubtle hover:border-borderDefault text-textMuted rounded-md transition-colors text-[13px]"
                    >
                        {t('Cancel')}
                    </button>
                </motion.div>
            )}
        </div>
    );
}

function toDateStr(date) {
    return date.toISOString().split('T')[0];
}

// ─────────────────────────────────────────────
// MONTHLY TAB
// ─────────────────────────────────────────────
function MonthlyTab({ allCategories, onAddCategory, onDeleteCategory }) {
    const { t, formatCurrency, currencySymbol, formatInputStr } = useLanguage();
    const navigate = useNavigate();
    const [income, setIncome] = useState('');
    const [expenses, setExpenses] = useState(
        () => allCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: '' }), {})
    );

    // When a new custom category is added, ensure it has a slot in expenses
    useEffect(() => {
        setExpenses(prev => {
            const next = { ...prev };
            allCategories.forEach(cat => {
                if (!(cat.id in next)) next[cat.id] = '';
            });
            return next;
        });
    }, [allCategories]);

    const handleExpenseChange = (id, value) => {
        setExpenses(prev => ({ ...prev, [id]: formatInputStr(value) }));
    };

    const totalExpenses = useMemo(() =>
        Object.values(expenses).reduce((sum, val) => sum + parseAmountStr(val), 0),
        [expenses]);

    const incomeValue = parseAmountStr(income);
    const isOverspending = incomeValue > 0 && totalExpenses > incomeValue;

    const handleAnalyse = async () => {
        if (!income || incomeValue <= 0) {
            alert(t('Please enter a valid monthly income.'));
            return;
        }

        const expensesNumbers = Object.fromEntries(
            Object.entries(expenses).map(([k, v]) => [k, parseAmountStr(v)])
        );

        // Save to Supabase AND localStorage (ReportPage reads localStorage for now)
        const reportData = { income: incomeValue, expenses: expensesNumbers, totalExpenses, generatedAt: new Date().toISOString() };
        localStorage.setItem('arthsaathi_report', JSON.stringify(reportData));
        await saveMonthlyReport({ income: incomeValue, expenses: expensesNumbers, totalExpenses });
        navigate('/report');
    };

    // Donut chart
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    let currentOffset = 0;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Form */}
            <div className="xl:col-span-2">
                {/* Income */}
                <div className="bg-bgSurface border border-borderDefault rounded-[10px] p-6 mb-8 hover:border-accent transition-colors group">
                    <label className="block font-heading font-semibold text-textPrimary text-[15px] mb-4 uppercase tracking-widest">{t('Monthly Income')}</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-textMuted text-[15px]">{currencySymbol}</span>
                        <input
                            type="text"
                            value={income}
                            onChange={e => setIncome(formatInputStr(e.target.value))}
                            className="w-full bg-[#161616] border border-borderSubtle rounded-md py-3 pl-10 pr-4 text-textPrimary font-body text-[16px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                            placeholder="e.g. 45000"
                        />
                    </div>
                </div>

                {/* Expenses */}
                <div className="bg-bgSurface border border-borderDefault rounded-[10px] p-6 mb-8">
                    <label className="block font-heading font-semibold text-textPrimary text-[15px] mb-6 uppercase tracking-widest">{t('Monthly Expenses')}</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {allCategories.map(cat => {
                            const isProtected = cat.id === 'savings';
                            const atMinimum = allCategories.length <= 8;
                            const canDelete = !isProtected && !atMinimum;
                            return (
                                <div key={cat.id} className="flex flex-col gap-2 group/field">
                                    <label className="font-mono text-[12px] text-textSecondary uppercase tracking-wide flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cat.color }} />
                                            {cat.label}
                                            {isProtected && (
                                                <span className="text-[10px] text-success/70 font-mono normal-case tracking-normal">{t('required')}</span>
                                            )}
                                        </span>
                                        {canDelete && (
                                            <button
                                                type="button"
                                                title={t('Remove category')}
                                                onClick={() => onDeleteCategory(cat.id)}
                                                className="opacity-0 group-hover/field:opacity-100 text-textMuted hover:text-danger transition-all p-0.5 rounded"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                        {!canDelete && !isProtected && atMinimum && (
                                            <span title={t('Minimum 8 categories required')} className="opacity-0 group-hover/field:opacity-100 font-mono text-[10px] text-textMuted cursor-not-allowed">{t('min 8')}</span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-textMuted text-[14px]">{currencySymbol}</span>
                                        <input
                                            type="text"
                                            value={expenses[cat.id] || ''}
                                            onChange={e => handleExpenseChange(cat.id, e.target.value)}
                                            className="w-full bg-[#161616] border border-borderSubtle rounded-md py-2.5 pl-10 pr-4 text-textPrimary font-body text-[15px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <AddCategoryRow onAdd={onAddCategory} />

                    {isOverspending && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-8 bg-danger/10 border border-danger/20 rounded-md p-4 flex items-start gap-3"
                        >
                            <AlertCircle size={20} className="text-danger mt-0.5" />
                            <div>
                                <h4 className="font-heading font-semibold text-danger text-[14px]">{t("You're spending more than you earn!")}</h4>
                                <p className="font-body text-textSecondary text-[13px] mt-1">
                                    {t('Total expenses')} ({formatCurrency(totalExpenses)}) {t('exceed your income')} ({formatCurrency(incomeValue)}).
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>

                <button
                    onClick={handleAnalyse}
                    className="w-full bg-accent hover:bg-accentHover text-bgBase font-heading font-semibold text-[13px] uppercase tracking-widest py-4 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                    <BarChart3 size={18} /> {t('Analyse My Finances')}
                </button>
            </div>

            {/* Donut Chart */}
            <div className="hidden xl:flex flex-col">
                <div className="sticky top-24 bg-bgSurface border border-borderDefault rounded-[10px] p-8 pb-10 flex flex-col items-center">
                    <h3 className="w-full font-heading font-semibold text-textPrimary text-[15px] mb-8 uppercase tracking-widest text-center border-b border-borderSubtle pb-4">{t('Spending Summary')}</h3>
                    <div className="relative w-[280px] h-[280px] flex items-center justify-center mb-8">
                        <svg width="280" height="280" viewBox="0 0 280 280" className="transform -rotate-90">
                            {totalExpenses === 0 ? (
                                <circle cx="140" cy="140" r={radius} fill="none" stroke="#1f1f1f" strokeWidth="24" />
                            ) : (
                                allCategories.map(cat => {
                                    const val = parseInt(expenses[cat.id]) || 0;
                                    if (val === 0) return null;
                                    const strokeDasharray = `${(val / totalExpenses) * circumference} ${circumference}`;
                                    const strokeDashoffset = -currentOffset;
                                    currentOffset += (val / totalExpenses) * circumference;
                                    return (
                                        <circle key={cat.id} cx="140" cy="140" r={radius}
                                            fill="none" stroke={cat.color} strokeWidth="24"
                                            strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
                                            className="transition-all duration-500 ease-in-out"
                                        />
                                    );
                                })
                            )}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="font-mono text-textSecondary text-[11px] uppercase tracking-widest mb-1">{t('Total Spent')}</span>
                            <span className="font-display text-[40px] text-textPrimary leading-none">
                                {currencySymbol}{totalExpenses > 0 ? (totalExpenses / 1000).toFixed(totalExpenses >= 100000 ? 1 : 0) + 'k' : '0'}
                            </span>
                        </div>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-x-4 gap-y-3">
                        {allCategories.filter(c => parseInt(expenses[c.id]) > 0).slice(0, 6).map(cat => (
                            <div key={cat.id} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                <span className="font-body text-[13px] text-textSecondary truncate">{cat.label}</span>
                            </div>
                        ))}
                    </div>
                    {totalExpenses === 0 && (
                        <p className="font-body text-[13px] text-textMuted text-center">{t('Enter expenses to see your breakdown.')}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// DAILY TAB
// ─────────────────────────────────────────────
function DailyTab({ allCategories, onAddCategory, onDeleteCategory }) {
    const { t, formatCurrency, currencySymbol, formatInputStr } = useLanguage();
    const today = toDateStr(new Date());
    const [date, setDate] = useState(today);
    const [entry, setEntry] = useState({ category: 'food', amount: '', description: '', goalId: '' });
    const [entries, setEntries] = useState([]);
    const [goals, setGoals] = useState([]);
    const [savedToGoal, setSavedToGoal] = useState(false);
    const [showManage, setShowManage] = useState(false);

    // Load goals and daily entries from Supabase
    useEffect(() => {
        fetchGoals().then(setGoals);
        fetchDailyEntries().then(setEntries);
    }, []);

    const todayEntries = entries.filter(e => e.date === date);
    const todayTotal = todayEntries.reduce((sum, e) => sum + e.amount, 0);

    const handleAddEntry = async (e) => {
        e.preventDefault();
        const amt = parseAmountStr(entry.amount);
        if (!amt || amt <= 0) return;

        const cat = allCategories.find(c => c.id === entry.category);
        const goalId = (savedToGoal && entry.category === 'savings' && entry.goalId)
            ? parseInt(entry.goalId) : null;

        try {
            const created = await createDailyEntry({
                date,
                category: entry.category,
                categoryLabel: cat?.label || entry.category,
                categoryColor: cat?.color || '#888',
                amount: amt,
                description: entry.description,
                goalId,
            });
            setEntries(prev => [created, ...prev]);

            // Update goal saved amount in Supabase
            if (goalId) {
                const goal = goals.find(g => g.id === goalId);
                if (goal) {
                    const newSaved = (goal.saved || 0) + amt;
                    await updateGoalSaved(goalId, newSaved);
                    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, saved: newSaved } : g));
                }
            }
        } catch (err) { console.error(err); }

        setEntry(prev => ({ ...prev, amount: '', description: '' }));
        setSavedToGoal(false);
    };

    const handleDelete = async (id) => {
        const toDelete = entries.find(e => e.id === id);
        setEntries(prev => prev.filter(e => e.id !== id));
        await deleteDailyEntry(id);

        // Reverse goal saved amount
        if (toDelete?.goalId) {
            const goal = goals.find(g => g.id === toDelete.goalId);
            if (goal) {
                const newSaved = Math.max(0, (goal.saved || 0) - toDelete.amount);
                await updateGoalSaved(toDelete.goalId, newSaved);
                setGoals(prev => prev.map(g => g.id === toDelete.goalId ? { ...g, saved: newSaved } : g));
            }
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Entry Form */}
            <div className="xl:col-span-2">
                <div className="bg-bgSurface border border-borderDefault rounded-[10px] p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <CalendarDays size={18} className="text-accent stroke-[1.5px]" />
                        <h3 className="font-heading font-semibold text-textPrimary text-[16px]">{t('Log an Expense')}</h3>
                    </div>

                    <form onSubmit={handleAddEntry} className="flex flex-col gap-5">
                        {/* Date */}
                        <div>
                            <label className="block font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-2">{t('Date')}</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                max={today}
                                className="w-full md:w-[220px] bg-[#161616] border border-borderSubtle rounded-md py-2.5 px-4 text-textPrimary font-body text-[15px] focus:outline-none focus:border-accent transition-colors [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Category */}
                            <div>
                                <label className="block font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-2">{t('Category')}</label>
                                <select
                                    value={entry.category}
                                    onChange={e => setEntry(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full bg-[#161616] border border-borderSubtle rounded-md py-2.5 px-4 text-textPrimary font-body text-[15px] focus:outline-none focus:border-accent transition-colors"
                                >
                                    {allCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                                <div className="mt-2">
                                    <AddCategoryRow onAdd={onAddCategory} />
                                </div>
                                {/* Manage / Delete Categories */}
                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowManage(p => !p)}
                                        className="font-mono text-[11px] text-textMuted hover:text-accent uppercase tracking-widest transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 size={12} /> {showManage ? t('Hide') : t('Manage')} {t('Categories')}
                                    </button>
                                    <AnimatePresence>
                                        {showManage && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-3 bg-bgElevated border border-borderSubtle rounded-[8px] p-3 flex flex-col gap-1 overflow-hidden"
                                            >
                                                {allCategories.map(cat => (
                                                    <div key={cat.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-bgSurface group/row transition-colors">
                                                        <span className="flex items-center gap-2 font-body text-[13px] text-textSecondary">
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                                            {cat.label}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => onDeleteCategory(cat.id)}
                                                            className="opacity-0 group-hover/row:opacity-100 text-textMuted hover:text-danger transition-all p-1 rounded"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-2">{t('Amount')}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-textMuted text-[14px]">{currencySymbol}</span>
                                    <input
                                        type="text"
                                        value={entry.amount}
                                        onChange={e => setEntry(prev => ({ ...prev, amount: formatInputStr(e.target.value) }))}
                                        placeholder="0"
                                        className="w-full bg-[#161616] border border-borderSubtle rounded-md py-2.5 pl-10 pr-4 text-textPrimary font-body text-[15px] focus:outline-none focus:border-accent transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-2">{t('Description')} <span className="lowercase normal-case text-textMuted">({t('optional')})</span></label>
                            <input
                                type="text"
                                value={entry.description}
                                onChange={e => setEntry(prev => ({ ...prev, description: e.target.value }))}
                                placeholder={t('e.g. Lunch at canteen')}
                                className="w-full bg-[#161616] border border-borderSubtle rounded-md py-2.5 px-4 text-textPrimary font-body text-[15px] focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>

                        {/* Link to Goal (only if Savings category) */}
                        {entry.category === 'savings' && goals.length > 0 && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                className="bg-bgElevated border border-accent/20 rounded-[8px] p-4"
                            >
                                <label className="flex items-center gap-3 cursor-pointer mb-3">
                                    <input type="checkbox" checked={savedToGoal} onChange={e => setSavedToGoal(e.target.checked)}
                                        className="rounded border-borderSubtle bg-transparent text-accent focus:ring-accent h-4 w-4"
                                    />
                                    <span className="font-body text-[14px] text-textPrimary flex items-center gap-2">
                                        <Target size={14} className="text-accent" /> {t('Count this toward a Goal')}
                                    </span>
                                </label>
                                {savedToGoal && (
                                    <select
                                        value={entry.goalId}
                                        onChange={e => setEntry(prev => ({ ...prev, goalId: e.target.value }))}
                                        className="w-full bg-[#161616] border border-borderSubtle rounded-md py-2.5 px-4 text-textPrimary font-body text-[14px] focus:outline-none focus:border-accent transition-colors"
                                    >
                                        <option value="">— {t('Select a Goal')} —</option>
                                        {goals.map(g => (
                                            <option key={g.id} value={g.id}>{g.name} ({formatCurrency(g.target - g.saved)} {t('remaining')})</option>
                                        ))}
                                    </select>
                                )}
                            </motion.div>
                        )}

                        <button type="submit"
                            className="w-full bg-accent hover:bg-accentHover text-bgBase font-heading font-semibold text-[13px] uppercase tracking-widest py-3.5 rounded-md transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={16} className="stroke-[2.5px]" /> {t('Log Entry')}
                        </button>
                    </form>
                </div>

                {/* Today's Entries */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading font-semibold text-textPrimary text-[16px]">
                            {t('Entries for')} {date === today ? t('Today') : new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                        </h3>
                        {todayEntries.length > 0 && (
                            <span className="font-mono text-[13px] text-accent">{formatCurrency(todayTotal)}</span>
                        )}
                    </div>

                    {todayEntries.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-borderSubtle rounded-[10px]">
                            <TrendingDown size={28} className="text-textMuted mx-auto mb-3 stroke-[1.5px]" />
                            <p className="font-body text-textMuted text-[14px]">{t('No entries for this date yet.')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <AnimatePresence>
                                {todayEntries.map(e => (
                                    <motion.div key={e.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="bg-bgSurface border border-borderSubtle rounded-[8px] px-5 py-4 flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: e.categoryColor }} />
                                            <div>
                                                <span className="font-body text-[15px] text-textPrimary">{e.description || e.categoryLabel}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="font-mono text-[11px] text-textMuted uppercase">{e.categoryLabel}</span>
                                                    {e.goalId && (
                                                        <span className="font-mono text-[10px] text-accent border border-accent/30 px-1.5 py-0.5 rounded">→ {t('Goal')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="font-mono text-[15px] text-textPrimary">{formatCurrency(e.amount)}</span>
                                            <button onClick={() => handleDelete(e.id)} className="text-textMuted hover:text-danger transition-colors">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Goals Progress sidebar */}
            <div className="hidden xl:flex flex-col gap-4">
                <div className="sticky top-24">
                    <h3 className="font-heading font-semibold text-textPrimary text-[15px] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Target size={16} className="text-accent" /> {t('Goal Progress')}
                    </h3>
                    {goals.length === 0 ? (
                        <div className="bg-bgSurface border border-borderSubtle rounded-[10px] p-6 text-center">
                            <p className="font-body text-[13px] text-textMuted">{t('No goals set yet.')}</p>
                            <a href="/goals" className="text-accent text-[13px] font-semibold hover:underline mt-2 inline-block">{t('Set a goal')} →</a>
                        </div>
                    ) : (
                        goals.map(g => {
                            const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
                            return (
                                <div key={g.id} className="bg-bgSurface border border-borderSubtle rounded-[10px] p-5 mb-4 hover:border-borderDefault transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="font-heading font-semibold text-textPrimary text-[14px] truncate pr-2">{g.name}</span>
                                        <span className="font-mono text-[13px] text-accent shrink-0">{pct}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-bgElevated rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-gradient-to-r from-accent to-accentHover rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="flex justify-between font-mono text-[11px] text-textMuted">
                                        <span>{formatCurrency(g.saved || 0)}</span>
                                        <span>{formatCurrency(g.target)}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function DashboardPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('monthly');
    const [customCategories, setCustomCategories] = useState([]);
    const [hiddenBaseCategories, setHiddenBaseCategories] = useState([]);

    // Load category prefs from Supabase on mount
    useEffect(() => {
        fetchCustomCategories().then(setCustomCategories);
        fetchHiddenCategories().then(setHiddenBaseCategories);
    }, []);

    // Merge base (minus hidden) + custom
    const allCategories = [
        ...CATEGORIES.filter(c => !hiddenBaseCategories.includes(c.id)),
        ...customCategories,
    ];

    const handleAddCategory = async (label) => {
        const id = 'custom_' + label.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        const color = pickColor(customCategories.length);
        const newCat = { id, label, color, custom: true };
        setCustomCategories(prev => [...prev, newCat]);       // optimistic UI update
        await addCustomCategory(newCat);                       // persist to Supabase
    };

    const handleDeleteCategory = async (id) => {
        if (customCategories.find(c => c.id === id)) {
            setCustomCategories(prev => prev.filter(c => c.id !== id));  // optimistic
            await removeCustomCategory(id);
        } else {
            // It's a base category — hide it
            setHiddenBaseCategories(prev => [...prev, id]);              // optimistic
            await hideBaseCategory(id);
        }
    };

    const tabs = [
        { id: 'monthly', label: t('Monthly'), icon: BarChart3 },
        { id: 'daily', label: t('Daily Tracker'), icon: CalendarDays },
    ];

    return (
        <div className="w-full min-h-screen p-6 pt-24 md:pt-16 pb-32 md:pb-16 max-w-[1200px] mx-auto">
            <header className="mb-10">
                <span className="font-mono text-[11px] text-accent uppercase tracking-widest mb-2 block">/dashboard</span>
                <h1 className="font-heading font-bold text-3xl md:text-[40px] text-textPrimary mb-3">
                    {activeTab === 'monthly' ? t('Input your monthly numbers.') : t('Track your daily spending.')}
                </h1>
                <p className="font-body text-textSecondary text-[15px]">
                    {activeTab === 'monthly'
                        ? t('Fill in your income and monthly expenses to generate your financial health report.')
                        : t('Log daily expenses and allocate savings toward your goals in real time.')}
                </p>
            </header>

            {/* Tab Switcher */}
            <div className="flex h-12 items-center justify-start rounded-xl bg-bgSurface p-1.5 border border-borderSubtle mb-10 w-full md:w-auto inline-flex">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 h-full rounded-lg font-heading font-semibold text-[13px] uppercase tracking-wider transition-all duration-200 whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'bg-bgElevated text-accent shadow-sm'
                                    : 'text-textSecondary hover:text-textPrimary'
                                }`}
                        >
                            <Icon size={15} className="stroke-[1.5px]" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                >
                    {activeTab === 'monthly'
                        ? <MonthlyTab allCategories={allCategories} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />
                        : <DailyTab allCategories={allCategories} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
