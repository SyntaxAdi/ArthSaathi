import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Languages } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 w-full z-50 h-16 transition-all duration-300 ${scrolled
                ? 'bg-[#0a0a0a]/85 backdrop-blur-[12px] border-b border-borderSubtle'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-[1200px] w-full mx-auto px-6 h-full flex items-center justify-between">
                <Link to="/" className="text-white font-display text-2xl tracking-wide flex items-center gap-2.5">
                    <img src="/logo.png" alt="ArthSaathi Logo" className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(255,77,0,0.3)]" />
                    <span className="flex items-baseline">ArthSaathi<span className="text-accent">.</span></span>
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/features" className="text-textSecondary hover:text-textPrimary font-body text-[13px] uppercase tracking-mega transition-colors">Features</Link>
                    <Link to="/how-it-works" className="text-textSecondary hover:text-textPrimary font-body text-[13px] uppercase tracking-mega transition-colors">How It Works</Link>
                    <Link to="/report?sample=true" className="text-textSecondary hover:text-textPrimary font-body text-[13px] uppercase tracking-mega transition-colors">Sample Report</Link>
                    <Link to="/languages" className="flex items-center gap-1.5 text-textSecondary hover:text-textPrimary font-body text-[13px] uppercase tracking-mega transition-colors">
                        <Languages size={14} className="stroke-[2.5px] -mt-0.5" /> Languages
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    {!user ? (
                        <>
                            <span className="text-textSecondary font-body text-[13px] mr-2 hidden sm:inline-block">
                                Existing user?
                            </span>
                            <Link to="/auth" className="bg-accent hover:bg-accentHover text-[#0a0a0a] font-heading font-semibold text-[13px] uppercase tracking-[0.06em] px-6 py-2.5 rounded-md transition-colors">
                                Login Now
                            </Link>
                        </>
                    ) : (
                        <Link to="/dashboard" className="bg-accent hover:bg-accentHover text-[#0a0a0a] font-heading font-semibold text-[13px] uppercase tracking-[0.06em] px-6 py-2.5 rounded-md transition-colors">
                            Dashboard
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
