import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Target, FileText, CheckCircle, BarChart3, Globe2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    const stats = [
        { number: '65M+', label: 'First-Time Earners' },
        { number: '8', label: 'Expense Categories' },
        { number: '3', label: 'Languages' },
        { number: 'Free', label: 'Forever' },
    ];

    const features = [
        { icon: BrainCircuit, title: 'AI Coach', desc: 'Context-aware suggestions based on your unique spending habits.' },
        { icon: Target, title: 'Goal Tracker', desc: 'Set tangible goals and get a week-by-week roadmap to hit them.' },
        { icon: FileText, title: 'Report Card', desc: 'Get graded on your financial health with actionable improvements.' },
        { icon: CheckCircle, title: 'Spending Quiz', desc: 'Discover if you are a Spender, Saver, or Impulsive Buyer.' },
        { icon: BarChart3, title: 'Peer Compare', desc: 'See how your savings rate stacks up against others in your bracket.' },
        { icon: Globe2, title: 'Multilingual', desc: 'Speak to your coach in English, Hindi, or Punjabi natively.' },
    ];

    const steps = [
        { num: '01', title: 'Input', desc: 'Log your monthly income and expenses across 8 Indian-specific categories.' },
        { num: '02', title: 'Analyse', desc: 'Our LLM analyzes patterns, identifies bad habits, and scores your financial health.' },
        { num: '03', title: 'Act', desc: 'Follow personalized, week-by-week roadmaps to achieve your savings goals.' },
    ];

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="w-full relative overflow-hidden text-textPrimary">
            {/* Background Glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1200px] pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(ellipse 800px 400px at 50% 0%, rgba(255,77,0,0.06), transparent)'
                }}
            />

            <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                {/* Hero Section */}
                <section className="pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center text-center">
                    <span className="font-mono text-accent text-[11px] mb-6 uppercase tracking-wider bg-bgCode border border-borderSubtle px-3 py-1 rounded-full">
                        /financial-intelligence
                    </span>
                    <h1 className="font-display text-4xl md:text-6xl lg:text-[72px] leading-[1.1] mb-6 max-w-4xl tracking-tight">
                        Your Personal Finance Coach — Built for Bharat.
                    </h1>
                    <p className="font-body text-textSecondary text-lg md:text-[17px] mb-10 max-w-2xl leading-[1.7]">
                        Stop struggling with confusing pie charts. Talk to an AI that understands Indian expenses — from UPI payments to family remittances — and builds a custom savings plan for you.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Link to="/quiz" className="bg-accent hover:bg-accentHover text-bgBase font-heading font-semibold text-[13px] uppercase tracking-widest px-8 py-3.5 rounded-md transition-colors w-full sm:w-auto text-center">
                            Get My Analysis
                        </Link>
                        <Link to="/report?sample=true" className="bg-transparent border border-borderDefault hover:border-accent hover:text-accent text-textPrimary font-heading font-semibold text-[13px] uppercase tracking-widest px-8 py-3.5 rounded-md transition-colors w-full sm:w-auto text-center">
                            See Sample Report
                        </Link>
                    </div>
                </section>

                {/* Stats Strip */}
                <section className="border-t border-b border-borderSubtle py-8 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 bg-bgSurface/20">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center w-full px-4 border-b md:border-b-0 md:border-r border-borderSubtle last:border-0 pb-8 md:pb-0">
                            <span className="font-heading font-bold text-3xl md:text-[32px] text-textPrimary mb-1">{stat.number}</span>
                            <span className="font-mono text-textSecondary text-[11px] uppercase tracking-wide">{stat.label}</span>
                        </div>
                    ))}
                </section>

                {/* Features Section */}
                <section className="py-24 md:py-32 bg-bgBase">
                    <div className="flex flex-col items-center text-center mb-16">
                        <span className="font-mono text-textSecondary text-[11px] uppercase tracking-wider mb-4">/why-arthsaathi</span>
                        <h2 className="font-heading font-bold text-3xl md:text-[32px] tracking-tight">Not a pie chart. A conversation.</h2>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {features.map((feat, idx) => {
                            const Icon = feat.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    variants={itemVariant}
                                    className="bg-bgSurface border border-borderSubtle rounded-[10px] p-8 hover:border-borderDefault transition-colors group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                                    <div className="bg-bgElevated w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                        <Icon className="text-accent stroke-[1.5px]" size={24} />
                                    </div>
                                    <h4 className="font-heading font-semibold text-lg mb-3 text-textPrimary">{feat.title}</h4>
                                    <p className="font-body text-textSecondary text-[15px] leading-relaxed">{feat.desc}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </section>

                {/* How It Works Section */}
                <section className="py-24 md:py-32 bg-bgSurface rounded-2xl md:rounded-[32px] px-8 md:px-16 border border-borderSubtle mb-24 relative overflow-hidden">
                    <div className="flex flex-col items-center text-center mb-20 relative z-10">
                        <span className="font-mono text-textSecondary text-[11px] uppercase tracking-wider mb-4">/how-it-works</span>
                        <h2 className="font-heading font-bold text-3xl md:text-[32px] tracking-tight">Path to Financial Independence</h2>
                    </div>

                    <div className="relative z-10">
                        <div className="hidden md:block absolute top-[28px] left-[10%] w-[80%] h-[1px] border-t border-dashed border-borderDefault" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                            {steps.map((step, idx) => (
                                <div key={idx} className="relative flex flex-col items-center text-center group">
                                    <div className="w-14 h-14 rounded-full bg-bgElevated border border-borderDefault flex items-center justify-center text-accent font-mono text-sm mb-6 z-10 group-hover:border-accent transition-colors">
                                        {step.num}
                                    </div>
                                    <h4 className="font-heading font-semibold text-lg mb-3 text-textPrimary">{step.title}</h4>
                                    <p className="font-body text-textSecondary text-[14px] leading-relaxed max-w-[260px] mx-auto">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="w-full bg-bgBase border-t border-borderSubtle pt-16 pb-8">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                        <div>
                            <Link to="/" className="text-white font-display text-2xl tracking-wide flex items-center gap-2 mb-4">
                                <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(255,77,0,0.3)]" />
                                <span className="flex items-baseline">ArthSaathi<span className="text-accent">.</span></span>
                            </Link>
                            <p className="font-body text-textSecondary text-[15px] max-w-sm">
                                Your personal finance coach, built specifically for India's first-time earners.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-8 md:justify-end">
                            <div className="flex flex-col gap-3">
                                <span className="font-mono text-[11px] text-textMuted uppercase mb-1">Product</span>
                                <Link to="/features" className="font-body text-[14px] text-textSecondary hover:text-accent transition-colors">Features</Link>
                                <Link to="/report?sample=true" className="font-body text-[14px] text-textSecondary hover:text-accent transition-colors">Sample Report</Link>
                                <Link to="/quiz" className="font-body text-[14px] text-textSecondary hover:text-accent transition-colors">Spending Quiz</Link>
                            </div>
                            <div className="flex flex-col gap-3">
                                <span className="font-mono text-[11px] text-textMuted uppercase mb-1">Company</span>
                                <Link to="#" className="font-body text-[14px] text-textSecondary hover:text-accent transition-colors">About Us</Link>
                                <Link to="#" className="font-body text-[14px] text-textSecondary hover:text-accent transition-colors">Contact</Link>
                                <Link to="#" className="font-body text-[14px] text-textSecondary hover:text-accent transition-colors">Privacy Policy</Link>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-borderSubtle pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="font-body text-[13px] text-textMuted">
                            © {new Date().getFullYear()} ArthSaathi. All rights reserved.
                        </p>
                        <div className="flex bg-bgElevated border border-borderSubtle py-1.5 px-3 rounded-md items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="font-mono text-[11px] text-textSecondary uppercase">System Operational</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
