import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, BarChart3, Sparkles, TrendingUp, ChevronRight, X, Target, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchLatestReport, fetchGoals, createGoal, fetchCoachMessages, appendCoachMessage, clearCoachMessages } from '../lib/db';

const SYSTEM_PROMPT = `You are ArthSaathi, an AI financial coach for Indian youth. 
Provide practical, empathetic, and concise financial advice.
You must respond in valid JSON format exactly matching this schema:
{
  "content": "Your conversational response here",
  "tags": [
    { "type": "danger", "text": "Very short bad habit name" },
    { "type": "success", "text": "Very short positive suggestion" }
  ]
}
If no tags are needed, leave the tags array empty. Keep the response text short and conversational.`;

const REPORT_ANALYSIS_PROMPT = `You are ArthSaathi, an expert AI financial coach for Indian youth.
The user has shared their monthly financial report. Analyse it deeply and provide:
1. A brief assessment of their current financial health
2. SHORT-TERM actions (this month / next 30 days) — specific, actionable cost-cutting suggestions
3. LONG-TERM plan (3–12 months) — structured savings roadmap to build wealth
Also suggest 2–4 concrete savings goals the user should add — mix of short-term (1–3 months) and long-term (6–12 months).

Format your response as valid JSON:
{
  "content": "Your full analysis here. Use bullet points with • for lists. Separate sections with newlines. Be specific with amounts where possible.",
  "tags": [
    { "type": "danger", "text": "Bad habit / overspend area" },
    { "type": "success", "text": "Actionable improvement" }
  ],
  "suggested_goals": [
    {
      "name": "Emergency Fund",
      "target": 50000,
      "horizon": "long",
      "months": 6,
      "description": "3-month safety net covering essential expenses"
    }
  ]
}
horizon must be either "short" (1–3 months) or "long" (4+ months). months must be a realistic positive integer. target must be a number in Indian Rupees. Always return at least 2 suggested_goals. Be direct, practical, and motivating.`;

const CATEGORIES_META = {
    rent: 'Rent/Hostel',
    food: 'Food & Dining',
    upi: 'UPI/Online Spends',
    emis: 'EMIs',
    transport: 'Transport',
    entertainment: 'Entertainment',
    family: 'Family Remittances',
    subscriptions: 'Subscriptions',
    misc: 'Miscellaneous',
    savings: 'Savings / Investment',
};

function buildReportContext(report, goals) {
    const savings = report.income - report.totalExpenses;
    const savingsRate = Math.round((savings / report.income) * 100);
    const lines = [
        `Monthly Income: ₹${report.income.toLocaleString('en-IN')}`,
        `Total Expenses: ₹${report.totalExpenses.toLocaleString('en-IN')}`,
        `Net Savings: ₹${savings.toLocaleString('en-IN')} (${savingsRate}% savings rate)`,
        ``,
        `Expense Breakdown:`,
        ...Object.entries(report.expenses).map(([id, amt]) => {
            const label = CATEGORIES_META[id] || id;
            const pct = Math.round((Number(amt) / report.income) * 100);
            return `  • ${label}: ₹${Number(amt).toLocaleString('en-IN')} (${pct}% of income)`;
        }),
    ];
    if (goals && goals.length > 0) {
        lines.push('', 'Active Savings Goals:');
        goals.forEach(g => {
            const pct = Math.round((g.saved / g.target) * 100);
            lines.push(`  • ${g.name}: ₹${g.saved.toLocaleString('en-IN')} saved of ₹${g.target.toLocaleString('en-IN')} (${pct}%) — ${g.weeksRemaining} weeks remaining`);
        });
    }
    return lines.join('\n');
}

// ─── Goal Import Section ───────────────────────────────────────────────────
function GoalImportSection({ goals, formatCurrency }) {
    const [states, setStates] = useState(
        () => Object.fromEntries(goals.map((_, i) => [i, 'idle'])) // idle | loading | done
    );

    const handleImport = async (goal, idx) => {
        setStates(prev => ({ ...prev, [idx]: 'loading' }));
        try {
            const today = new Date();
            const targetDate = new Date(today);
            targetDate.setMonth(targetDate.getMonth() + (goal.months || 6));
            // Clamp to future date
            if (targetDate <= today) targetDate.setMonth(today.getMonth() + 1);
            const targetDateStr = targetDate.toISOString().split('T')[0];
            const diffMs = targetDate - today;
            const weeksRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));

            await createGoal({
                name: goal.name,
                target: Number(goal.target) || 10000,
                saved: 0,
                targetDate: targetDateStr,
                weeksRemaining,
            });
            setStates(prev => ({ ...prev, [idx]: 'done' }));
        } catch (err) {
            console.error(err);
            setStates(prev => ({ ...prev, [idx]: 'idle' }));
        }
    };

    return (
        <div className="bg-bgElevated border border-accent/20 rounded-[12px] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-accent" />
                <span className="font-mono text-[11px] text-accent uppercase tracking-widest">
                    {goals.length} Suggested Goal{goals.length > 1 ? 's' : ''} — Add to Goals
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goals.map((goal, idx) => {
                    const state = states[idx];
                    const isShort = goal.horizon === 'short';
                    const isDone = state === 'done';
                    const isLoading = state === 'loading';
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className={`bg-bgSurface border rounded-[10px] p-4 flex flex-col gap-2 transition-colors ${isDone ? 'border-success/30 bg-success/5' : 'border-borderDefault hover:border-accent/40'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded uppercase tracking-wider border ${isShort
                                            ? 'bg-warning/10 border-warning/30 text-warning'
                                            : 'bg-blue-400/10 border-blue-400/30 text-blue-400'
                                            }`}>
                                            {isShort ? '⚡ Short-term' : '📈 Long-term'}
                                        </span>
                                        <span className="font-mono text-[10px] text-textMuted">
                                            {goal.months} mo
                                        </span>
                                    </div>
                                    <p className="font-heading font-semibold text-textPrimary text-[14px] truncate">{goal.name}</p>
                                    {goal.description && (
                                        <p className="font-body text-[12px] text-textMuted mt-0.5 leading-snug line-clamp-2">{goal.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-1">
                                <span className="font-mono text-[14px] text-accent font-medium">
                                    {formatCurrency(Number(goal.target) || 0)}
                                </span>
                                <button
                                    onClick={() => handleImport(goal, idx)}
                                    disabled={isDone || isLoading}
                                    className={`flex items-center gap-1.5 font-heading font-semibold text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-md transition-all ${isDone
                                        ? 'bg-success/15 border border-success/30 text-success cursor-default'
                                        : isLoading
                                            ? 'bg-accent/10 border border-accent/20 text-accent cursor-wait'
                                            : 'bg-accent hover:bg-accentHover text-bgBase border border-accent'
                                        }`}
                                >
                                    {isDone ? (
                                        <><Check size={12} /> Added!</>
                                    ) : isLoading ? (
                                        <><Loader2 size={12} className="animate-spin" /> Adding...</>
                                    ) : (
                                        <><Target size={12} /> Add Goal</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            {Object.values(states).some(s => s === 'done') && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-body text-[12px] text-success text-center mt-1"
                >
                    ✓ Goals added! View them in the <a href="/goals" className="underline hover:text-textPrimary transition-colors">Goals page</a>.
                </motion.p>
            )}
        </div>
    );
}

export default function CoachPage() {
    const { lang, t, formatCurrency } = useLanguage();

    const INITIAL_CHAT = [
        {
            role: 'ai',
            content: t("Hi there! I'm ArthSaathi, your personal finance coach. I noticed your recent entry. Let's talk about your spending habits."),
            tags: []
        }
    ];

    const [messages, setMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [goalsData, setGoalsData] = useState([]);
    const [reportLoading, setReportLoading] = useState(true);
    const [showReportBanner, setShowReportBanner] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const messagesEndRef = useRef(null);

    // Load persisted messages from Supabase on mount
    useEffect(() => {
        fetchCoachMessages().then(stored => {
            setMessages(stored.length > 0 ? stored : INITIAL_CHAT);
        }).catch(() => {
            setMessages(INITIAL_CHAT);
        }).finally(() => setChatLoading(false));
    }, []);

    // Load report + goals
    useEffect(() => {
        Promise.all([fetchLatestReport(), fetchGoals()]).then(([report, goals]) => {
            setReportData(report);
            setGoalsData(goals || []);
            setReportLoading(false);
            if (report) setShowReportBanner(true);
        }).catch(() => setReportLoading(false));
    }, []);

    const handleClearChat = async () => {
        await clearCoachMessages();
        setMessages(INITIAL_CHAT);
        // Persist the fresh welcome message
        await appendCoachMessage({ role: 'ai', content: INITIAL_CHAT[0].content, tags: [] });
        setShowClearConfirm(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const callGroq = async (systemPrompt, messageHistory, userMessage) => {
        const apiMessages = [
            { role: 'system', content: systemPrompt + `\n\nRespond in: ${lang === 'EN' ? 'English' : lang === 'हिं' ? 'Hindi (Devanagari)' : lang === 'தமிழ்' ? 'Tamil' : 'Marathi'}` },
            ...messageHistory,
            { role: 'user', content: userMessage }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: apiMessages,
                response_format: { type: "json_object" },
                temperature: 0.7
            })
        });
        const data = await response.json();
        if (!data.choices?.[0]?.message) throw new Error("Invalid response format");
        const str = data.choices[0].message.content;
        try { return JSON.parse(str); } catch { return { content: str, tags: [] }; }
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;
        const userText = inputValue;
        const userMsg = { role: 'user', content: userText };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);
        // Persist user message
        appendCoachMessage({ role: 'user', content: userText });
        try {
            const history = messages.map(m => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.role === 'ai' ? JSON.stringify({ content: m.content, tags: m.tags }) : m.content
            }));
            const parsed = await callGroq(SYSTEM_PROMPT, history, userText);
            const aiMsg = {
                role: 'ai',
                content: parsed.content || "I'm having trouble right now.",
                tags: parsed.tags || []
            };
            setMessages(prev => [...prev, aiMsg]);
            // Persist AI response
            appendCoachMessage({ role: 'ai', content: aiMsg.content, tags: aiMsg.tags });
        } catch (error) {
            console.error(error);
            const errMsg = { role: 'ai', content: "Sorry, I'm having trouble connecting right now. Please check your API key.", tags: [] };
            setMessages(prev => [...prev, errMsg]);
            appendCoachMessage({ role: 'ai', content: errMsg.content, tags: [] });
        } finally {
            setIsTyping(false);
        }
    };

    const handleAnalyseReport = async () => {
        if (!reportData) return;
        setShowReportBanner(false);

        const context = buildReportContext(reportData, goalsData);
        const savings = reportData.income - reportData.totalExpenses;
        const savingsRate = Math.round((savings / reportData.income) * 100);

        const userMsg = {
            role: 'user',
            content: `📊 Monthly Report Shared\nIncome: ${formatCurrency(reportData.income)} | Expenses: ${formatCurrency(reportData.totalExpenses)} | Savings Rate: ${savingsRate}%`,
            isReportMsg: true
        };
        setMessages(prev => [...prev, userMsg]);
        appendCoachMessage({ role: 'user', content: userMsg.content, isReportMsg: true });
        setIsTyping(true);

        try {
            const parsed = await callGroq(
                REPORT_ANALYSIS_PROMPT,
                [],
                `Here is my monthly financial report:\n\n${context}\n\nPlease give me a full analysis with short-term and long-term saving plans.`
            );
            const aiMsg = {
                role: 'ai',
                content: parsed.content || "Could not generate analysis.",
                tags: parsed.tags || [],
                suggestedGoals: Array.isArray(parsed.suggested_goals) ? parsed.suggested_goals : [],
                isAnalysis: true
            };
            setMessages(prev => [...prev, aiMsg]);
            // Persist the analysis (suggestedGoals stored so they survive reload)
            appendCoachMessage({
                role: 'ai',
                content: aiMsg.content,
                tags: aiMsg.tags,
                suggestedGoals: aiMsg.suggestedGoals,
                isAnalysis: true
            });
        } catch (err) {
            console.error(err);
            const errMsg = { role: 'ai', content: "Could not analyse the report. Please try again.", tags: [] };
            setMessages(prev => [...prev, errMsg]);
            appendCoachMessage({ role: 'ai', content: errMsg.content, tags: [] });
        } finally {
            setIsTyping(false);
        }
    };

    const score = reportData ? (() => {
        const savingsRate = Math.max(0, ((reportData.income - reportData.totalExpenses) / reportData.income) * 100);
        const debtRatio = (Number(reportData.expenses?.emis) || 0) / reportData.income;
        return Math.min(100, Math.max(0, Math.round((savingsRate / 100) * 40 + Math.max(0, 1 - debtRatio) * 30 + 0.6 * 20 + 0.8 * 10)));
    })() : null;
    const grade = score !== null ? (score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C+' : score >= 40 ? 'C' : 'D') : null;

    return (
        <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden bg-bgBase pt-16 md:pt-0">

            {/* Sidebar Context Panel */}
            <div className="hidden lg:flex w-[360px] border-r border-borderSubtle bg-bgSurface flex-col p-6 overflow-y-auto">
                <h3 className="font-heading font-semibold text-textPrimary text-[15px] mb-6 uppercase tracking-widest text-center border-b border-borderSubtle pb-4">{t('Session Context')}</h3>

                {/* Monthly Report Card */}
                {reportLoading ? (
                    <div className="bg-bgElevated border border-borderSubtle rounded-[10px] p-5 mb-6 animate-pulse">
                        <div className="h-3 bg-borderDefault rounded w-24 mb-4" />
                        <div className="h-5 bg-borderDefault rounded w-32" />
                    </div>
                ) : reportData ? (
                    <div className="bg-bgElevated border border-accent/20 rounded-[10px] p-5 mb-4">
                        <span className="font-mono text-textSecondary text-[11px] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <BarChart3 size={12} className="text-accent" />
                            {t('Monthly Report')}
                        </span>
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <p className="font-mono text-[11px] text-textMuted uppercase">Income</p>
                                <p className="font-heading font-bold text-textPrimary text-[16px]">{formatCurrency(reportData.income)}</p>
                            </div>
                            {grade && (
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display text-[18px] border ${grade === 'A' ? 'border-success/30 bg-success/10 text-success' :
                                    grade === 'B' ? 'border-blue-400/30 bg-blue-400/10 text-blue-400' :
                                        grade.startsWith('C') ? 'border-warning/30 bg-warning/10 text-warning' :
                                            'border-danger/30 bg-danger/10 text-danger'
                                    }`}>{grade}</div>
                            )}
                        </div>
                        <div className="space-y-1 mb-4">
                            <div className="flex justify-between font-mono text-[11px]">
                                <span className="text-textMuted">Expenses</span>
                                <span className="text-textPrimary">{formatCurrency(reportData.totalExpenses)}</span>
                            </div>
                            <div className="flex justify-between font-mono text-[11px]">
                                <span className="text-textMuted">Savings</span>
                                <span className={reportData.income - reportData.totalExpenses >= 0 ? 'text-success' : 'text-danger'}>
                                    {formatCurrency(Math.abs(reportData.income - reportData.totalExpenses))}
                                </span>
                            </div>
                            <div className="flex justify-between font-mono text-[11px]">
                                <span className="text-textMuted">Health Score</span>
                                <span className="text-accent">{score}/100</span>
                            </div>
                        </div>
                        <button
                            onClick={handleAnalyseReport}
                            disabled={isTyping}
                            className="w-full bg-accent hover:bg-accentHover disabled:opacity-50 disabled:cursor-not-allowed text-bgBase font-heading font-semibold text-[12px] uppercase tracking-widest py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
                        >
                            <Sparkles size={14} />
                            Analyse with AI
                        </button>
                    </div>
                ) : (
                    <div className="bg-bgElevated border border-borderSubtle rounded-[10px] p-5 mb-6 text-center">
                        <BarChart3 size={24} className="text-textMuted mx-auto mb-2 stroke-[1.5px]" />
                        <p className="font-body text-[13px] text-textMuted mb-2">No report yet</p>
                        <a href="/dashboard" className="font-mono text-[11px] text-accent uppercase tracking-wider hover:underline">
                            Go to Dashboard →
                        </a>
                    </div>
                )}

                {/* Goals Summary */}
                {goalsData.length > 0 && (
                    <div className="bg-bgElevated border border-borderSubtle rounded-[10px] p-5 mb-6">
                        <span className="font-mono text-textSecondary text-[11px] uppercase tracking-wider mb-3 block flex items-center gap-2">
                            <TrendingUp size={12} className="text-accent inline mr-1" />{t('Active Goals')} ({goalsData.length})
                        </span>
                        <div className="flex flex-col gap-2">
                            {goalsData.slice(0, 3).map(g => {
                                const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
                                return (
                                    <div key={g.id}>
                                        <div className="flex justify-between font-body text-[12px] text-textSecondary mb-1">
                                            <span className="truncate pr-2">{g.name}</span>
                                            <span className="shrink-0 text-accent">{pct}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-bgSurface rounded-full overflow-hidden">
                                            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Key Insights */}
                <div className="bg-bgElevated border border-borderSubtle rounded-[10px] p-5 mb-6">
                    <span className="font-mono text-textSecondary text-[11px] uppercase tracking-wider mb-4 block">{t('Key Insights')}</span>
                    <ul className="flex flex-col gap-3">
                        <li className="font-body text-[13px] text-textSecondary flex items-start gap-2">
                            <span className="text-danger mt-1">●</span> {t('High frequency of small UPI transactions.')}
                        </li>
                        <li className="font-body text-[13px] text-textSecondary flex items-start gap-2">
                            <span className="text-warning mt-1">●</span> {t('Zero contributions to emergency fund.')}
                        </li>
                        <li className="font-body text-[13px] text-textSecondary flex items-start gap-2">
                            <span className="text-success mt-1">●</span> {t('Always pays EMIs on time.')}
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] relative overflow-hidden">

                {/* Chat Header */}
                <header className="shrink-0 h-16 border-b border-borderSubtle flex items-center justify-between px-6 bg-bgSurface/90 backdrop-blur-md z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-bgBase font-display text-[18px]">A</div>
                        <div>
                            <h2 className="font-heading font-semibold text-textPrimary text-[14px]">{t('Coach ArthSaathi')}</h2>
                            <span className="font-mono text-success text-[10px] uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> {t('Online')}
                            </span>
                        </div>
                    </div>
                    {/* Mobile: Analyse Report Button */}
                    {reportData && (
                        <button
                            onClick={handleAnalyseReport}
                            disabled={isTyping}
                            className="lg:hidden flex items-center gap-1.5 bg-accent/10 border border-accent/30 hover:bg-accent/20 text-accent font-heading font-semibold text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                        >
                            <Sparkles size={12} /> Analyse Report
                        </button>
                    )}
                </header>

                {/* Report banner — shown when a report is freshly loaded */}
                <AnimatePresence>
                    {showReportBanner && reportData && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="shrink-0 overflow-hidden z-10"
                        >
                            <div className="bg-accent/10 border-b border-accent/20 px-6 py-3 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <BarChart3 size={16} className="text-accent shrink-0" />
                                    <p className="font-body text-[13px] text-textSecondary">
                                        <span className="text-accent font-semibold">Monthly report found</span> — Ask ArthSaathi to analyse it and create a savings plan!
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={handleAnalyseReport}
                                        disabled={isTyping}
                                        className="flex items-center gap-1.5 bg-accent hover:bg-accentHover text-bgBase font-heading font-semibold text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                                    >
                                        <Sparkles size={12} /> Analyse
                                    </button>
                                    <button onClick={() => setShowReportBanner(false)} className="text-textMuted hover:text-textPrimary transition-colors p-1">
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Message Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-4 md:pt-8 pb-4 scroll-smooth">
                    <div className="max-w-3xl mx-auto flex flex-col gap-6">
                        {chatLoading ? (
                            // Skeleton while loading from Supabase
                            [1, 2, 3].map(i => (
                                <div key={i} className={`flex w-full ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
                                    {i % 2 !== 0 && <div className="w-8 h-8 rounded-full bg-bgElevated shrink-0 mr-3" />}
                                    <div className={`rounded-[12px] p-5 ${i % 2 !== 0 ? 'bg-bgSurface border border-borderSubtle w-[55%]' : 'bg-bgElevated w-[40%]'}`}>
                                        <div className="h-3 bg-borderDefault rounded w-full mb-2" />
                                        <div className="h-3 bg-borderDefault rounded w-3/4" />
                                    </div>
                                </div>
                            ))
                        ) : (
                        messages.map((msg, idx) => {
                            const isAi = msg.role === 'ai';
                            const isReportMsg = msg.isReportMsg;
                            const isAnalysis = msg.isAnalysis;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={idx}
                                    className={`flex w-full ${isAi ? 'justify-start' : 'justify-end'}`}
                                >
                                    {isAi && (
                                        <div className="w-8 h-8 rounded-full bg-accent shrink-0 flex items-center justify-center text-bgBase font-display text-[18px] mr-3 mt-1">A</div>
                                    )}
                                    <div className={`max-w-[85%] md:max-w-[75%] flex flex-col gap-2`}>
                                        {/* Report message badge */}
                                        {isReportMsg && (
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <BarChart3 size={12} className="text-accent" />
                                                <span className="font-mono text-[10px] text-accent uppercase tracking-widest">Report Shared</span>
                                            </div>
                                        )}
                                        {isAnalysis && (
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Sparkles size={12} className="text-accent" />
                                                <span className="font-mono text-[10px] text-accent uppercase tracking-widest">AI Analysis & Plan</span>
                                            </div>
                                        )}
                                        <div
                                            className={`p-4 md:p-5 font-body text-[15px] leading-[1.7] ${isAi
                                                ? isAnalysis
                                                    ? 'bg-bgSurface border border-accent/40 border-l-[3px] rounded-[12px_12px_12px_2px] text-textPrimary shadow-[0_4px_32px_rgba(255,77,0,0.08)]'
                                                    : 'bg-bgSurface border border-accent border-l-[2px] rounded-[12px_12px_12px_2px] text-textPrimary shadow-[0_4px_24px_rgba(0,0,0,0.2)]'
                                                : isReportMsg
                                                    ? 'bg-accent/10 border border-accent/30 rounded-[12px_12px_2px_12px] text-textPrimary'
                                                    : 'bg-bgElevated border border-borderDefault rounded-[12px_12px_2px_12px] text-textPrimary'
                                                }`}
                                        >
                                            {/* Render newlines + bullet points nicely */}
                                            {msg.content.split('\n').map((line, i) => (
                                                <span key={i} className={`block ${line.startsWith('•') ? 'pl-2' : ''} ${line === '' ? 'h-2' : ''}`}>
                                                    {line}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Tags */}
                                        {msg.tags && msg.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {msg.tags.map((tag, tIdx) => (
                                                    <span
                                                        key={tIdx}
                                                        className={`font-mono text-[11px] px-2.5 py-1 rounded-[4px] border uppercase tracking-wider ${tag.type === 'danger'
                                                            ? 'bg-danger/10 border-danger/30 text-danger'
                                                            : 'bg-success/10 border-success/30 text-success'
                                                            }`}
                                                    >
                                                        {tag.type === 'danger' ? '⚠ ' : '✓ '}{tag.text}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Goal Import Cards + Follow-up prompts */}
                                        {isAnalysis && (
                                            <div className="flex flex-col gap-3 mt-3">
                                                {/* Goal Import Cards */}
                                                {msg.suggestedGoals && msg.suggestedGoals.length > 0 && (
                                                    <GoalImportSection goals={msg.suggestedGoals} formatCurrency={formatCurrency} />
                                                )}
                                                {/* Quick follow-up prompts */}
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        'How do I start an emergency fund?',
                                                        'Give me a weekly budget template',
                                                        'Which expense should I cut first?'
                                                    ].map((prompt, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setInputValue(prompt)}
                                                            className="flex items-center gap-1 font-body text-[12px] text-textSecondary bg-bgElevated border border-borderSubtle hover:border-accent hover:text-accent px-3 py-1.5 rounded-full transition-colors"
                                                        >
                                                            <ChevronRight size={12} /> {prompt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                        )}

                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="w-8 h-8 rounded-full bg-accent shrink-0 flex items-center justify-center text-bgBase font-display text-[18px] mr-3 mt-1">A</div>
                                <div className="bg-bgSurface border border-accent border-l-[2px] rounded-[12px_12px_12px_2px] p-4 flex items-center gap-1.5 h-[56px]">
                                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-accent rounded-full" />
                                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-accent rounded-full" />
                                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-accent rounded-full" />
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="shrink-0 w-full bg-[#0a0a0a] pt-4 pb-6 md:pb-8 px-4 md:px-8 relative z-20 border-t border-borderSubtle">
                    <div className="hidden md:block absolute top-[-48px] left-0 w-full h-12 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
                    <div className="max-w-3xl mx-auto relative z-10">
                        <div className="bg-bgSurface border border-borderDefault rounded-[12px] p-2 flex items-end gap-2 focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(255,77,0,0.1)] transition-all shadow-xl">
                            <button className="p-3 text-textMuted hover:text-textPrimary transition-colors shrink-0">
                                <Mic size={20} className="stroke-[1.5px]" />
                            </button>
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder={t('Ask ArthSaathi anything about your finances...')}
                                className="w-full bg-transparent text-textPrimary font-body text-[15px] resize-none max-h-[120px] py-3 focus:outline-none placeholder:text-textMuted"
                                rows={1}
                                style={{ minHeight: '48px' }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isTyping}
                                className={`p-3 rounded-lg flex items-center justify-center shrink-0 transition-all ${inputValue.trim() && !isTyping
                                    ? 'bg-accent text-bgBase hover:bg-accentHover shadow-md'
                                    : 'bg-bgElevated text-textMuted cursor-not-allowed'
                                    }`}
                            >
                                <Send size={18} className="stroke-[2px] ml-0.5" />
                            </button>
                        </div>
                        <div className="text-center mt-3">
                            <span className="font-mono text-[10px] text-textMuted uppercase tracking-widest">{t('ArthSaathi AI can make mistakes. Check important info.')}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
