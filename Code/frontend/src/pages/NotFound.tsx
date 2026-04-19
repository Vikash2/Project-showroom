import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '../state/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Visual */}
        <div className="relative">
          <h1 className="text-[180px] md:text-[240px] font-black text-[var(--text-primary)] opacity-10 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center">
              <Search size={64} className="text-red-600" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)]">
            Page Not Found
          </h2>
          <p className="text-lg text-[var(--text-secondary)] font-medium max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--hover-bg)] transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          
          {user ? (
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
            >
              <Home size={20} />
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
            >
              <Home size={20} />
              Go to Home
            </button>
          )}
        </div>

        {/* Additional Help */}
        <div className="pt-12 border-t border-[var(--border)] mt-12">
          <p className="text-sm text-[var(--text-muted)] font-medium">
            Need help? Contact us at{' '}
            <a href="mailto:support@showroom.com" className="text-red-600 hover:underline font-bold">
              support@showroom.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
