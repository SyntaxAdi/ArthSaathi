import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const switchTab = (loginMode) => {
        setIsLogin(loginMode);
        setEmail('');
        setPassword('');
        setFullName('');
        setError('');
        setShowPassword(false);
    };

    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const { error: signInError } = await signIn(email, password);
                if (signInError) throw signInError;
            } else {
                const { error: signUpError } = await signUp(email, password, fullName);
                if (signUpError) throw signUpError;
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-bgBase font-display overflow-x-hidden">
            <header className="flex items-center p-4 pb-2 justify-between">
                <button onClick={() => navigate('/')} className="text-textPrimary flex size-12 shrink-0 items-center justify-start hover:text-accent transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-textPrimary text-lg font-bold leading-tight tracking-[-0.015em] flex-1 flex justify-center items-center gap-2 pr-12 font-heading">
                    <img src="/logo.png" alt="Logo" className="w-5 h-5 rounded-[4px] shadow-[0_0_10px_rgba(255,77,0,0.3)]" />
                    <span className="flex items-baseline">ArthSaathi<span className="text-accent">.</span></span>
                </h2>
            </header>

            <main className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full">
                {/* Toggle */}
                <div className="flex py-6">
                    <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-bgSurface p-1.5 border border-borderSubtle">
                        <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-bgElevated has-[:checked]:shadow-sm has-[:checked]:text-accent text-textSecondary text-sm font-semibold transition-all duration-200">
                            <span className="truncate">Login</span>
                            <input
                                checked={isLogin}
                                onChange={() => switchTab(true)}
                                className="invisible w-0"
                                name="auth-toggle"
                                type="radio"
                                value="Login"
                            />
                        </label>
                        <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-bgElevated has-[:checked]:shadow-sm has-[:checked]:text-accent text-textSecondary text-sm font-semibold transition-all duration-200">
                            <span className="truncate">Create Account</span>
                            <input
                                checked={!isLogin}
                                onChange={() => switchTab(false)}
                                className="invisible w-0"
                                name="auth-toggle"
                                type="radio"
                                value="Create Account"
                            />
                        </label>
                    </div>
                </div>

                <div className="pt-8 pb-4">
                    <h1 className="text-textPrimary tracking-tight text-4xl font-bold leading-tight font-heading">
                        {isLogin ? 'Welcome back' : 'Create an account'}
                    </h1>
                    <p className="text-textSecondary text-[15px] font-normal mt-2 font-body">
                        {isLogin ? 'Access your premium AI financial dashboard.' : 'Start your journey to financial mindfulness.'}
                    </p>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm font-body" style={{ boxShadow: '0 0 10px rgba(239,68,68,0.3)' }}>
                            {error}
                        </div>
                    )}
                </div>

                <form className="flex flex-col gap-5 mt-4" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-textPrimary ml-1 font-body">Full Name</label>
                            <div className="relative">
                                <input
                                    className="w-full bg-black rounded-xl h-14 px-4 text-white placeholder:text-textMuted transition-all outline-none font-body text-[15px] border"
                                    style={error ? { borderColor: '#ef4444', boxShadow: '0 0 14px rgba(239,68,68,0.65)' } : { borderColor: '#ff4d00' }}
                                    placeholder="Jane Doe"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-textPrimary ml-1 font-body">Email Address</label>
                        <div className="relative">
                            <input
                                className="w-full bg-black rounded-xl h-14 px-4 text-white placeholder:text-textMuted transition-all outline-none font-body text-[15px] border"
                                style={error ? { borderColor: '#ef4444', boxShadow: '0 0 14px rgba(239,68,68,0.65)' } : { borderColor: '#ff4d00' }}
                                placeholder="name@example.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-medium text-textPrimary font-body">Password</label>
                            {isLogin && <button className="text-[13px] font-semibold text-accent hover:opacity-80 font-body transition-opacity" type="button">Forgot Password?</button>}
                        </div>
                        <div className="relative">
                            <input
                                className="w-full bg-black rounded-xl h-14 px-4 text-white placeholder:text-textMuted transition-all outline-none font-body text-[15px] border pr-12"
                                style={error ? { borderColor: '#ef4444', boxShadow: '0 0 14px rgba(239,68,68,0.65)' } : { borderColor: '#ff4d00' }}
                                placeholder="••••••••"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary transition-colors"
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>
                    </div>

                    {isLogin && (
                        <div className="flex items-center gap-3 mt-2 ml-1">
                            <input className="rounded border-borderSubtle bg-transparent text-accent focus:ring-accent h-4 w-4" id="remember" type="checkbox" />
                            <label className="text-[14px] text-textSecondary font-body cursor-pointer" htmlFor="remember">Keep me logged in</label>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-accent hover:bg-accentHover text-bgBase font-heading font-bold text-[15px] h-14 rounded-xl shadow-[0_0_20px_rgba(255,77,0,0.15)] transition-all mt-4 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                        {!isLoading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="relative my-8 flex items-center hidden">
                    <div className="flex-grow border-t border-borderSubtle"></div>
                    <span className="flex-shrink mx-4 text-textMuted text-xs font-mono uppercase tracking-widest">or</span>
                    <div className="flex-grow border-t border-borderSubtle"></div>
                </div>

                <div className="flex flex-col gap-4 mb-10 pt-8">
                    <button className="w-full bg-bgSurface/50 border border-borderSubtle hover:border-borderDefault text-textPrimary font-body font-semibold text-[15px] h-14 rounded-xl flex items-center justify-center gap-3 transition-all">
                        <img alt="Google Logo" className="w-6 h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtpAQgrougny-tOZ-NFwl65Ywn-bgrjqn9MK6dHznpwE1eca_UISduIM7iDE-uHBQcAMgvAfNqb5eR3unbp3IRFfNX2VlmUtZZNLHuG4v6teUHk-0_hFQSJB_I9TiSkJpt-pP618pbbsjBlvj8-r3lbMgH3r_xjYXG-FhSv9Sx591XBFpsQ5GTnuha91Q2KBf2m9x058dyBXBLQH_0PYVgqN7v1rMrW76boFZ3PCNo39ZDeucUl619nxJfMu-4FCtu2SK0PhiIhEc" />
                        Continue with Google
                    </button>
                </div>
            </main>

            <footer className="p-6 text-center mt-auto">
                <p className="text-[12px] text-textMuted font-body leading-relaxed">
                    By continuing, you agree to our <br />
                    <a className="text-textSecondary hover:text-textPrimary underline decoration-borderSubtle hover:decoration-textPrimary transition-colors" href="#">Terms of Service</a> and <a className="text-textSecondary hover:text-textPrimary underline decoration-borderSubtle hover:decoration-textPrimary transition-colors" href="#">Privacy Policy</a>.
                </p>
            </footer>
        </div>
    );
}
