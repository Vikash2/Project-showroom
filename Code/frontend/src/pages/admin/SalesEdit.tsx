import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useDirectSales } from '../../state/DirectSaleContext';
import DirectSalesForm from '../../components/Sales/DirectSalesForm';

export default function SalesEdit() {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const { getDirectSaleById, fetchDirectSaleById } = useDirectSales();
  
  const [sale, setSale] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSale = async () => {
      if (!saleId) {
        setError('No sale ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('[SalesEdit] Loading sale:', saleId);
        
        // Try to get from local state first
        let saleData = getDirectSaleById(saleId);
        
        // If not found, fetch from backend
        if (!saleData) {
          console.log('[SalesEdit] Sale not in local state, fetching from backend...');
          saleData = await fetchDirectSaleById(saleId);
        }
        
        if (!saleData) {
          setError('Sale not found');
        } else {
          setSale(saleData);
        }
      } catch (err: any) {
        console.error('[SalesEdit] Error loading sale:', err);
        setError(err.message || 'Failed to load sale');
      } finally {
        setIsLoading(false);
      }
    };

    loadSale();
  }, [saleId]); // Only depend on saleId, not the functions

  const handleSave = () => {
    console.log('[SalesEdit] Sale saved, redirecting to sales processing...');
    navigate('/admin/sales-processing');
  };

  const handleCancel = () => {
    navigate('/admin/sales-processing');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading sale details...</p>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-[var(--card-bg)] rounded-xl shadow-lg p-8 max-w-md w-full border border-[var(--border)]">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
            {error || 'Sale Not Found'}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
            The requested sale could not be loaded. It may have been deleted or you may not have permission to view it.
          </p>
          <button
            onClick={() => navigate('/admin/sales-processing')}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold"
          >
            Back to Sales Processing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-[var(--hover-bg)] rounded-lg transition"
            title="Back to Sales Processing"
          >
            <ArrowLeft size={24} className="text-[var(--text-secondary)]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Edit Sale</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Sale ID: {saleId} • Status: {sale.status}
            </p>
          </div>
        </div>
        
        {sale.status === 'Draft' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle size={18} className="text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Draft - Incomplete</span>
          </div>
        )}
        
        {sale.status === 'Sales Finalized' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Finalized</span>
          </div>
        )}
      </div>

      {/* Sales Form */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
        <DirectSalesForm
          saleId={saleId!}
          onClose={handleCancel}
          onSave={handleSave}
          isModal={false}
        />
      </div>
    </div>
  );
}
