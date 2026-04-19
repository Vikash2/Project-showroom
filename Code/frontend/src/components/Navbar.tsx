import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useShowroom } from '../state/ShowroomContext';
import ShowroomSelector from './ShowroomSelector';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { activeShowroom } = useShowroom();
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="sticky top-0 z-50 h-16 md:h-20 bg-[var(--navbar-bg)] text-[var(--navbar-text)] border-b border-[var(--border)] transition-all duration-300">
            <div className="container-custom h-full px-4 md:px-6">
                <div className="flex items-center justify-between h-full gap-2">

                    {/* LEFT: Logo + Separator + Location */}
                    <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-shrink-0">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 md:gap-3.5 group cursor-pointer">
                            <div
                                className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 flex-shrink-0"
                                style={{ backgroundColor: activeShowroom.branding.primaryColor }}
                            >
                                {activeShowroom.name.charAt(0)}
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-base md:text-lg font-black text-[var(--foreground)] block leading-none tracking-tight">{activeShowroom.name}</span>
                                <span className="text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase text-[var(--muted)] mt-1 block">Authorized Dealer</span>
                            </div>
                        </Link>

                        {/* Divider — desktop only */}
                        <div className="h-8 w-px bg-[var(--border)] hidden lg:block flex-shrink-0"></div>

                        {/* Location selector — always visible */}
                        <ShowroomSelector />
                    </div>

                    {/* RIGHT: Desktop nav links */}
                    <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                        {[{ name: 'Home', path: '/' }, { name: 'Catalog', path: '/vehicles' }].map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`px-3 py-2 rounded-lg font-black text-xs transition-all tracking-widest uppercase relative group/nav
                                    ${isActive(item.path)
                                        ? 'text-[var(--primary)] bg-[var(--primary)]/5'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'}`}
                            >
                                {item.name}
                                {isActive(item.path) && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute -bottom-[17px] md:-bottom-[21px] left-0 w-full h-0.5 bg-[var(--primary)] shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                                    />
                                )}
                            </Link>
                        ))}
                        <div className="h-6 w-px bg-[var(--border)]"></div>
                        <ThemeToggle />
                        <a href="/#inquiry" className="btn-primary py-2.5 px-5 text-sm whitespace-nowrap">Book Test Ride</a>
                    </div>

                    {/* RIGHT: Mobile actions */}
                    <div className="md:hidden flex items-center gap-2 flex-shrink-0">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile dropdown menu */}
            {isOpen && (
                <div className="md:hidden bg-[var(--navbar-bg)] border-t border-[var(--border)] animate-in slide-in-from-top duration-300">
                    <div className="px-4 py-6 space-y-3">
                        {[{ name: 'Home', path: '/' }, { name: 'Catalog', path: '/vehicles' }].map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`block py-3 px-4 rounded-xl text-base font-black transition-all
                                    ${isActive(item.path)
                                        ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                        : 'text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="pt-2">
                            <a 
                                href="/#inquiry" 
                                className="btn-primary w-full block text-center py-3.5 text-base" 
                                onClick={() => setIsOpen(false)}
                            >
                                Book Free Test Ride
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
