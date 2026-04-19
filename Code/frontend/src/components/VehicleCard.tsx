import React from 'react';
import { Fuel, Zap, Gauge, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface VehicleCardProps {
    model: string;
    category: string;
    price: string;
    image: string;
    specs: {
        mileage: string;
        engine: string;
        weight: string;
    };
}

const VehicleCard: React.FC<VehicleCardProps> = ({ model, category, price, image, specs }) => {
    const navigate = useNavigate();
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -8 }}
            className="card group border-[var(--card-border)] bg-[var(--card-bg)] cursor-pointer"
            onClick={() => navigate('/vehicles')}
        >
            <div className="relative overflow-hidden h-48 sm:h-56 md:h-64 lg:h-72">
                <img
                    src={image}
                    alt={model}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 glass px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] shadow-xl">
                    {category}
                </div>
            </div>
            <div className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[var(--text-primary)] mb-1.5 sm:mb-2 tracking-tight truncate">{model}</h3>
                <p className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-4 sm:mb-6 md:mb-8">
                    Starting at <span className="text-base sm:text-lg md:text-xl font-black text-[var(--primary)] ml-1">₹{price}*</span>
                </p>

                <div className="grid grid-cols-3 gap-0 border-y border-[var(--border)] mb-4 sm:mb-6 md:mb-8">
                    <div className="flex flex-col items-center justify-center py-3 sm:py-4 md:py-5 border-r border-[var(--border)]">
                        <Fuel size={16} className="text-[var(--text-muted)] mb-1 sm:mb-2 sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">{specs.mileage}</span>
                        <span className="text-[8px] sm:text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5 sm:mt-1 hidden sm:block">Mileage</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-3 sm:py-4 md:py-5 border-r border-[var(--border)]">
                        <Zap size={16} className="text-[var(--text-muted)] mb-1 sm:mb-2 sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">{specs.engine}</span>
                        <span className="text-[8px] sm:text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5 sm:mt-1 hidden sm:block">Engine</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-3 sm:py-4 md:py-5">
                        <Gauge size={16} className="text-[var(--text-muted)] mb-1 sm:mb-2 sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">{specs.weight}</span>
                        <span className="text-[8px] sm:text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5 sm:mt-1 hidden sm:block">Weight</span>
                    </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/#inquiry');
                  }}
                  className="w-full btn-primary py-3 sm:py-3.5 md:py-4 flex items-center justify-center gap-2 sm:gap-3 group/btn shadow-xl shadow-red-500/20 active:scale-95 transition-all text-sm sm:text-base md:text-lg font-bold"
                >
                    Book Test Ride
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-all sm:w-5 sm:h-5" />
                </button>
            </div>
        </motion.div>
    );
};

export default VehicleCard;
