import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useShowroom } from '../state/ShowroomContext';

const Hero = () => {
    const { activeShowroom } = useShowroom();

    return (
        <div className="relative bg-[var(--background)] pt-20 pb-32 overflow-hidden transition-colors duration-500">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="container-custom relative z-10">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-[var(--foreground)] leading-[0.95] mb-6 sm:mb-8 tracking-tighter">
                            Joy of <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-400">Riding</span>
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-[var(--muted)] mb-8 sm:mb-12 max-w-xl leading-relaxed font-medium">
                            Discover the latest range of {activeShowroom.brand} 2-wheelers at {activeShowroom.name}. Premium service, unbeatable deals.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
                            <a href="/#inquiry" className="btn-primary flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-2xl shadow-red-600/20">
                                Get a Quote <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                            </a>
                            <a href="/vehicles" className="btn-secondary flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                                Explore Catalog
                            </a>
                        </div>

                        <div className="mt-8 sm:mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 pt-8 sm:pt-12 border-t border-[var(--border)]">
                            {[
                                { icon: ShieldCheck, label: 'Verified', sub: 'Authorized Dealer', color: 'text-emerald-500' },
                                { icon: Clock, label: 'Express', sub: 'Fast Delivery', color: 'text-blue-500' },
                                { icon: CheckCircle2, label: '1000+', sub: 'Happy Riders', color: 'text-red-500' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col gap-1.5 sm:gap-2">
                                    <div className="flex items-center gap-2 sm:gap-2.5 text-[var(--foreground)] font-black text-base sm:text-lg">
                                        <item.icon size={20} className={`${item.color} sm:w-[22px] sm:h-[22px]`} />
                                        <span>{item.label}</span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs font-bold text-[var(--muted)] uppercase tracking-widest">{item.sub}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="relative lg:ml-auto"
                    >
                        <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-red-500/20 to-transparent blur-[100px] rounded-full"></div>
                        <div className="relative group">
                            <img
                                src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000"
                                alt="Honda Motorcycle"
                                className="w-full max-w-2xl h-auto object-cover rounded-[2.5rem] shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10 pointer-events-none"></div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
