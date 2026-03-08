import { motion } from 'framer-motion';
import { Bot, LineChart, Target, Shield, Languages, Zap } from 'lucide-react';

const FEATURES = [
    {
        icon: <Bot size={24} className="text-accent" />,
        title: "Contextual AI Coach",
        desc: "ArthSaathi remembers your past expenses and connects the dots to spot bad habits automatically."
    },
    {
        icon: <Languages size={24} className="text-accent" />,
        title: "Speaks Your Language",
        desc: "Switch between English, Hindi, and Punjabi instantly. Financial advice that feels like home."
    },
    {
        icon: <LineChart size={24} className="text-accent" />,
        title: "Indian Spending Categories",
        desc: "Pre-built for students & gig workers: UPI leaks, EMIs, PG Rent, and family remittances."
    },
    {
        icon: <Target size={24} className="text-accent" />,
        title: "Micro-Goal Tracker",
        desc: "Save up for a new laptop or your next trip with breakdown targets tied directly to your habits."
    },
    {
        icon: <Zap size={24} className="text-accent" />,
        title: "Instant Interventions",
        desc: "Get nudged exactly when you overspend on Swiggy or cross your weekend entertainment budget."
    },
    {
        icon: <Shield size={24} className="text-accent" />,
        title: "No Bank Linking Required",
        desc: "Manual entry designed to make you mindful of every rupee. No scary bank integrations."
    }
];

export default function FeaturesPage() {
    return (
        <div className="w-full min-h-screen pt-32 pb-24 px-6 relative flex flex-col items-center">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="text-center mb-16 relative z-10 max-w-2xl mx-auto">
                <h1 className="font-heading font-bold text-4xl md:text-5xl text-textPrimary mb-4">Powerful Features. <br /><span className="text-textSecondary">Simple Tracking.</span></h1>
                <p className="font-body text-[15px] text-textSecondary leading-relaxed">
                    Everything you need to stop living paycheck to paycheck and start building wealth, designed specifically for early-career Indians.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1000px] w-full relative z-10">
                {FEATURES.map((feat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        key={idx}
                        className="bg-bgSurface border border-borderSubtle p-8 rounded-[16px] hover:border-accent hover:shadow-[0_0_30px_rgba(255,77,0,0.1)] transition-all duration-300 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            {feat.icon}
                        </div>
                        <h3 className="font-heading font-semibold text-[18px] text-textPrimary mb-3">{feat.title}</h3>
                        <p className="font-body text-[13px] text-textSecondary leading-relaxed">{feat.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
