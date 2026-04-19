import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../state/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { id: 'light', icon: Sun, label: 'Light' },
        { id: 'dark', icon: Moon, label: 'Dark' },
        { id: 'system', icon: Monitor, label: 'System' },
    ] as const;

    const ActiveIcon = themes.find(t => t.id === theme)?.icon || Sun;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                bg-[var(--card-bg)] text-[var(--foreground)] hover:ring-2 hover:ring-[var(--border)] shadow-sm"
                title="Change Theme"
            >
                <motion.div
                    key={theme}
                    initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ActiveIcon size={20} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-36 bg-[var(--card-bg)] rounded-2xl shadow-2xl border border-[var(--border)] z-50 overflow-hidden p-1.5"
                        >
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        setTheme(t.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200
                                    ${theme === t.id
                                            ? 'bg-red-600 text-white'
                                            : 'text-[var(--text-muted)] hover:bg-[var(--hover-bg)]'}`}
                                >
                                    <t.icon size={16} />
                                    {t.label}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeToggle;
