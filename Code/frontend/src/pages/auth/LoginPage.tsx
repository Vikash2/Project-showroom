import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import { useShowroom } from '../../state/ShowroomContext';
import { Mail, Lock, KeyRound, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { loginWithEmail, isLoading, isAuthenticated, isInitializing } = useAuth();
  const { activeShowroom } = useShowroom();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [localError, setLocalError] = useState('');

  const from = location.state?.from?.pathname || '/admin';

  // Redirect if already authenticated
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      console.log('🔐 LoginPage: User is authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isInitializing, navigate, from]);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 3) {
      errors.password = 'Password must be at least 3 characters long';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    console.log('🔐 LoginPage: Form submitted');
    
    if (!validateForm()) {
      console.log('🔐 LoginPage: Validation failed');
      return;
    }
    
    console.log('🔐 LoginPage: Validation passed, calling loginWithEmail');
    
    try {
      const result = await loginWithEmail(email, password);
      
      console.log('🔐 LoginPage: Login result received', { success: result.success });
      
      if (result.success) {
        toast.success('Successfully logged in');
        console.log('🔐 LoginPage: Login successful, auth state will trigger redirect');
        // Don't navigate here - let the useEffect handle it when auth state updates
      } else if (result.error) {
        console.log('🔐 LoginPage: Login failed', result.error.code);
        setLocalError(result.error.userMessage);
      } else {
        console.log('🔐 LoginPage: Login failed with no error details');
        setLocalError('Login failed. Please try again.');
      }
    } catch (error: any) {
      console.error('🔐 LoginPage: Unexpected error during login', error);
      setLocalError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[var(--bg-secondary)] flex items-center justify-center p-4 transition-colors duration-500">
      <div className="bg-[var(--card-bg)] rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row border border-[var(--border)]">
        
        {/* Left Side: Dynamic Showroom Branding */}
        <div 
          className="md:w-1/2 p-10 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex"
          style={{ backgroundColor: activeShowroom.branding.primaryColor }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-xl" style={{ color: activeShowroom.branding.primaryColor }}>
              {activeShowroom.name.charAt(0)}
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-4">{activeShowroom.name}</h1>
            <p className="opacity-90 text-lg">Authorized {activeShowroom.brand} Dealer</p>
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
               <div className="p-3 bg-white/20 rounded-lg"><ShieldCheck size={24} /></div>
               <div>
                  <h3 className="font-bold">Showroom Portal</h3>
                  <p className="text-xs opacity-80">Access your local showroom dashboard securely.</p>
               </div>
            </div>
             <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="p-3 bg-white/20 rounded-lg"><KeyRound size={24} /></div>
                <div>
                   <h3 className="font-bold">Secure Staff Login</h3>
                   <p className="text-xs opacity-80">Manage inquiries, bookings, and customer relations.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 p-8 md:p-12">
          <div className="mb-8 font-black">
            <h2 className="text-3xl text-[var(--text-primary)] mb-2 leading-none">
              Showroom Staff Login
            </h2>
            <p className="text-[var(--text-secondary)] text-sm font-medium">
              Access your showroom dashboard
            </p>
          </div>

          {localError && (
             <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-600 p-3 rounded-xl flex items-start gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{localError}</span>
             </div>
          )}

            <form onSubmit={handleStaffLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">Email Address</label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${validationErrors.email ? 'text-red-500' : 'text-[var(--text-muted)]'}`} size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    className={`w-full bg-[var(--bg-primary)] border ${validationErrors.email ? 'border-red-500 shadow-sm shadow-red-500/10' : 'border-[var(--border)]'} rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-[var(--text-primary)] transition-all`}
                    placeholder="Enter your work email"
                  />
                </div>
                {validationErrors.email && <p className="mt-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider">{validationErrors.email}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">Password</label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${validationErrors.password ? 'text-red-500' : 'text-[var(--text-muted)]'}`} size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    className={`w-full bg-[var(--bg-primary)] border ${validationErrors.password ? 'border-red-500 shadow-sm shadow-red-500/10' : 'border-[var(--border)]'} rounded-xl py-3.5 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-[var(--text-primary)] transition-all`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {validationErrors.password && <p className="mt-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider">{validationErrors.password}</p>}
                <div className="flex justify-end mt-2">
                   <a href="#" className="text-xs font-bold text-red-600 hover:underline">Forgot password?</a>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full btn-primary py-4 flex justify-center items-center gap-3 mt-8 disabled:opacity-50 shadow-xl shadow-red-500/20 active:scale-[0.98] transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="font-bold">Authenticating...</span>
                  </>
                ) : (
                  <span className="font-bold">Sign In to Dashboard</span>
                )}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
}
