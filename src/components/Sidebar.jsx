import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Target, FileText, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar() {
    const { signOut } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const links = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/coach', label: 'Coach', icon: MessageSquare },
        { to: '/goals', label: 'Goals', icon: Target },
        { to: '/report', label: 'Report', icon: FileText },
    ];

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="w-full md:w-64 md:h-screen bg-bgSurface border-t md:border-t-0 md:border-r border-borderDefault fixed bottom-0 md:bottom-auto md:top-0 left-0 flex flex-col justify-between pt-0 md:pt-24 pb-safe md:pb-8 z-40">
            <div className="flex md:flex-col justify-around md:justify-start w-full">
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:px-8 md:py-4 transition-colors ${isActive
                                    ? 'text-accent border-t-2 md:border-t-0 md:border-r-2 border-accent bg-[#1a1a1a]/50'
                                    : 'text-textSecondary hover:text-textPrimary hover:bg-bgElevated'
                                }`
                            }
                        >
                            <Icon size={20} className="stroke-[1.5px]" />
                            <span className="font-heading font-semibold text-[13px] uppercase tracking-wider">{t(link.label)}</span>
                        </NavLink>
                    );
                })}
            </div>

            <div className="hidden md:flex flex-col px-8 mt-auto gap-2">
                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `flex items-center gap-4 transition-colors w-full p-4 pl-0 border-r-2 ${isActive ? 'text-accent border-accent' : 'text-textSecondary hover:text-textPrimary border-transparent'}`
                    }
                >
                    <User size={20} className="stroke-[1.5px]" />
                    <span className="font-heading font-semibold text-[13px] uppercase tracking-wider">{t('Profile')}</span>
                </NavLink>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 text-textSecondary hover:text-error transition-colors w-full p-4 pl-0 border-r-2 border-transparent"
                >
                    <LogOut size={20} className="stroke-[1.5px]" />
                    <span className="font-heading font-semibold text-[13px] uppercase tracking-wider">{t('Logout')}</span>
                </button>
            </div>
        </div>
    );
}
