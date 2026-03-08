import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const questions = [
    {
        id: 1,
        text: "When you receive your monthly income, what's your first move?",
        options: [
            { text: "Transfer to savings immediately.", type: "saver" },
            { text: "Pay off rent and bills first.", type: "neutral" },
            { text: "Head straight to Swiggy/Zomato or a weekend plan.", type: "spender" },
            { text: "I don't really have a plan, it just vanishes.", type: "impulsive" }
        ]
    },
    {
        id: 2,
        text: "How do you usually handle your UPI spends?",
        options: [
            { text: "Track every rupee on a spreadsheet/app.", type: "saver" },
            { text: "Check balance at month-end.", type: "neutral" },
            { text: "Keep scanning until the transaction declines.", type: "impulsive" },
            { text: "Mostly on food, cafes, and small impulse buys.", type: "spender" }
        ]
    },
    {
        id: 3,
        text: "A new gadget or sneaker just dropped that you like. Do you...",
        options: [
            { text: "Buy it instantly, YOLO.", type: "impulsive" },
            { text: "Wait for a sale or EMI offer.", type: "spender" },
            { text: "Save up for it over a few months.", type: "neutral" },
            { text: "Ignore it, I only buy what I need.", type: "saver" }
        ]
    },
    {
        id: 4,
        text: "How do you manage EMIs or debt?",
        options: [
            { text: "I don't have any debt.", type: "saver" },
            { text: "I pay my EMIs on time every month.", type: "neutral" },
            { text: "I often convert basic purchases to EMIs.", type: "spender" },
            { text: "I lose track and pay late fees.", type: "impulsive" }
        ]
    },
    {
        id: 5,
        text: "If you had an unexpected major expense tomorrow, would you...",
        options: [
            { text: "Use my emergency fund comfortably.", type: "saver" },
            { text: "Cut back on next week's expenses to cover it.", type: "neutral" },
            { text: "Swipe my credit card / use BNPL.", type: "spender" },
            { text: "Borrow from family or friends.", type: "impulsive" }
        ]
    }
];

export default function QuizPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState({});
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSelect = (option) => {
        setSelections({ ...selections, [currentStep]: option.type });
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            calculateResult();
        }
    };

    const calculateResult = async () => {
        setIsLoading(true);

        // Gather user's exact answers to send to the AI
        const userAnswers = questions.map((q, idx) => {
            const selectedOptionType = selections[idx];
            const selectedOptionText = q.options.find(opt => opt.type === selectedOptionType)?.text;
            return `Q: ${q.text}\nA: ${selectedOptionText}`;
        }).join('\n\n');

        const systemPrompt = `You are ArthSaathi, an AI financial coach for Indian youth. 
Analyze the user's answers to a 5-question spending habits quiz.
Invent a creative, somewhat humorous, but accurate 'Spending Personality Title' for them (e.g., "The Weekend Millionaire", "The Anxious Saver", "The UPI Phantom").
Write a 2-3 sentence description (about 40-50 words) explaining their relationship with money based exactly on their answers. Be direct and insightful.
Return valid JSON matching this schema exactly:
{
  "title": "Creative Title Here",
  "desc": "Insightful description here"
}`;

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userAnswers }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.8
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const parsed = JSON.parse(data.choices[0].message.content);
                setResult(parsed);
            } else {
                throw new Error("Invalid response");
            }
        } catch (error) {
            console.error("Error generating personality:", error);
            setResult({
                title: "The Mysterious Spender",
                desc: "We couldn't reach the AI brain right now to calculate your exact profile, but based on your inputs, you have a unique relationship with your finances!"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center p-6 bg-bgBase">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 size={48} className="text-accent animate-spin stroke-[1.5px]" />
                    <p className="font-mono text-[11px] text-textSecondary uppercase tracking-widest animate-pulse">
                        Analyzing your answers...
                    </p>
                </div>
            </div>
        )
    }

    if (result) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center p-6 pt-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[600px] bg-bgSurface border border-borderDefault rounded-[16px] p-8 md:p-12 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-accent" />
                    <span className="font-mono text-[11px] text-textSecondary uppercase tracking-widest mb-4 block">Your Spending Personality</span>
                    <h2 className="font-heading font-bold text-3xl md:text-[40px] text-textPrimary mb-6">You are <span className="text-accent">{result.title}</span>.</h2>
                    <p className="font-body text-[16px] text-textSecondary leading-[1.6] mb-10 w-4/5 mx-auto">
                        {result.desc}
                    </p>
                    <Link to="/auth" className="bg-accent hover:bg-accentHover text-bgBase font-heading font-semibold text-[13px] uppercase tracking-widest px-8 py-4 rounded-md transition-colors inline-block w-full sm:w-auto">
                        Create Account to Save Profile
                    </Link>
                </motion.div>
            </div>
        );
    }

    const question = questions[currentStep];

    return (
        <div className="w-full min-h-screen flex items-center justify-center p-6 pt-24">
            <div className="w-full max-w-[600px]">
                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    {questions.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${idx <= currentStep ? 'bg-accent' : 'bg-bgElevated border border-borderSubtle'}`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="font-heading font-semibold text-2xl md:text-[32px] mb-8 text-center text-textPrimary leading-tight">
                            {question.text}
                        </h2>

                        <div className="flex flex-col gap-4 mb-10">
                            {question.options.map((opt, idx) => {
                                const isSelected = selections[currentStep] === opt.type;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelect(opt)}
                                        className={`text-left p-5 rounded-[10px] border transition-all duration-200 flex items-center justify-between ${isSelected
                                            ? 'bg-[#1a1a1a] border-accent shadow-[0_0_0_1px_#ff4d00]'
                                            : 'bg-bgSurface border-borderSubtle hover:border-borderDefault'
                                            }`}
                                    >
                                        <span className="font-body text-[16px] text-textPrimary pr-4 leading-snug">{opt.text}</span>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${isSelected ? 'bg-accent border-accent' : 'border-borderDefault bg-bgBase'}`}>
                                            {isSelected && <Check size={14} className="text-bgBase stroke-[3px]" />}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!selections[currentStep]}
                            className={`w-full py-4 rounded-md font-heading font-semibold text-[13px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${selections[currentStep]
                                ? 'bg-accent text-bgBase hover:bg-accentHover'
                                : 'bg-bgElevated text-textMuted cursor-not-allowed'
                                }`}
                        >
                            Next <ArrowRight size={16} />
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
