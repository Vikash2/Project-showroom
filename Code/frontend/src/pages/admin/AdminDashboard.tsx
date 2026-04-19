import { useInquiries } from '../../state/InquiryContext';
import { useBookings } from '../../state/BookingContext';
import { useVehicles } from '../../state/VehicleContext';
import { Users, FileText, CheckCircle2, IndianRupee, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { inquiries } = useInquiries();
  const { bookings } = useBookings();

  // Metrics calculations
  const activeLeads = inquiries.filter(i => !i.status.includes('Closed')).length;
  const hotLeads = inquiries.filter(i => i.status === 'Hot Lead' || i.status === 'Test Ride Scheduled').length;
  
  const activeBookings = bookings.filter(b => b.status !== 'Delivered' && b.status !== 'Cancelled');
  const pendingPayments = bookings.filter(b => b.balanceDue > 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.bookingAmountPaid, 0);
  const { vehicles } = useVehicles();

  // Low Stock Calculation
  const lowStockThreshold = 3;
  const lowStockItems = vehicles.flatMap(v => 
    v.variants.flatMap(varnt => 
      varnt.colors.filter(c => c.stockQuantity <= lowStockThreshold).map(c => ({
        model: v.model,
        variant: varnt.name,
        color: c.name,
        stock: c.stockQuantity
      }))
    )
  ).slice(0, 4);

  // Recent Activities (Merge recent inquiries and bookings)
  const recentActivities = [
    ...inquiries.map(i => ({
      id: i.id,
      date: new Date(i.date),
      title: `New Inquiry: ${i.customer.fullName}`,
      type: 'inquiry',
      status: i.status
    })),
    ...bookings.map(b => ({
      id: b.id,
      date: new Date(b.date),
      title: `Booking Update: ${b.customer.fullName}`,
      type: 'booking',
      status: b.status
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);

  // Inquiry Source Breakdown
  const sourceCount = inquiries.reduce((acc, inq) => {
    acc[inq.source] = (acc[inq.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalSources = Object.values(sourceCount).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Total Active Leads', value: activeLeads, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Pending Bookings', value: activeBookings.length, icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Deliveries Ready', value: bookings.filter(b => b.status === 'Ready for Delivery').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Total Revenue Collected', value: `₹${(totalRevenue / 100000).toFixed(2)}L`, icon: IndianRupee, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--card-bg)] p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[var(--border)] shadow-sm flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-black text-[var(--muted)] uppercase tracking-widest mb-1 sm:mb-2">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">{stat.value}</p>
            </div>
            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Charts / Breakdown Section */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
           
           <div className="bg-[var(--card-bg)] rounded-2xl sm:rounded-3xl border border-[var(--border)] p-4 sm:p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                 <div>
                    <h3 className="text-lg sm:text-xl font-black text-[var(--foreground)] flex items-center gap-2">
                       <TrendingUp size={20} className="text-emerald-500 sm:w-6 sm:h-6" /> Lead Sources
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">Where your inquiries are originating from.</p>
                 </div>
              </div>
              
              <div className="space-y-4 sm:space-y-5">
                 {Object.entries(sourceCount).sort((a, b) => b[1] - a[1]).map(([source, count], idx) => {
                    const percentage = totalSources === 0 ? 0 : Math.round((count / totalSources) * 100);
                    const colors = ['bg-blue-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
                    return (
                       <div key={source}>
                          <div className="flex justify-between text-sm font-bold mb-2 text-[var(--foreground)]">
                             <span>{source}</span>
                             <span>{percentage}% ({count})</span>
                          </div>
                          <div className="w-full bg-[var(--input-bg)] rounded-full h-3 overflow-hidden">
                             <div 
                               className={`h-full rounded-full ${colors[idx % colors.length]} transition-all duration-1000`} 
                               style={{ width: `${percentage}%` }}
                             ></div>
                          </div>
                       </div>
                    );
                 })}
                 {totalSources === 0 && (
                    <div className="text-center text-[var(--muted)] py-6 font-medium">No lead data available.</div>
                 )}
               </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockItems.length > 0 && (
               <div className="bg-[var(--card-bg)] rounded-2xl sm:rounded-3xl border border-[var(--border)] p-4 sm:p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                     <h3 className="text-lg sm:text-xl font-black text-[var(--foreground)] flex items-center gap-2">
                        <AlertTriangle size={20} className="text-red-500 sm:w-6 sm:h-6" /> Low Stock Alerts
                     </h3>
                     <span className="bg-red-500/10 text-red-600 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                        {lowStockItems.length} Items Low
                     </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                     {lowStockItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                           <div>
                              <p className="text-sm font-bold text-[var(--text-primary)]">{item.model} {item.variant}</p>
                              <p className="text-xs text-[var(--text-muted)]">{item.color}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-lg font-black text-red-600">{item.stock}</p>
                              <p className="text-[10px] uppercase font-black text-[var(--text-muted)]">Left</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Quick Stats Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-[var(--card-bg)] to-[var(--input-bg)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-[var(--foreground)] border border-[var(--border)]">
                 <h4 className="text-xs sm:text-sm font-bold text-[var(--muted)] mb-1">Hot Leads</h4>
                 <p className="text-3xl sm:text-4xl font-black text-rose-500">{hotLeads}</p>
                 <p className="text-[10px] sm:text-xs text-[var(--muted)] mt-2 font-medium">High probability conversions</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg shadow-amber-500/20">
                 <h4 className="text-xs sm:text-sm font-bold text-amber-100 mb-1">Pending Payments</h4>
                 <p className="text-3xl sm:text-4xl font-black text-white">{pendingPayments.length}</p>
                 <p className="text-[10px] sm:text-xs text-amber-200 mt-2 font-medium">Require follow-up</p>
              </div>
           </div>

        </div>

        {/* Recent Activities Sidebar */}
        <div className="bg-[var(--card-bg)] rounded-2xl sm:rounded-3xl border border-[var(--border)] p-4 sm:p-6 md:p-8 shadow-sm h-fit">
           <h3 className="text-lg sm:text-xl font-black text-[var(--foreground)] flex items-center gap-2 mb-6 sm:mb-8">
              <Activity size={20} className="text-blue-500 sm:w-6 sm:h-6" /> Recent Activities
           </h3>
           
           {recentActivities.length === 0 ? (
              <div className="text-center text-[var(--muted)] py-6 font-medium text-sm">No recent activities.</div>
           ) : (
              <div className="space-y-4 sm:space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border)] before:to-transparent">
                 {recentActivities.map((act, i) => (
                    <div key={act.id + i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                       
                       <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--card-bg)] border-4 border-[var(--border)] shrink-0 z-10 text-[var(--muted)] shadow-sm relative left-[-16px] sm:left-[-20px] md:left-0">
                          {act.type === 'inquiry' ? <Users size={14} className="text-blue-500 sm:w-4 sm:h-4" /> : <FileText size={14} className="text-orange-500 sm:w-4 sm:h-4" />}
                       </div>
                       
                       <div className="w-[calc(100%-2rem)] sm:w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                          <div className="flex justify-between items-center mb-1">
                             <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider ${act.type==='inquiry' ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                {act.type}
                             </span>
                             <span className="text-[9px] sm:text-[10px] font-black text-[var(--muted)] capitalize">{act.date.toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-[var(--foreground)] line-clamp-1">{act.title}</p>
                          <p className="text-[10px] sm:text-xs text-[var(--muted)] mt-1 font-medium">{act.status}</p>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
