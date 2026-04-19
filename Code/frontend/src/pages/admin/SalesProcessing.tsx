import { useState, useMemo } from 'react';
import { useBookings } from '../../state/BookingContext';
import { useDirectSales } from '../../state/DirectSaleContext';
import { useVehicles } from '../../state/VehicleContext';
import { Search, Filter, Calendar, FileText, X, CheckCircle, AlertCircle, Zap, Upload, FileCheck, DollarSign, Truck, CreditCard, Eye, ShoppingCart } from 'lucide-react';
import type { Booking, FinalSale } from '../../types/booking';
import type { DirectSaleRecord } from '../../types/directSale';
import DocumentUploadSection from '../../components/Sales/DocumentUploadSection';
import FinalSalesForm from '../../components/Sales/FinalSalesForm';
import DirectSalesForm from '../../components/Sales/DirectSalesForm';
import SalesDetailsViewer from '../../components/Sales/SalesDetailsViewer';
import { downloadSalesDocument } from '../../utils/salesDocumentGenerator';

// Unified sale type for display
type UnifiedSaleDisplay = {
  id: string;
  source: 'BOOKING' | 'DIRECT';
  customer: {
    fullName: string;
    mobile: string;
  };
  date: string;
  status: string;
  pricing: {
    onRoadPrice: number;
  };
  vehicleConfig: {
    modelId: string;
    variantId: string;
  };
  documents: any;
  sale?: any;
  saleDetails?: any;
  paymentConfirmed?: boolean;
  deliveryConfirmed?: boolean;
  bookingAmountPaid?: number;
  balanceDue?: number;
};

export default function SalesProcessing() {
  const { bookings, updateBookingSale, updateBookingStatus, confirmPayment, confirmDelivery } = useBookings();
  const { directSales, updateDirectSale, confirmPayment: confirmDirectPayment, confirmDelivery: confirmDirectDelivery } = useDirectSales();
  const { vehicles } = useVehicles();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending Documents' | 'Ready for Sales'>('All');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'Booking' | 'Direct'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [selectedSaleSource, setSelectedSaleSource] = useState<'BOOKING' | 'DIRECT' | null>(null);
  const [salesFormBookingId, setSalesFormBookingId] = useState<string | null>(null);
  const [salesFormDirectId, setSalesFormDirectId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSaleId, setPaymentSaleId] = useState<string | null>(null);
  const [paymentSaleSource, setPaymentSaleSource] = useState<'BOOKING' | 'DIRECT' | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [viewSalesBookingId, setViewSalesBookingId] = useState<string | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliverySaleId, setDeliverySaleId] = useState<string | null>(null);
  const [deliverySaleSource, setDeliverySaleSource] = useState<'BOOKING' | 'DIRECT' | null>(null);
  const [showDeliverySuccess, setShowDeliverySuccess] = useState(false);

  // Convert bookings and direct sales to unified format
  const unifiedSales = useMemo((): UnifiedSaleDisplay[] => {
    const bookingSales: UnifiedSaleDisplay[] = bookings
      .filter(bk => bk.status === 'Confirmed' || bk.status === 'Sales Finalized' || bk.status === 'Payment Complete' || bk.status === 'Delivered')
      .map(bk => ({
        id: bk.id,
        source: 'BOOKING' as const,
        customer: bk.customer,
        date: bk.date,
        status: bk.status,
        pricing: bk.pricing,
        vehicleConfig: bk.vehicleConfig,
        documents: bk.documents,
        sale: bk.sale,
        paymentConfirmed: bk.paymentConfirmed,
        deliveryConfirmed: bk.deliveryConfirmed,
        bookingAmountPaid: bk.bookingAmountPaid,
        balanceDue: bk.balanceDue,
      }));

    const directSalesList: UnifiedSaleDisplay[] = directSales
      .filter(ds => ds.status === 'Draft' || ds.status === 'Sales Finalized' || ds.status === 'Payment Complete' || ds.status === 'Delivered')
      .map(ds => ({
        id: ds.id,
        source: 'DIRECT' as const,
        customer: ds.customer,
        date: ds.date,
        status: ds.status,
        pricing: ds.pricing,
        vehicleConfig: ds.vehicleConfig,
        documents: ds.documents,
        saleDetails: ds.saleDetails,
        paymentConfirmed: ds.paymentConfirmed,
        deliveryConfirmed: ds.deliveryConfirmed,
      }));

    return [...bookingSales, ...directSalesList].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [bookings, directSales]);

  const selectedSale = selectedSaleId && selectedSaleSource
    ? unifiedSales.find(s => s.id === selectedSaleId && s.source === selectedSaleSource) ?? null
    : null;
  const salesFormBooking = salesFormBookingId ? bookings.find(b => b.id === salesFormBookingId) ?? null : null;
  const viewSalesBooking = viewSalesBookingId ? bookings.find(b => b.id === viewSalesBookingId) ?? null : null;

  const areAllDocumentsUploaded = (sale: UnifiedSaleDisplay): boolean => {
    return Object.values(sale.documents).every(doc => !!doc.file);
  };

  const isSalesFormComplete = (sale: UnifiedSaleDisplay): boolean => {
    const saleData = sale.source === 'BOOKING' ? sale.sale : sale.saleDetails;
    if (!saleData) return false;
    
    // Check basic required fields
    if (!saleData.soldThrough) return false;
    if (!saleData.registration) return false;
    if (!saleData.insurance) return false;
    if (!saleData.typeOfSale) return false;
    
    // Check finance-specific fields
    if (saleData.soldThrough === 'FINANCE') {
      if (!saleData.financer || !saleData.financeBy) return false;
      if (!saleData.hypothecationSelected) return false;
    }
    
    // Check insurance-specific fields
    if (saleData.insurance === 'YES') {
      if (!saleData.insuranceType) return false;
      if (!saleData.insuranceNominee.name || !saleData.insuranceNominee.age || !saleData.insuranceNominee.relation) return false;
    }
    
    // Check exchange-specific fields
    if (saleData.typeOfSale === 'EXCHANGE') {
      if (!saleData.exchange?.model || !saleData.exchange?.year || !saleData.exchange?.value) return false;
      if (!saleData.exchange?.exchangerName || !saleData.exchange?.registrationNumber) return false;
    }
    
    // Check GST fields
    if (saleData.isGstNumber === 'YES' && !saleData.gstNumber) return false;
    
    return true;
  };

  const isApprovalPending = (sale: UnifiedSaleDisplay): boolean => {
    const saleData = sale.source === 'BOOKING' ? sale.sale : sale.saleDetails;
    return saleData?.specialDiscountApprovalStatus === 'PENDING' || 
           sale.status === 'Pending Approval';
  };

  const canProceedToPayment = (sale: UnifiedSaleDisplay): boolean => {
    // All conditions must be met
    return areAllDocumentsUploaded(sale) && 
           isSalesFormComplete(sale) && 
           sale.status === 'Sales Finalized' &&
           !isApprovalPending(sale);
  };

  const canConfirmDelivery = (sale: UnifiedSaleDisplay): boolean => {
    // Delivery can only be confirmed when payment is complete and not already delivered
    return sale.paymentConfirmed === true && 
           sale.status === 'Payment Complete' &&
           !sale.deliveryConfirmed;
  };

  const getDocumentCount = (sale: UnifiedSaleDisplay) => {
    const uploaded = Object.values(sale.documents).filter(doc => !!doc.file).length;
    const total = Object.keys(sale.documents).length;
    return { uploaded, total };
  };

  const getOverallProgress = (sale: UnifiedSaleDisplay) => {
    let completed = 0;
    const total = 6; // Total steps in the journey
    
    // Step 1: Booking/Sale Created
    if (sale.status !== 'Pending' && sale.status !== 'Draft') completed++;
    
    // Step 2: Documents Uploaded
    if (areAllDocumentsUploaded(sale)) completed++;
    
    // Step 3: Sales Form Complete
    if (isSalesFormComplete(sale)) completed++;
    
    // Step 4: Sales Finalized (no pending approvals)
    if (sale.status === 'Sales Finalized' && !isApprovalPending(sale)) completed++;
    
    // Step 5: Payment Confirmed
    if (sale.paymentConfirmed) completed++;
    
    // Step 6: Delivered
    if (sale.status === 'Delivered') completed++;
    
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const filteredSales = useMemo(() => {
    return unifiedSales.filter(sale => {
      const matchesSearch =
        sale.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer.mobile.includes(searchTerm);

      let matchesStatus = true;
      if (statusFilter === 'Pending Documents') matchesStatus = !areAllDocumentsUploaded(sale);
      else if (statusFilter === 'Ready for Sales') matchesStatus = areAllDocumentsUploaded(sale);

      let matchesSource = true;
      if (sourceFilter === 'Booking') matchesSource = sale.source === 'BOOKING';
      else if (sourceFilter === 'Direct') matchesSource = sale.source === 'DIRECT';

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [unifiedSales, searchTerm, statusFilter, sourceFilter]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(start, start + itemsPerPage);
  }, [filteredSales, currentPage]);

  useMemo(() => { setCurrentPage(1); }, [searchTerm, statusFilter, sourceFilter]);

  const handleProceedToSales = () => {
    if (!selectedSale) return;
    setIsEditMode(false);
    if (selectedSale.source === 'BOOKING') {
      setSalesFormBookingId(selectedSale.id);
    } else {
      setSalesFormDirectId(selectedSale.id);
    }
    setSelectedSaleId(null);
    setSelectedSaleSource(null);
  };

  const handleEditSales = () => {
    if (!selectedSale) return;
    setIsEditMode(true);
    if (selectedSale.source === 'BOOKING') {
      setSalesFormBookingId(selectedSale.id);
    } else {
      setSalesFormDirectId(selectedSale.id);
    }
    setSelectedSaleId(null);
    setSelectedSaleSource(null);
  };

  const handleSaleSave = async (updatedBooking: Booking) => {
    if (!updatedBooking.sale) return;
    await updateBookingSale(updatedBooking.id, updatedBooking.sale);
    updateBookingStatus(updatedBooking.id, updatedBooking.status);
    setSalesFormBookingId(null);
    setIsEditMode(false);
  };

  const handleDirectSaleSave = async () => {
    setSalesFormDirectId(null);
    setIsEditMode(false);
  };

  const handlePaymentClick = (saleId: string, source: 'BOOKING' | 'DIRECT') => {
    setPaymentSaleId(saleId);
    setPaymentSaleSource(source);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = () => {
    if (!paymentSaleId || !paymentSaleSource) return;
    
    // Update sale with payment confirmation
    if (paymentSaleSource === 'BOOKING') {
      confirmPayment(paymentSaleId);
    } else {
      confirmDirectPayment(paymentSaleId);
    }
    
    setShowPaymentModal(false);
    setPaymentSaleId(null);
    setPaymentSaleSource(null);
    setSelectedSaleId(null);
    setSelectedSaleSource(null);
    
    // Show success modal
    setShowPaymentSuccess(true);
  };

  const handleViewSalesDetails = () => {
    if (!selectedSale || selectedSale.source !== 'BOOKING') return;
    setViewSalesBookingId(selectedSale.id);
    setSelectedSaleId(null);
    setSelectedSaleSource(null);
  };

  const handleDownloadSales = () => {
    if (!viewSalesBooking) return;
    const vehicle = vehicles.find(v => v.id === viewSalesBooking.vehicleConfig.modelId);
    const variant = vehicle?.variants.find(v => v.id === viewSalesBooking.vehicleConfig.variantId);
    const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown Vehicle';
    const variantName = variant?.name || 'Unknown Variant';
    downloadSalesDocument(viewSalesBooking, vehicleName, variantName);
  };

  const handleApproveSale = () => {
    if (!viewSalesBooking || !viewSalesBooking.sale) return;
    const updatedSale: FinalSale = {
      ...viewSalesBooking.sale,
      specialDiscountApprovalStatus: 'APPROVED'
    };
    updateBookingSale(viewSalesBooking.id, updatedSale);
    updateBookingStatus(viewSalesBooking.id, 'Sales Finalized');
    setViewSalesBookingId(null);
  };

  const handleRejectSale = () => {
    if (!viewSalesBooking || !viewSalesBooking.sale) return;
    const updatedSale: FinalSale = {
      ...viewSalesBooking.sale,
      specialDiscountApprovalStatus: 'REJECTED'
    };
    updateBookingSale(viewSalesBooking.id, updatedSale);
    updateBookingStatus(viewSalesBooking.id, 'Pending Approval');
    setViewSalesBookingId(null);
  };

  const handleDeliveryClick = (saleId: string, source: 'BOOKING' | 'DIRECT') => {
    setDeliverySaleId(saleId);
    setDeliverySaleSource(source);
    setShowDeliveryModal(true);
  };

  const handleDeliveryConfirm = () => {
    if (!deliverySaleId || !deliverySaleSource) return;
    
    // Confirm delivery and close the sales lifecycle
    if (deliverySaleSource === 'BOOKING') {
      confirmDelivery(deliverySaleId);
    } else {
      confirmDirectDelivery(deliverySaleId);
    }
    
    setShowDeliveryModal(false);
    setDeliverySaleId(null);
    setDeliverySaleSource(null);
    setSelectedSaleId(null);
    setSelectedSaleSource(null);
    
    // Show success modal
    setShowDeliverySuccess(true);
  };

  // Sales Journey Steps - FIXED STATUS FLOW WITH DELIVERY
  const getSalesJourneySteps = (sale: UnifiedSaleDisplay) => {
    const hasAllDocs = areAllDocumentsUploaded(sale);
    const hasSaleDetails = sale.source === 'BOOKING' ? !!sale.sale : !!sale.saleDetails;
    const isSalesFinalized = sale.status === 'Sales Finalized';
    const isPaymentComplete = sale.status === 'Payment Complete' || sale.paymentConfirmed;
    const isDelivered = sale.status === 'Delivered' || sale.deliveryConfirmed;
    
    const steps = [
      {
        id: 1,
        label: sale.source === 'BOOKING' ? 'Booking Confirmed' : 'Direct Sale Created',
        icon: sale.source === 'BOOKING' ? CheckCircle : ShoppingCart,
        completed: sale.status !== 'Pending' && sale.status !== 'Draft',
        active: sale.status === 'Pending' || sale.status === 'Draft'
      },
      {
        id: 2,
        label: 'Documents Upload',
        icon: Upload,
        completed: hasAllDocs && hasSaleDetails,
        active: !hasAllDocs && (sale.status === 'Confirmed' || sale.status === 'Draft')
      },
      {
        id: 3,
        label: 'Sales Form Completion',
        icon: FileCheck,
        completed: hasSaleDetails && isSalesFinalized,
        active: hasAllDocs && !isSalesFinalized
      },
      {
        id: 4,
        label: 'Sales Finalized',
        icon: DollarSign,
        completed: isSalesFinalized && isPaymentComplete,
        active: hasSaleDetails && isSalesFinalized && !isPaymentComplete
      },
      {
        id: 5,
        label: 'Payment Complete',
        icon: CreditCard,
        completed: isPaymentComplete && isDelivered,
        active: isSalesFinalized && isPaymentComplete && !isDelivered
      },
      {
        id: 6,
        label: 'Vehicle Delivered',
        icon: Truck,
        completed: isDelivered,
        active: isPaymentComplete && !isDelivered
      }
    ];
    return steps;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Sales Processing</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Manage document verification and sales finalization</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border)] p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              type="text"
              placeholder="Search by name, Booking ID or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm text-[var(--text-primary)]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-bold text-sm transition-colors ${showFilters ? 'bg-red-50 border-red-200 text-red-600' : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}
          >
            <Filter size={18} /> Filters
          </button>
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Document Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)]"
              >
                <option value="All">All Bookings</option>
                <option value="Pending Documents">Pending Documents</option>
                <option value="Ready for Sales">Ready for Sales</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Sale Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as any)}
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)]"
              >
                <option value="All">All Sources</option>
                <option value="Booking">Booking-Based</option>
                <option value="Direct">Direct Sales</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">

        {/* Mobile */}
        <div className="block md:hidden divide-y divide-[var(--border)]">
          {paginatedSales.map((sale) => {
            const v = vehicles.find(v => v.id === sale.vehicleConfig.modelId);
            const { uploaded, total } = getDocumentCount(sale);
            const progress = getOverallProgress(sale);
            const isReady = canProceedToPayment(sale);
            return (
              <div key={`${sale.source}-${sale.id}`} className="p-4 hover:bg-[var(--hover-bg)] transition cursor-pointer" onClick={() => { setSelectedSaleId(sale.id); setSelectedSaleSource(sale.source); }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold flex-shrink-0 border text-sm ${
                    sale.source === 'DIRECT' 
                      ? 'bg-purple-50 text-purple-600 border-purple-100' 
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {sale.source === 'DIRECT' ? <ShoppingCart size={18} /> : sale.customer.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[var(--text-primary)] truncate">{sale.id}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{sale.customer.fullName}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{sale.customer.mobile}</div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`text-[9px] px-2 py-1 rounded-full font-bold whitespace-nowrap ${isReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {isReady ? 'Ready' : 'Pending'}
                    </span>
                    <span className={`text-[9px] px-2 py-1 rounded-full font-bold whitespace-nowrap ${
                      sale.source === 'DIRECT' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {sale.source === 'DIRECT' ? 'Direct' : 'Booking'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Vehicle</span>
                    <span className="font-bold text-[var(--text-primary)] text-right truncate max-w-[60%]">{v?.brand} {v?.model}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Documents</span>
                    <span className="font-bold text-[var(--text-primary)]">{uploaded}/{total}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Overall Progress</span>
                    <span className="font-bold text-[var(--text-primary)]">{progress.percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
          {paginatedSales.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              <p>No sales in processing.</p>
            </div>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Booking Info</th>
                <th className="p-4 font-semibold">Vehicle</th>
                <th className="p-4 font-semibold">Documents</th>
                <th className="p-4 font-semibold">Progress</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedSales.map((sale) => {
                const v = vehicles.find(v => v.id === sale.vehicleConfig.modelId);
                const { uploaded, total } = getDocumentCount(sale);
                const progress = getOverallProgress(sale);
                const isReady = canProceedToPayment(sale);
                return (
                  <tr key={`${sale.source}-${sale.id}`} onClick={() => { setSelectedSaleId(sale.id); setSelectedSaleSource(sale.source); }} className="hover:bg-[var(--hover-bg)] transition cursor-pointer">
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shrink-0 border ${
                          sale.source === 'DIRECT' 
                            ? 'bg-purple-50 text-purple-600 border-purple-100' 
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {sale.source === 'DIRECT' ? <ShoppingCart size={18} /> : sale.customer.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-[var(--text-primary)]">{sale.id}</div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                              sale.source === 'DIRECT' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {sale.source === 'DIRECT' ? 'DIRECT' : 'BOOKING'}
                            </span>
                          </div>
                          <div className="text-xs text-[var(--text-muted)] font-medium">{sale.customer.fullName} • {sale.customer.mobile}</div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
                            <Calendar size={10} /> {new Date(sale.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-[var(--text-primary)]">{v?.brand} {v?.model}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">₹{sale.pricing.onRoadPrice.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-sm font-bold text-[var(--text-primary)]">{uploaded}/{total}</div>
                          <div className="text-xs text-[var(--text-muted)]">Documents</div>
                        </div>
                        {isReady ? <CheckCircle size={20} className="text-green-600" /> : <AlertCircle size={20} className="text-orange-600" />}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 border border-[var(--border)]">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            progress.percentage === 100 ? 'bg-green-600' : 
                            progress.percentage >= 66 ? 'bg-blue-600' : 
                            progress.percentage >= 33 ? 'bg-yellow-600' : 'bg-orange-600'
                          }`}
                          style={{ width: `${progress.percentage}%` }} 
                        />
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        {progress.completed}/{progress.total} steps • {progress.percentage}%
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedSaleId(sale.id); setSelectedSaleSource(sale.source); }}
                        className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginatedSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileText size={40} className="opacity-30" />
                      <p>No sales in processing.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredSales.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)]">
          <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSales.length)} of {filteredSales.length} sales
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition">Previous</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
              return (
                <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-bold rounded-lg transition ${currentPage === p ? 'bg-red-600 text-white' : 'border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}>{p}</button>
              );
            })}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition">Next</button>
          </div>
        </div>
      )}

      {/* Detail Side Panel */}
      {selectedSale && (
        <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-[2px] z-50 flex items-center justify-end animate-in fade-in duration-200">
          <div className="bg-[var(--card-bg)] h-full w-full max-w-lg shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[var(--border)]">
            <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-[var(--text-primary)]">{selectedSale.id}</h2>
                    <span className={`text-[9px] px-2 py-1 rounded-full font-bold ${
                      selectedSale.source === 'DIRECT' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedSale.source === 'DIRECT' ? 'DIRECT SALE' : 'BOOKING'}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] font-medium mt-1">{selectedSale.customer.fullName} • {new Date(selectedSale.date).toLocaleDateString()}</p>
                </div>
                <button onClick={() => { setSelectedSaleId(null); setSelectedSaleSource(null); }} className="p-2 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] rounded-full transition">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Sales Journey Progress */}
              <section>
                <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 border-b border-[var(--border)] pb-2">Sales Journey Progress</h3>
                <div className="space-y-3">
                  {getSalesJourneySteps(selectedSale).map((step, index) => {
                    const Icon = step.icon;
                    const isLast = index === getSalesJourneySteps(selectedSale).length - 1;
                    
                    return (
                      <div key={step.id} className="relative">
                        <div className="flex items-start gap-3">
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            step.completed 
                              ? 'bg-green-500 text-white' 
                              : step.active 
                                ? 'bg-blue-500 text-white animate-pulse' 
                                : 'bg-[var(--bg-secondary)] border-2 border-[var(--border)] text-[var(--text-muted)]'
                          }`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 pt-1">
                            <div className={`text-sm font-semibold ${
                              step.completed || step.active 
                                ? 'text-[var(--text-primary)]' 
                                : 'text-[var(--text-muted)]'
                            }`}>
                              {step.label}
                            </div>
                            {step.active && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 font-medium">In Progress</div>
                            )}
                            {step.completed && (
                              <div className="text-xs text-green-600 dark:text-green-400 mt-0.5 font-medium">Completed</div>
                            )}
                          </div>
                        </div>
                        {!isLast && (
                          <div className={`absolute left-4 top-8 w-0.5 h-6 -ml-px transition-all ${
                            step.completed ? 'bg-green-500' : 'bg-[var(--border)]'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Document Upload - Only for bookings, direct sales have inline upload */}
              {selectedSale.source === 'BOOKING' && (
                <DocumentUploadSection booking={bookings.find(b => b.id === selectedSale.id)!} />
              )}

              {/* Direct Sale Documents Display */}
              {selectedSale.source === 'DIRECT' && (
                <section>
                  <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 border-b border-[var(--border)] pb-2">Documents</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedSale.documents).map(([key, doc]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                        <span className="text-sm text-[var(--text-primary)] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          doc.file ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {doc.file ? '✓ Uploaded' : '⚠ Required'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 border-b border-[var(--border)] pb-2">
                  {selectedSale.source === 'BOOKING' ? 'Booking Summary' : 'Sale Summary'}
                </h3>
                <div className="bg-[var(--bg-secondary)] p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Total Price</span>
                    <span className="font-bold">₹{selectedSale.pricing.onRoadPrice.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedSale.source === 'BOOKING' && selectedSale.bookingAmountPaid !== undefined && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Paid</span>
                        <span className="font-bold text-emerald-600">₹{selectedSale.bookingAmountPaid.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Balance</span>
                        <span className="font-bold text-red-600">₹{selectedSale.balanceDue?.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col gap-3">
              {!isSalesFormComplete(selectedSale) ? (
                // No sales details or incomplete - show proceed to sales
                <>
                  <button
                    onClick={handleProceedToSales}
                    disabled={!areAllDocumentsUploaded(selectedSale)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                  >
                    <Zap size={18} />
                    Proceed to Sales
                  </button>
                  {!areAllDocumentsUploaded(selectedSale) && (
                    <p className="text-xs text-center text-orange-600 dark:text-orange-400">
                      ⚠ Please upload all required documents first
                    </p>
                  )}
                  {areAllDocumentsUploaded(selectedSale) && !isSalesFormComplete(selectedSale) && (selectedSale.source === 'BOOKING' ? selectedSale.sale : selectedSale.saleDetails) && (
                    <p className="text-xs text-center text-orange-600 dark:text-orange-400">
                      ⚠ Sales form is incomplete. Please complete all required fields.
                    </p>
                  )}
                </>
              ) : isApprovalPending(selectedSale) ? (
                // Approval pending - show status, allow editing before payment
                <>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <AlertCircle size={24} className="text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Approval Pending</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Special discount requires manager approval</p>
                  </div>
                  <button
                    onClick={handleEditSales}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                  >
                    <FileCheck size={18} />
                    Edit Sales Details
                  </button>
                </>
              ) : selectedSale.paymentConfirmed || selectedSale.status === 'Payment Complete' ? (
                // Payment confirmed - LOCK editing, show view option and delivery
                <>
                  {selectedSale.deliveryConfirmed || selectedSale.status === 'Delivered' ? (
                    // Delivery complete - final state
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <CheckCircle size={24} className="text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Delivery Complete</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Sales lifecycle closed
                      </p>
                    </div>
                  ) : (
                    // Payment complete but not delivered yet
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <CheckCircle size={24} className="text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">Payment Complete</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">Sales record is locked - ready for delivery</p>
                    </div>
                  )}
                  {selectedSale.source === 'BOOKING' && (
                    <button
                      onClick={handleViewSalesDetails}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      <Eye size={18} />
                      View Sales Details
                    </button>
                  )}
                  {canConfirmDelivery(selectedSale) && (
                    <button
                      onClick={() => handleDeliveryClick(selectedSale.id, selectedSale.source)}
                      className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      <Truck size={18} />
                      Confirm Delivery
                    </button>
                  )}
                </>
              ) : canProceedToPayment(selectedSale) ? (
                // All complete - show payment and edit options (ONLY before payment)
                <>
                  <button
                    onClick={() => handlePaymentClick(selectedSale.id, selectedSale.source)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <CreditCard size={18} />
                    Proceed to Payment
                  </button>
                  <button
                    onClick={handleEditSales}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                  >
                    <FileCheck size={18} />
                    Edit Sales Details (Before Payment)
                  </button>
                  <p className="text-xs text-center text-orange-600 dark:text-orange-400">
                    ⚠ Sales details cannot be edited after payment confirmation
                  </p>
                  {selectedSale.source === 'BOOKING' && isSalesFormComplete(selectedSale) && (
                    <button
                      onClick={handleViewSalesDetails}
                      className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-bold flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      View Sales Details
                    </button>
                  )}
                </>
              ) : (
                // Sales details exist but not finalized - show edit option (ONLY before payment)
                <button
                  onClick={handleEditSales}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  <FileCheck size={18} />
                  Edit Sales Details
                </button>
              )}
              
              <button
                onClick={() => { setSelectedSaleId(null); setSelectedSaleSource(null); }}
                className="w-full px-4 py-2 text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Sales Form Modal */}
      {salesFormBooking && (
        <FinalSalesForm
          booking={salesFormBooking}
          onClose={() => {
            setSalesFormBookingId(null);
            setIsEditMode(false);
          }}
          onSave={handleSaleSave}
          isEditMode={isEditMode}
        />
      )}

      {/* Direct Sales Form Modal */}
      {salesFormDirectId && (
        <DirectSalesForm
          saleId={salesFormDirectId}
          onClose={() => {
            setSalesFormDirectId(null);
            setIsEditMode(false);
          }}
          onSave={handleDirectSaleSave}
        />
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mx-auto mb-4">
              <CreditCard size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
              Confirm Payment
            </h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              This is a placeholder for payment integration. In production, this would connect to a payment gateway.
            </p>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-lg mb-6 border border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                  Amount to Pay
                </div>
                <div className="text-3xl font-black text-blue-700 dark:text-blue-300">
                  ₹{paymentSaleId && paymentSaleSource && unifiedSales.find(s => s.id === paymentSaleId && s.source === paymentSaleSource)?.pricing.onRoadPrice.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                    ⚠ Critical Warning
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 font-semibold">
                    Once payment is confirmed, the sales record will be PERMANENTLY LOCKED. No edits, modifications, or changes will be allowed. Please verify all details are correct before proceeding.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentSaleId(null);
                  setPaymentSaleSource(null);
                }}
                className="flex-1 px-4 py-2.5 text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentConfirm}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <CheckCircle size={18} />
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Details Viewer */}
      {viewSalesBooking && (
        <SalesDetailsViewer
          booking={viewSalesBooking}
          onClose={() => setViewSalesBookingId(null)}
          onDownload={handleDownloadSales}
          onApprove={handleApproveSale}
          onReject={handleRejectSale}
        />
      )}

      {/* Delivery Confirmation Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-4">
              <Truck size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
              Confirm Vehicle Delivery
            </h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              This is the final step in the sales lifecycle. Once confirmed, the entire sales process will be marked as complete and closed.
            </p>
            
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-900/30 p-6 rounded-lg mb-6 border border-emerald-200 dark:border-emerald-800">
              <div className="text-center">
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                  {deliverySaleSource === 'BOOKING' ? 'Booking ID' : 'Sale ID'}
                </div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  {deliverySaleId && deliverySaleSource && unifiedSales.find(s => s.id === deliverySaleId && s.source === deliverySaleSource)?.id}
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                    ⚠ Final Confirmation
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Once delivery is confirmed, the sales record will be permanently closed. No further modifications will be possible. Please ensure the vehicle has been delivered to the customer.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setDeliverySaleId(null);
                  setDeliverySaleSource(null);
                }}
                className="flex-1 px-4 py-2.5 text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeliveryConfirm}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle size={18} />
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Success Modal */}
      {showDeliverySuccess && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-4">
              <CheckCircle size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
              Delivery Confirmed!
            </h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              Vehicle delivery has been successfully confirmed. The sales lifecycle is now complete and the record has been closed.
            </p>
            
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                    Sales Lifecycle Complete
                  </p>
                  <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                    <li>• Status updated to "Delivered"</li>
                    <li>• Sales record permanently closed</li>
                    <li>• All data locked and archived</li>
                    <li>• Customer journey completed successfully</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowDeliverySuccess(false)}
              className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-bold flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Done
            </button>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {showPaymentSuccess && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4">
              <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
              Payment Complete!
            </h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              Payment has been successfully confirmed. Sales record is now permanently locked and the booking can proceed to delivery.
            </p>
            
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                    Status Updated
                  </p>
                  <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    <li>• Sales record permanently locked</li>
                    <li>• Status: "Payment Complete"</li>
                    <li>• No further edits allowed</li>
                    <li>• Ready for RTO and delivery processing</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowPaymentSuccess(false)}
              className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
