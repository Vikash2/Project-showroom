import { useState, useMemo } from 'react';
import { useInquiries } from '../../state/InquiryContext';
import { useVehicles } from '../../state/VehicleContext';
import { Search, Filter, Phone, Mail, Calendar, User, FileText, X, Plus } from 'lucide-react';
import type { LeadStatus, Inquiry, CommunicationLog } from '../../types/inquiry';
import { QuotationTemplate } from '../../components/admin/DocumentTemplates';
import InquiryForm from '../../components/InquiryForm';

export default function LeadsManagement() {
  const { inquiries, updateInquiryStatus, addHistory } = useInquiries();
  const { vehicles } = useVehicles();
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [timelineFilter, setTimelineFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [selectedLead, setSelectedLead] = useState<Inquiry | null>(null);
  const [showQuotation, setShowQuotation] = useState(false);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [newLogData, setNewLogData] = useState<{type: CommunicationLog['type'], summary: string}>({ type: 'Call', summary: '' });

  const getStatusBadgeColor = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Hot Lead': return 'bg-red-100 text-red-800';
      case 'Test Ride Scheduled': return 'bg-purple-100 text-purple-800';
      case 'Booking Done': return 'bg-emerald-100 text-emerald-800';
      case 'Lost': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      const matchesSearch = inq.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            inq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inq.customer.mobileNumber.includes(searchTerm);
      const matchesStatus = statusFilter === 'All' || inq.status === statusFilter;
      const matchesSource = sourceFilter === 'All' || inq.source === sourceFilter;
      const matchesTimeline = timelineFilter === 'All' || inq.timeline === timelineFilter;
      
      let matchesDate = true;
      if (dateFilter === 'Today') {
         const today = new Date().toDateString();
         matchesDate = new Date(inq.date).toDateString() === today;
      } else if (dateFilter === 'This Week') {
         const diff = new Date().getTime() - new Date(inq.date).getTime();
         matchesDate = diff <= 7 * 24 * 60 * 60 * 1000;
      }

      return matchesSearch && matchesStatus && matchesSource && matchesTimeline && matchesDate;
    });
  }, [inquiries, searchTerm, statusFilter, sourceFilter, timelineFilter, dateFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const paginatedInquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInquiries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInquiries, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sourceFilter, timelineFilter, dateFilter]);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newLogData.summary.trim()) return;
    
    addHistory(selectedLead.id, {
      type: newLogData.type,
      summary: newLogData.summary,
      author: 'Admin'
    });
    
    // Refresh selected lead data
    setSelectedLead(inquiries.find(i => i.id === selectedLead.id) || null);
    setNewLogData({ type: 'Call', summary: '' });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Leads Management</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Track and manage customer inquiries</p>
        </div>
        <button
          onClick={() => setShowNewLeadModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-5 py-2.5 rounded-lg sm:rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-600/20 text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" /> New Lead
        </button>
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border)] p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID or phone..." 
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
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Test Ride Scheduled">Test Ride</option>
                <option value="Hot Lead">Hot Lead</option>
                <option value="Quotation Sent">Quotation Sent</option>
                <option value="Booking Done">Booking Done</option>
                <option value="Lost">Lost</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Source</label>
              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)]">
                <option value="All">All Sources</option>
                <option value="Website">Website</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Reference">Reference</option>
                <option value="Phone">Phone</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Timeline</label>
              <select value={timelineFilter} onChange={e => setTimelineFilter(e.target.value)} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)]">
                <option value="All">Any Timeline</option>
                <option value="Immediate">Immediate</option>
                <option value="Within 1 month">Within 1 month</option>
                <option value="3-6 months">3-6 months</option>
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
          {paginatedInquiries.map((inq) => {
            const vehicle = inq.interest.modelId ? vehicles.find(v => v.id === inq.interest.modelId) : null;
            
            return (
              <div key={inq.id} className="p-4 hover:bg-[var(--hover-bg)] transition" onClick={() => setSelectedLead(inq)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] font-bold flex-shrink-0 text-sm">
                    {inq.customer.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[var(--text-primary)] capitalize truncate">{inq.customer.fullName}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{inq.id}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{inq.customer.mobileNumber}</div>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                    <span className={`text-[9px] px-2 py-1 rounded-full font-bold whitespace-nowrap ${getStatusBadgeColor(inq.status)}`}>
                      {inq.status}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded whitespace-nowrap ${getPriorityColor(inq.priority)}`}>
                      {inq.priority}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Vehicle</span>
                    <span className="font-bold text-[var(--text-primary)] text-right truncate max-w-[60%]">
                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : inq.interest.modelName || 'Not Specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Timeline</span>
                    <span className="font-medium text-[var(--text-secondary)]">{inq.timeline || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Source</span>
                    <span className="font-medium text-[var(--text-secondary)]">{inq.source}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Date</span>
                    <span className="font-medium text-[var(--text-secondary)]">{new Date(inq.date).toLocaleDateString()}</span>
                  </div>
                  {(inq.testRideRequested || inq.financeRequired || inq.exchangeRequired) && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--border)]">
                      {inq.testRideRequested && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">Test Ride</span>}
                      {inq.financeRequired && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">Finance</span>}
                      {inq.exchangeRequired && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Exchange</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {paginatedInquiries.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              <User size={32} className="mx-auto mb-2 opacity-30" />
              <p>No leads found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Lead Info</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Vehicle Interest</th>
                <th className="p-4 font-semibold">Status & Priority</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedInquiries.map((inq) => {
                const vehicle = inq.interest.modelId ? vehicles.find(v => v.id === inq.interest.modelId) : null;
                return (
                  <tr key={inq.id} className="hover:bg-[var(--hover-bg)] transition">
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] font-bold shrink-0">
                          {inq.customer.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text-primary)] capitalize">{inq.customer.fullName}</div>
                          <div className="text-xs text-[var(--text-muted)] font-medium">{inq.id}</div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
                            <Calendar size={10} /> {new Date(inq.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)]">
                        <div className="flex items-center gap-2"><Phone size={14} className="text-[var(--text-muted)]" /> {inq.customer.mobileNumber}</div>
                        {inq.customer.email && <div className="flex items-center gap-2"><Mail size={14} className="text-[var(--text-muted)]" /> {inq.customer.email}</div>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        {vehicle ? `${vehicle.brand} ${vehicle.model}` : inq.interest.modelName || 'Not Specified'}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">Timeline: {inq.timeline || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-2">
                        <select 
                          value={inq.status}
                          onChange={(e) => updateInquiryStatus(inq.id, e.target.value as LeadStatus)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border-none appearance-none cursor-pointer ${getStatusBadgeColor(inq.status)}`}
                        >
                           <option value="New">New</option>
                           <option value="Contacted">Contacted</option>
                           <option value="Follow-up">Follow-up</option>
                           <option value="Test Ride Scheduled">Test Ride</option>
                           <option value="Hot Lead">Hot Lead</option>
                           <option value="Quotation Sent">Quotation Sent</option>
                           <option value="Booking Done">Booking Done</option>
                           <option value="Lost">Lost</option>
                           <option value="Closed">Closed</option>
                        </select>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getPriorityColor(inq.priority)}`}>
                          {inq.priority} Priority
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedLead(inq)}
                        className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-[var(--hover-bg)] rounded-lg transition" title="View Details"
                      >
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginatedInquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <User size={40} className="text-[var(--text-muted)] opacity-30" />
                      <p>No leads found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredInquiries.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)]">
          <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInquiries.length)} of {filteredInquiries.length} leads
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

      {selectedLead && (
        <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-[var(--card-bg)] h-full w-full sm:max-w-md shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[var(--border)]">
            <div className="p-4 sm:p-6 border-b border-[var(--border)] flex justify-between items-start bg-[var(--bg-secondary)]">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] capitalize truncate">{selectedLead.customer.fullName}</h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium truncate">{selectedLead.id}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
                   <span className={`text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border-none appearance-none cursor-pointer ${getStatusBadgeColor(selectedLead.status)} whitespace-nowrap`}>{selectedLead.status}</span>
                   <button 
                     onClick={() => setShowQuotation(true)}
                     className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-[0.2em] bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                   >
                     <FileText size={9} className="sm:w-[10px] sm:h-[10px]" /> Print
                   </button>
                   <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded ${getPriorityColor(selectedLead.priority)} whitespace-nowrap`}>{selectedLead.priority}</span>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-1.5 sm:p-2 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] rounded-full transition flex-shrink-0">
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
               <section>
                 <h3 className="text-[10px] sm:text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 sm:mb-4">Customer Details</h3>
                 <div className="space-y-2.5 sm:space-y-3 bg-[var(--bg-secondary)] p-3 sm:p-4 rounded-xl border border-[var(--border)]">
                    <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm"><Phone size={14} className="text-[var(--text-muted)] flex-shrink-0 sm:w-4 sm:h-4"/> <span className="text-[var(--text-secondary)] font-medium break-all">{selectedLead.customer.mobileNumber}</span></div>
                    {selectedLead.customer.email && <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm"><Mail size={14} className="text-[var(--text-muted)] flex-shrink-0 sm:w-4 sm:h-4"/> <span className="text-[var(--text-secondary)] font-medium break-all">{selectedLead.customer.email}</span></div>}
                    <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm"><User size={14} className="text-[var(--text-muted)] flex-shrink-0 sm:w-4 sm:h-4"/> <span className="text-[var(--text-secondary)] font-medium">{selectedLead.customer.city}</span></div>
                 </div>
               </section>

               <section>
                 <h3 className="text-[10px] sm:text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 sm:mb-4">Vehicle Interest</h3>
                 <div className="space-y-2.5 sm:space-y-3 bg-[var(--bg-secondary)] p-3 sm:p-4 rounded-xl border border-[var(--border)] text-xs sm:text-sm">
                    <div className="flex justify-between border-b border-[var(--border)] pb-2"><span className="text-[var(--text-muted)]">Model</span> <span className="font-bold text-[var(--text-primary)] text-right break-words max-w-[60%]">{selectedLead.interest.modelName}</span></div>
                    <div className="flex justify-between border-b border-[var(--border)] pb-2"><span className="text-[var(--text-muted)]">Timeline</span> <span className="font-bold text-[var(--text-primary)]">{selectedLead.timeline}</span></div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2">
                       {selectedLead.testRideRequested && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">Test Ride</span>}
                       {selectedLead.financeRequired && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">Finance Req.</span>}
                       {selectedLead.exchangeRequired && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">Exchange</span>}
                    </div>
                 </div>
               </section>

               <section>
                 <h3 className="text-[10px] sm:text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 sm:mb-4">Communication Log</h3>
                 
                 <form onSubmit={handleAddLog} className="mb-4 sm:mb-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-2.5 sm:p-3 shadow-sm">
                    <select 
                      value={newLogData.type} 
                      onChange={e => setNewLogData({...newLogData, type: e.target.value as any})}
                      className="w-full text-xs sm:text-sm bg-transparent font-medium text-[var(--text-secondary)] mb-2 focus:outline-none"
                    >
                      <option value="Call">Phone Call</option>
                      <option value="Email">Email Sent</option>
                      <option value="WhatsApp">WhatsApp Msg</option>
                      <option value="Note">Internal Note</option>
                    </select>
                    <textarea 
                      placeholder="Add conversation details..." 
                      value={newLogData.summary}
                      onChange={e => setNewLogData({...newLogData, summary: e.target.value})}
                      className="w-full text-xs sm:text-sm bg-[var(--bg-secondary)] rounded p-2 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[50px] sm:min-h-[60px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    />
                    <div className="flex justify-end mt-2">
                       <button type="submit" disabled={!newLogData.summary.trim()} className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded disabled:opacity-50">Add Log</button>
                    </div>
                 </form>

                 <div className="space-y-3 sm:space-y-4">
                    {selectedLead.history.map(log => (
                       <div key={log.id} className="relative pl-3 sm:pl-4 border-l-2 border-[var(--border)]">
                          <div className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[var(--text-muted)] rounded-full -left-[4px] sm:-left-[5px] top-1.5"></div>
                          <div className="flex items-center justify-between mb-1 text-[10px] sm:text-xs">
                             <span className="font-bold text-[var(--text-secondary)]">{log.type}</span>
                             <span className="text-[var(--text-muted)]">{new Date(log.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-[var(--text-secondary)] break-words">{log.summary}</p>
                          <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-1 font-medium bg-[var(--bg-secondary)] inline-block px-1.5 py-0.5 rounded">By {log.author}</p>
                       </div>
                    ))}
                    {selectedLead.history.length === 0 && <p className="text-xs sm:text-sm text-slate-500 italic">No communication logged yet.</p>}
                 </div>
               </section>
            </div>
          </div>
        </div>
      )}

      {showQuotation && selectedLead && (
        <QuotationTemplate 
          inquiry={selectedLead} 
          onClose={() => setShowQuotation(false)} 
        />
      )}

      {/* New Lead Modal */}
      {showNewLeadModal && (
        <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[var(--card-bg)] rounded-xl sm:rounded-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[var(--border)] animate-in fade-in zoom-in duration-300">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-secondary)] flex-shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">Create New Lead</h2>
                <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5">Capture walk-in or phone inquiry details</p>
              </div>
              <button
                onClick={() => setShowNewLeadModal(false)}
                className="p-1.5 sm:p-2 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] rounded-full transition"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <InquiryForm
                source="Walk-in"
                compact
                onSuccess={(id) => {
                  setShowNewLeadModal(false);
                  // Optionally open the newly created lead
                  const newLead = inquiries.find(inq => inq.id === id);
                  if (newLead) setSelectedLead(newLead);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
