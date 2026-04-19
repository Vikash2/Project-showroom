import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { useShowroom } from '../state/ShowroomContext';
import { motion, AnimatePresence } from 'framer-motion';

const ShowroomSelector = () => {
    const { activeShowroom, setActiveShowroom, allShowrooms } = useShowroom();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Track viewport width to switch between fixed (mobile) and absolute (desktop) dropdown
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    return (
        <div className="relative">
            {/* Trigger button */}
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-[var(--hover-bg)] transition-all duration-200 border border-transparent hover:border-[var(--border)] max-w-[160px] md:max-w-none"
            >
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: activeShowroom.branding.primaryColor }}
                >
                    <MapPin size={14} />
                </div>

                {/* Mobile: show city only. Desktop: show label + full name */}
                <div className="flex flex-col justify-center text-left min-w-0">
                    <p className="hidden lg:block text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] leading-none mb-0.5">
                        Location
                    </p>
                    <span className="text-xs font-black text-[var(--text-primary)] truncate leading-none">
                        {activeShowroom.address.city}
                    </span>
                </div>

                <ChevronDown
                    size={13}
                    className={`flex-shrink-0 text-[var(--text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown — fixed + centered on mobile, absolute on md+ */}
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className={`
                                z-50 w-[min(320px,calc(100vw-2rem))]
                                bg-[var(--card-bg)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden
                                ${isMobile
                                    ? 'fixed left-1/2 -translate-x-1/2 top-[72px]'
                                    : 'absolute left-0 mt-2 top-full'
                                }
                            `}
                        >
                            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                                <p className="text-sm font-bold text-[var(--text-primary)]">Select Showroom</p>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5">Pick a branch for accurate pricing.</p>
                            </div>

                            <div className="max-h-[280px] overflow-y-auto p-2">
                                {allShowrooms.map((showroom) => {
                                    const isActive = activeShowroom.showroomId === showroom.showroomId;
                                    return (
                                        <button
                                            key={showroom.showroomId}
                                            onClick={() => {
                                                setActiveShowroom(showroom);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 mb-1 last:mb-0 text-left
                                                ${isActive
                                                    ? 'bg-[var(--selection-bg)] border border-[var(--selection-border)]'
                                                    : 'hover:bg-[var(--hover-bg)] border border-transparent'
                                                }`}
                                        >
                                            <div
                                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0
                                                    ${isActive
                                                        ? 'bg-[var(--card-bg)] text-[var(--selection-border)] shadow-sm'
                                                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                                                    }`}
                                            >
                                                {showroom.name.charAt(0)}
                                            </div>

                                            <div className="flex-grow min-w-0">
                                                <p className={`text-sm font-bold truncate ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                    {showroom.name}
                                                </p>
                                                <p className="text-xs text-[var(--text-muted)] truncate">
                                                    {showroom.address.city}, {showroom.address.state}
                                                </p>
                                            </div>

                                            {isActive && (
                                                <div className="w-5 h-5 rounded-full bg-[var(--selection-border)] flex items-center justify-center text-white flex-shrink-0">
                                                    <Check size={11} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShowroomSelector;
