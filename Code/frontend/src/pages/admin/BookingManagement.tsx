import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../../state/BookingContext';
import { useVehicles } from '../../state/VehicleContext';
import { Search, Filter, Calendar, FileText, X, Download, ShieldCheck, CreditCard, Plus, DollarSign } from 'lucide-react';
import type { BookingStatus, Booking } from '../../types/booking';
import { BookingSummaryTemplate } from '../../components/admin/DocumentTemplates';
import FinalSalesForm from '../../components/Sales/FinalSalesForm';
import DocumentUploadSection from '../../components/Sales/DocumentUploadSection';

export default function BookingManagement() {
  const { bookings, updateBookingStatus, updateBookingSale } = useBookings();
  const { vehicles } = useVehicles();
  const navigate = useNavigate();
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'All'>('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal/Detail State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [showFinalSales, setShowFinalSales] = useState(false);

  const getStatusBadgeColor = (status: BookingStatus) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Pending Approval': return 'bg-orange-100 text-orange-800';
      case 'Payment Pending': return 'bg-orange-100 text-orange-800';
      case 'Payment Complete': return 'bg-emerald-100 text-emerald-800';
      case 'Delivered': return 'bg-purple-100 text-purple-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Sales Finalized': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(bk => {
      const matchesSearch = bk.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            bk.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            bk.customer.mobile.includes(searchTerm);
      const matchesStatus = statusFilter === 'All' || bk.status === statusFilter;
      
      const matchesPayment = paymentFilter === 'All' || 
                             (paymentFilter === 'Fully Paid' && bk.balanceDue === 0) ||
                             (paymentFilter === 'Pending Payment' && bk.balanceDue > 0);
      
      const matchesVehicle = vehicleFilter === 'All' || bk.vehicleConfig.modelId === vehicleFilter;

      let matchesDate = true;
      if (dateFilter === 'Today') {
         const today = new Date().toDateString();
         matchesDate = new Date(bk.date).toDateString() === today;
      } else if (dateFilter === 'This Week') {
         const diff = new Date().getTime() - new Date(bk.date).getTime();
         matchesDate = diff <= 7 * 24 * 60 * 60 * 1000;
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesVehicle && matchesDate;
    });
  }, [bookings, searchTerm, statusFilter, paymentFilter, vehicleFilter, dateFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter, vehicleFilter, dateFilter]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Booking Management</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Track and manage customer vehicle bookings</p>
        </div>
        <button 
          onClick={() => navigate('new')}
          className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-5 py-2.5 rounded-lg sm:rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-600/20 text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" /> New Booking
        </button>
      </div>

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
            <Filter size={18} /> Advanced Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)]"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Documentation In-Progress">Documentation</option>
                <option value="Stock Allocated">Stock Allocated</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Payment Pending">Payment Pending</option>
                <option value="Payment Complete">Payment Complete</option>
                <option value="RTO Processing">RTO Processing</option>
                <option value="Ready for Delivery">Ready Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Sales Finalized">Sales Finalized</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Payment</label>
              <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)]">
                <option value="All">All Payments</option>
                <option value="Fully Paid">Fully Paid</option>
                <option value="Pending Payment">Pending Due</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Vehicle</label>
              <select value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)]">
                <option value="All">All Models</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Date</label>
              <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)]">
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        
        {/* Mobile Card View */}
        <div className="block md:hidden divide-y divide-[var(--border)]">
          {paginatedBookings.map((bk) => {
            const v = vehicles.find(v => v.id === bk.vehicleConfig.modelId);
            const vr = v?.variants.find(va => va.id === bk.vehicleConfig.variantId);
            
            return (
              <div key={bk.id} className="p-4 hover:bg-[var(--hover-bg)] transition" onClick={() => setSelectedBooking(bk)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0 border border-red-100 text-sm">
                    {bk.customer.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[var(--text-primary)] truncate">{bk.id}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{bk.customer.fullName}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{bk.customer.mobile}</div>
                  </div>
                  <span className={`text-[9px] px-2 py-1 rounded-full font-bold whitespace-nowrap ${getStatusBadgeColor(bk.status)}`}>
                    {bk.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Vehicle</span>
                    <span className="font-bold text-[var(--text-primary)] text-right truncate max-w-[60%]">
                      {v?.brand} {v?.model} • {vr?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Total Price</span>
                    <span className="font-black text-[var(--text-primary)]">₹{bk.pricing.onRoadPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Paid</span>
                    <span className="font-bold text-emerald-600">₹{bk.bookingAmountPaid.toLocaleString('en-IN')}</span>
                  </div>
                  {bk.balanceDue > 0 && (
                    <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                      <span className="text-[var(--text-muted)]">Balance Due</span>
                      <span className="font-bold text-red-600">₹{bk.balanceDue.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Date</span>
                    <span className="font-medium text-[var(--text-secondary)]">{new Date(bk.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {paginatedBookings.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              <CreditCard size={32} className="mx-auto mb-2 opacity-30" />
              <p>No bookings found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Booking Info</th>
                <th className="p-4 font-semibold">Vehicle Conf</th>
                <th className="p-4 font-semibold">Financials</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedBookings.map((bk) => {
                 const v = vehicles.find(v => v.id === bk.vehicleConfig.modelId);
                 const vr = v?.variants.find(va => va.id === bk.vehicleConfig.variantId);
                 
                 return (
                <tr 
                  key={bk.id} 
                  onClick={() => setSelectedBooking(bk)}
                  className="hover:bg-[var(--hover-bg)] transition cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold shrink-0 border border-red-100">
                        {bk.customer.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                           {bk.id}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] font-medium">{bk.customer.fullName} • {bk.customer.mobile}</div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold" title={new Date(bk.date).toLocaleString()}>
                          <Calendar size={10} /> {new Date(bk.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-[var(--text-primary)]">{v?.brand} {v?.model}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{vr?.name} • <span className="text-[var(--text-secondary)]">{bk.vehicleConfig.colorName}</span></div>
                    {bk.selectedAccessories.length > 0 && (
                       <div className="text-[10px] bg-[var(--bg-tertiary)] text-[var(--text-muted)] px-2 py-0.5 mt-1 rounded inline-block font-medium">
                          +{bk.selectedAccessories.length} Accessories
                       </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-black text-[var(--text-primary)]">₹{bk.pricing.onRoadPrice.toLocaleString('en-IN')}</div>
                    <div className="text-xs mt-1 font-medium text-emerald-600">Paid: ₹{bk.bookingAmountPaid.toLocaleString('en-IN')}</div>
                    {bk.balanceDue > 0 ? (
                       <div className="text-[10px] mt-0.5 uppercase tracking-wider font-bold text-red-500">Due: ₹{bk.balanceDue.toLocaleString('en-IN')}</div>
                    ) : (
                       <div className="text-[10px] mt-0.5 uppercase tracking-wider font-bold text-emerald-500 flex items-center gap-1"><ShieldCheck size={10}/> Full Paid</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-2">
                      <select 
                        value={bk.status}
                        onChange={(e) => updateBookingStatus(bk.id, e.target.value as BookingStatus)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border border-transparent appearance-none cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-slate-300 focus:outline-none transition-all ${getStatusBadgeColor(bk.status)}`}
                      >
                         <option value="Pending">Pending (Dep.)</option>
                         <option value="Confirmed">Confirmed</option>
                         <option value="Documentation In-Progress">Documentation</option>
                         <option value="Stock Allocated">Stock Allocated</option>
                         <option value="Pending Approval">Pending Approval</option>
                         <option value="Payment Pending">Payment Pending</option>
                         <option value="Payment Complete">Payment Complete</option>
                         <option value="RTO Processing">RTO Processing</option>
                         <option value="PDI Scheduled">PDI Scheduled</option>
                         <option value="Ready for Delivery">Ready Delivery</option>
                         <option value="Delivered">Delivered</option>
                         <option value="Cancelled">Cancelled</option>
                         <option value="Sales Finalized">Sales Finalized</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Download Invoice">
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => setSelectedBooking(bk)}
                        className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="View Detail"
                      >
                        <FileText size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
              {paginatedBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <CreditCard size={40} className="text-[var(--text-muted)] opacity-30" />
                      <p>No bookings found matching criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredBookings.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)]">
          <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-bold rounded-lg transition ${
                      currentPage === pageNum
                        ? 'bg-red-600 text-white'
                        : 'border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-[2px] z-50 flex items-center justify-end animate-in fade-in duration-200">
          <div className="bg-[var(--card-bg)] h-full w-full max-w-lg shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[var(--border)]">
            <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
                     {selectedBooking.id}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] font-medium mt-1">{selectedBooking.customer.fullName} • {new Date(selectedBooking.date).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-2 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] rounded-full transition">
                  <X size={20} />
                </button>
              </div>
              
              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${getStatusBadgeColor(selectedBooking.status)}`}>{selectedBooking.status}</span>
                <div className="flex-1"></div>
                {(selectedBooking.status === 'Payment Complete' || selectedBooking.status === 'RTO Processing') && (
                  <button 
                    onClick={() => setShowFinalSales(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-green-600 text-white hover:bg-green-700 transition-all shadow-md shadow-green-600/20"
                  >
                    <DollarSign size={16} /> Final Sales
                  </button>
                )}
                <button 
                  onClick={() => setShowPrintView(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-red-600 text-white hover:bg-red-700 transition-all shadow-md shadow-red-600/20"
                >
                  <FileText size={16} /> View Receipt
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
               <section>
                 <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 border-b border-[var(--border)] pb-2">Financial Summary</h3>                 <div className="bg-[var(--bg-secondary)] p-5 rounded-xl border border-[var(--border)]">
                    <div className="flex justify-between items-end mb-4 border-b border-[var(--border)] pb-4">
                       <span className="text-[var(--text-muted)] font-bold">Total On-Road Price</span>
                       <span className="text-2xl font-black text-[var(--text-primary)]">₹{selectedBooking.pricing.onRoadPrice.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div className="space-y-3 text-sm font-medium">
                       <div className="flex justify-between items-center px-3 py-2 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                          <span>Amount Paid</span>
                          <span className="font-bold">₹{selectedBooking.bookingAmountPaid.toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between items-center px-3 py-2 bg-red-50 text-red-700 rounded border border-red-100">
                          <span>Balance Due</span>
                          <span className="font-bold">₹{selectedBooking.balanceDue.toLocaleString('en-IN')}</span>
                       </div>
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-[var(--border)]">
                       <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">Receipts</div>
                       {selectedBooking.payments.map(pay => (
                          <div key={pay.id} className="flex justify-between items-center text-xs mb-2 text-[var(--text-secondary)] font-medium">
                             <span>{new Date(pay.date).toLocaleDateString()} • {pay.type} ({pay.method})</span>
                             <span className="font-bold text-[var(--text-primary)]">₹{pay.amount.toLocaleString('en-IN')}</span>
                          </div>
                       ))}
                    </div>
                 </div>
               </section>

               <section>
                 <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 border-b border-[var(--border)] pb-2">Required Documents</h3>
                 <DocumentUploadSection booking={selectedBooking} readOnly={true} />
               </section>
            </div>
          </div>
        </div>
      )}

      {showPrintView && selectedBooking && (
        <BookingSummaryTemplate 
           booking={selectedBooking} 
           onClose={() => setShowPrintView(false)} 
        />
      )}

      {showFinalSales && selectedBooking && (
        <FinalSalesForm
          booking={selectedBooking}
          onClose={() => {
            setShowFinalSales(false);
            setSelectedBooking(null);
          }}
          onSave={async (updatedBooking) => {
            await updateBookingSale(updatedBooking.id, updatedBooking.sale!);
            if (updatedBooking.status !== selectedBooking.status) {
              updateBookingStatus(updatedBooking.id, updatedBooking.status);
            }
            setShowFinalSales(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}
