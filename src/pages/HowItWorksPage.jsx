import { motion } from 'framer-motion';

const STEPS = [
    {
        num: "01",
        title: "Take the Quiz",
        desc: "Answer 5 simple questions to reveal your spending personality and set your baseline."
    },
    {
        num: "02",
        title: "Log Daily Inputs",
        desc: "Manually enter your expenses across 8 tailored categories. Mindful friction helps reduce impulse buys."
    },
    {
        num: "03",
        title: "Chat with ArthSaathi",
        desc: "Get personalized roasts and realistic savings strategies based on your exact habits."
    }
];

export default function HowItWorksPage() {
    return (
        <div className="w-full min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">

            <div className="text-center mb-24 max-w-2xl mx-auto">
                <span className="font-mono text-[11px] text-accent uppercase tracking-widest mb-4 block">The Process</span>
                <h1 className="font-heading font-bold text-4xl md:text-5xl text-textPrimary mb-6">How It Works</h1>
                <p className="font-body text-[15px] text-textSecondary leading-relaxed">
                    A simple, mindful 3-step loop designed to change financial behavior rather than just tracking numbers.
                </p>
            </div>

            <div className="max-w-[1000px] w-full grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-borderSubtle z-0" />

                {STEPS.map((step, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.2 }}
                        viewport={{ once: true }}
                        key={idx}
                        className="relative z-10 flex flex-col items-center text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-bgBase border-2 border-accent flex items-center justify-center font-display text-[28px] text-accent mb-8 shadow-[0_0_20px_rgba(255,77,0,0.15)]">
                            {step.num}
                        </div>
                        <h3 className="font-heading font-semibold text-[20px] text-textPrimary mb-4">{step.title}</h3>
                        <p className="font-body text-[14px] text-textSecondary leading-relaxed max-w-[280px]">
                            {step.desc}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-32 max-w-3xl w-full bg-bgSurface border border-borderSubtle rounded-[16px] p-8 md:p-12 text-center">
                <h2 className="font-heading font-bold text-2xl md:text-3xl text-textPrimary mb-4">Ready to start?</h2>
                <p className="font-body text-[15px] text-textSecondary mb-8">Join thousands of others taking control of their finances.</p>
                <a href="/quiz" className="bg-accent hover:bg-accentHover text-bgBase font-heading font-bold text-[14px] uppercase tracking-widest px-8 py-4 rounded-md transition-colors inline-block">
                    Take the Free Quiz
                </a>
            </div>
        </div>
    );
}
