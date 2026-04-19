import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInquiries } from '../state/InquiryContext';
import { useVehicles } from '../state/VehicleContext';
import { useShowroom } from '../state/ShowroomContext';
import { Car, DollarSign, Repeat } from 'lucide-react';
import type { LeadSource } from '../types/inquiry';

const inquirySchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  email: z.string().email('Enter valid email').optional().or(z.literal('')),
  city: z.string().min(2, 'City is required'),
  interestedModel: z.string().min(1, 'Please select a vehicle'),
  timeline: z.enum(['Immediate', 'Within 1 month', '1-3 months', '3-6 months', 'Just exploring']),
  testRideRequested: z.boolean(),
  financeRequired: z.boolean(),
  exchangeRequired: z.boolean()
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

interface InquiryFormProps {
  source?: LeadSource;
  onSuccess?: (inquiryId: string) => void;
  compact?: boolean;
}

const InquiryForm = ({ source = 'Website', onSuccess, compact = false }: InquiryFormProps) => {
  const { addInquiry } = useInquiries();
  const { vehicles } = useVehicles();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const { activeShowroom } = useShowroom();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { city: activeShowroom.address.city }
  });

  const onSubmit = async (data: InquiryFormValues) => {
    if (isSubmitting) return;
    
    try {
      const matchedVehicle = vehicles.find(v => v.id === data.interestedModel);
      
      const inquiryId = addInquiry({
        customer: {
          fullName: data.fullName,
          mobileNumber: data.mobileNumber,
          email: data.email || undefined,
          city: data.city
        },
        interest: {
          modelId: data.interestedModel,
          modelName: matchedVehicle ? `${matchedVehicle.brand} ${matchedVehicle.model}` : 'Unknown'
        },
        timeline: data.timeline,
        testRideRequested: data.testRideRequested,
        financeRequired: data.financeRequired,
        exchangeRequired: data.exchangeRequired,
        source,
        assignedTo: undefined
      });

      setIsSubmitted(true);
      reset();
      
      if (onSuccess) {
        onSuccess(inquiryId);
      }
      
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
    }
  };

  if (isSubmitted && !compact) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8 text-center animate-in fade-in zoom-in">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-emerald-900 mb-2">Thank You!</h3>
        <p className="text-emerald-700 font-medium">We've received your inquiry. Our team will contact you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={compact ? 'space-y-3 sm:space-y-4' : 'bg-[var(--card-bg)] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl border border-[var(--border)] space-y-4 sm:space-y-6'}>
      {!compact && (
        <div className="text-center mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mb-1 sm:mb-2">Get in Touch</h3>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium">Fill out the form and we'll get back to you soon</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-1.5 sm:mb-2">Full Name *</label>
          <input
            {...register('fullName')}
            type="text"
            placeholder="Enter your name"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          {errors.fullName && <p className="text-red-500 text-[10px] sm:text-xs mt-1 font-medium">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-1.5 sm:mb-2">Mobile Number *</label>
          <input
            {...register('mobileNumber')}
            type="tel"
            placeholder="10-digit mobile"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          {errors.mobileNumber && <p className="text-red-500 text-[10px] sm:text-xs mt-1 font-medium">{errors.mobileNumber.message}</p>}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-1.5 sm:mb-2">Email (Optional)</label>
          <input
            {...register('email')}
            type="email"
            placeholder="your@email.com"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          {errors.email && <p className="text-red-500 text-[10px] sm:text-xs mt-1 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-1.5 sm:mb-2">City *</label>
          <input
            {...register('city')}
            type="text"
            placeholder="Your city"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          {errors.city && <p className="text-red-500 text-[10px] sm:text-xs mt-1 font-medium">{errors.city.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-1.5 sm:mb-2">Interested Vehicle *</label>
        <select
          {...register('interestedModel')}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--text-primary)]"
        >
          <option value="">Select a vehicle</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
          ))}
        </select>
        {errors.interestedModel && <p className="text-red-500 text-[10px] sm:text-xs mt-1 font-medium">{errors.interestedModel.message}</p>}
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-1.5 sm:mb-2">Purchase Timeline *</label>
        <select
          {...register('timeline')}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--text-primary)]"
        >
          <option value="Immediate">Immediate</option>
          <option value="Within 1 month">Within 1 month</option>
          <option value="1-3 months">1-3 months</option>
          <option value="3-6 months">3-6 months</option>
          <option value="Just exploring">Just exploring</option>
        </select>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <p className="text-xs sm:text-sm font-bold text-[var(--text-secondary)]">Additional Requirements</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {[
            { id: 'testRideRequested', label: 'Test Ride', icon: Car },
            { id: 'financeRequired', label: 'Finance', icon: DollarSign },
            { id: 'exchangeRequired', label: 'Exchange', icon: Repeat }
          ].map((option) => {
            const Icon = option.icon;
            const isActive = watch(option.id as keyof InquiryFormValues);
            
            return (
              <label
                key={option.id}
                className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[var(--selection-bg)] border-[var(--selection-border)]'
                    : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:bg-[var(--hover-selection-bg)] hover:border-[var(--hover-selection-border)]'
                }`}
              >
                <input
                  {...register(option.id as any)}
                  type="checkbox"
                  className="sr-only"
                />
                <Icon size={18} className={`${isActive ? 'text-red-600' : 'text-[var(--text-muted)]'} sm:w-5 sm:h-5`} />
                <span className={`text-xs sm:text-sm font-bold ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 sm:py-4 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
      </button>
    </form>
  );
};

export default InquiryForm;
