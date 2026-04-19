import { useState, useMemo } from 'react';
import { useBookings } from '../../state/BookingContext';
import { useInquiries } from '../../state/InquiryContext';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ArrowUpRight, 
  Download, 
  BarChart
} from 'lucide-react';

export default function ShowroomReports() {
  const { bookings } = useBookings();
  const { inquiries } = useInquiries();
  const [activeTab, setActiveTab] = useState<'sales' | 'leads' | 'inventory'>('sales');

  // Calculations for Sales Report
  const totalRevenue = useMemo(() => bookings.reduce((sum, b) => sum + b.bookingAmountPaid, 0), [bookings]);
  const avgTicketSize = useMemo(() => totalRevenue / (bookings.length || 1), [totalRevenue, bookings]);
  
  const modelWiseSales = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach(b => {
      counts[b.vehicleConfig.modelId] = (counts[b.vehicleConfig.modelId] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [bookings]);

  // Calculations for Leads Report
  const conversionRate = useMemo(() => {
    return inquiries.length > 0 ? (bookings.length / inquiries.length) * 100 : 0;
  }, [bookings, inquiries]);

  // Calculations for Inventory Report
  // (totalStock calculation removed as it was unused)

  const exportToCSV = (type: string) => {
    let headers = '';
    let rows = '';

    if (type === 'Leads') {
      headers = 'ID,Name,Mobile,Source,Status,Vehicle\n';
      rows = inquiries.map(i => `${i.id},${i.customer.fullName},${i.customer.mobileNumber},${i.source},${i.status},${i.interest.modelName}`).join('\n');
    } else {
      headers = 'ID,Customer,Vehicle,Paid,Balance,Status\n';
      rows = bookings.map(b => `${b.id},${b.customer.fullName},${b.vehicleConfig.modelId},${b.bookingAmountPaid},${b.balanceDue},${b.status}`).join('\n');
    }

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-full pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Business Intelligence</h1>
          <p className="text-[var(--text-secondary)] font-medium">Real-time performance analytics and reports</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => exportToCSV('Sales_Bookings')}
             className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] px-6 py-3 rounded-xl font-bold text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-all shadow-sm"
           >
             <Download size={18} /> Export Data
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--bg-secondary)] p-1.5 rounded-2xl w-fit">
        {[
          { id: 'sales', label: 'Sales Perf', icon: TrendingUp },
          { id: 'leads', label: 'Lead ROI', icon: Users },
          { id: 'inventory', label: 'Stock Health', icon: Package }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[var(--card-bg)] text-red-600 shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[var(--card-bg)] p-8 rounded-3xl border border-[var(--border)] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Gross Revenue</p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-4xl font-black text-[var(--text-primary)]">₹{(totalRevenue / 100000).toFixed(2)}L</h3>
               <span className="text-emerald-500 font-bold text-sm flex items-center gap-1"><ArrowUpRight size={14} /> 12%</span>
            </div>
         </div>
         <div className="bg-[var(--card-bg)] p-8 rounded-3xl border border-[var(--border)] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Total Conversions</p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-4xl font-black text-[var(--text-primary)]">{bookings.length}</h3>
               <span className="text-blue-500 font-bold text-sm flex items-center gap-1">{conversionRate.toFixed(1)}% Rate</span>
            </div>
         </div>
         <div className="bg-[var(--card-bg)] p-8 rounded-3xl border border-[var(--border)] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Avg Transaction</p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-4xl font-black text-[var(--text-primary)]">₹{(avgTicketSize / 1000).toFixed(1)}K</h3>
               <span className="text-amber-500 font-bold text-sm flex items-center gap-1"><TrendingUp size={14} /> Stable</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Detailed Breakdown Card */}
         <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border)] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
                  <BarChart className="text-red-600" /> Model-wise Sales
               </h3>
               <select className="bg-[var(--bg-secondary)] border-none rounded-lg text-xs font-bold px-3 py-1 text-[var(--text-muted)] outline-none">
                  <option>Quantity Sold</option>
                  <option>Revenue Share</option>
               </select>
            </div>
            
            <div className="space-y-6">
               {modelWiseSales.map(([model, count]) => (
                  <div key={model}>
                     <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-[var(--text-secondary)] capitalize">{model}</span>
                        <span className="text-[var(--text-primary)]">{count} Units</span>
                     </div>
                     <div className="w-full bg-[var(--bg-secondary)] rounded-full h-3 overflow-hidden">
                        <div 
                           className="bg-red-600 h-full rounded-full transition-all duration-1000" 
                           style={{ width: `${(count / (bookings.length || 1)) * 100}%` }}
                        ></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Distribution / Recent Highlights */}
         <div className="bg-[var(--card-bg)] rounded-3xl p-8 border border-[var(--border)] relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
            
            <div>
               <h3 className="text-xl font-black flex items-center gap-2 mb-2 text-[var(--text-primary)]">
                  <TrendingUp className="text-red-500" /> Goal Completion
               </h3>
               <p className="text-[var(--text-secondary)] text-sm font-medium">Monthly target of ₹25L Revenue</p>
            </div>

            <div className="py-12 flex items-center justify-center">
               <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                     <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-[var(--bg-tertiary)]" />
                     <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * (totalRevenue / 2500000))} className="text-red-600 transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-3xl font-black text-[var(--text-primary)]">{Math.round((totalRevenue / 2500000) * 100)}%</span>
                     <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Achieved</span>
                  </div>
               </div>
            </div>

            <div className="bg-red-50 backdrop-blur-md rounded-2xl p-4 border border-red-100">
               <p className="text-xs font-bold text-red-900">Strategy Tip:</p>
               <p className="text-sm font-medium text-red-800 italic">"High demand for electric models observed in Test Ride patterns. Consider upselling accessories for premium variants."</p>
            </div>
         </div>
      </div>
    </div>
  );
}
