import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Store, Users, FileText, LogOut, Package, Search, Wrench, Activity, Menu, X, Sun, Moon, Zap, ShoppingCart } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useShowroom } from '../../state/ShowroomContext';
import { useTheme } from '../../state/ThemeContext';
import { useAuth } from '../../state/AuthContext';
import { roleDisplayNames } from '../../types/auth';
import { useBookings } from '../../state/BookingContext';
import { useInquiries } from '../../state/InquiryContext';
import { useVehicles } from '../../state/VehicleContext';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { activeShowroom } = useShowroom();
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { bookings } = useBookings();
    const { inquiries } = useInquiries();
    const { vehicles } = useVehicles();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchResults = () => {
        if (!searchQuery.trim()) return { b: [], i: [], v: [] };
        const q = searchQuery.toLowerCase();
        
        return {
            b: bookings.filter(b => b.id.toLowerCase().includes(q) || b.customer.fullName.toLowerCase().includes(q) || b.customer.mobile.includes(q)).slice(0, 3),
            i: inquiries.filter(i => i.customer.fullName.toLowerCase().includes(q) || i.customer.mobileNumber.includes(q)).slice(0, 3),
            v: vehicles.filter(v => v.model.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q)).slice(0, 3)
        };
    };

    const results = searchResults();
    const hasResults = results.b.length > 0 || results.i.length > 0 || results.v.length > 0;

    const allNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', roles: ['Super Admin', 'Showroom Manager', 'Sales Executive', 'Accountant', 'Documentation Officer'] },
        { icon: Store, label: 'Showrooms', path: '/admin/showrooms', roles: ['Super Admin'] },
        { icon: Package, label: 'Vehicle Catalog', path: '/admin/vehicles', roles: ['Super Admin', 'Showroom Manager'] },
        { icon: Users, label: 'Leads/Inquiries', path: '/admin/leads', roles: ['Super Admin', 'Showroom Manager', 'Sales Executive'] },
        { icon: FileText, label: 'Bookings', path: '/admin/bookings', roles: ['Super Admin', 'Showroom Manager', 'Sales Executive', 'Accountant', 'Documentation Officer'] },
        { icon: Zap, label: 'Sales Processing', path: '/admin/sales-processing', roles: ['Super Admin', 'Showroom Manager', 'Sales Executive', 'Documentation Officer'] },
        { icon: ShoppingCart, label: 'Direct Sales', path: '/admin/direct-sales', roles: ['Super Admin', 'Showroom Manager', 'Sales Executive'] },
        { icon: Wrench, label: 'Accessories', path: '/admin/accessories', roles: ['Super Admin', 'Showroom Manager', 'Sales Executive'] },
        { icon: Activity, label: 'Reports', path: '/admin/reports', roles: ['Super Admin', 'Showroom Manager', 'Accountant'] },
    ];

    const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

    return (
        <div className="h-screen bg-[var(--background)] flex overflow-hidden transition-colors duration-300">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-40 xl:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed xl:relative inset-y-0 left-0 z-50 w-64 h-screen bg-[var(--card-bg)] text-[var(--foreground)] flex flex-col flex-shrink-0 transition-transform duration-300 transform border-r border-[var(--border)] overflow-y-auto
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
            `}>
                <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shadow-md ring-4 ring-white/5 text-white"
                            style={{ backgroundColor: activeShowroom.branding.primaryColor }}
                        >
                            {activeShowroom.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-sm leading-tight text-[var(--text-primary)] truncate max-w-[130px]">{activeShowroom.name}</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium tracking-wide uppercase">Showroom Portal</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="xl:hidden p-1.5 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-grow p-3 mt-2 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                                    isActive
                                        ? 'bg-red-600 text-white shadow-md shadow-red-500/20 font-bold'
                                        : 'text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] font-semibold'
                                }`
                            }
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-[var(--border)]">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-xl transition-colors font-semibold">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content: fixed header + scrollable content */}
            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden bg-[var(--background)] transition-colors duration-300">
                {/* Header */}
                <header className="flex-shrink-0 bg-[var(--card-bg)] h-16 border-b border-[var(--border)] flex items-center justify-between px-4 xl:px-8 z-10 transition-colors duration-300 gap-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="xl:hidden p-2 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] rounded-lg"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-base font-bold text-[var(--foreground)] capitalize truncate">
                            {window.location.pathname.split('/').filter(Boolean).pop() || 'Dashboard'}
                        </h2>
                    </div>
                    
                    <div className="hidden md:block flex-1 max-w-md px-4" ref={searchRef}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                            <input 
                              type="text" 
                              placeholder="Search bookings, leads, vehicles..." 
                              className="w-full bg-[var(--bg-tertiary)] border-none rounded-xl pl-9 pr-4 py-2 font-medium text-xs focus:ring-2 focus:ring-red-500 outline-none text-[var(--text-primary)] transition-all" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onFocus={() => setIsSearchFocused(true)}
                            />
                            
                            {/* Search Dropdown */}
                            {isSearchFocused && searchQuery.length > 1 && (
                               <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                  {!hasResults ? (
                                     <div className="p-4 text-center text-sm font-medium text-[var(--text-muted)]">No results found for "{searchQuery}".</div>
                                  ) : (
                                     <div className="max-h-80 overflow-y-auto p-2">
                                        {results.b.length > 0 && (
                                           <div className="mb-2">
                                              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-3 py-1 mb-1">Bookings</p>
                                              {results.b.map(bk => (
                                                <Link to="/admin/bookings" key={bk.id} className="block px-3 py-2 hover:bg-[var(--hover-bg)] rounded-lg group" onClick={() => setIsSearchFocused(false)}>
                                                   <div className="flex justify-between items-center">
                                                      <span className="text-sm font-bold text-[var(--foreground)] group-hover:text-red-500">{bk.customer.fullName}</span>
                                                      <span className="text-xs bg-[var(--bg-tertiary)] text-[var(--text-muted)] px-2 py-0.5 rounded font-mono">{bk.id}</span>
                                                   </div>
                                                   <p className="text-xs text-[var(--text-muted)]">{bk.vehicleConfig.modelId} • {bk.status}</p>
                                                </Link>
                                              ))}
                                           </div>
                                        )}
                                        {results.i.length > 0 && (
                                           <div className="mb-2 border-t border-[var(--border)] pt-2">
                                              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-3 py-1 mb-1">Leads / Inquiries</p>
                                              {results.i.map(inq => (
                                                <Link to="/admin/leads" key={inq.id} className="block px-3 py-2 hover:bg-[var(--hover-bg)] rounded-lg group" onClick={() => setIsSearchFocused(false)}>
                                                   <div className="flex justify-between items-center">
                                                      <span className="text-sm font-bold text-[var(--foreground)] group-hover:text-red-500">{inq.customer.fullName}</span>
                                                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">{inq.source}</span>
                                                   </div>
                                                   <p className="text-xs text-[var(--text-muted)]">{inq.interest.modelName} • {inq.status}</p>
                                                </Link>
                                              ))}
                                           </div>
                                        )}
                                        {results.v.length > 0 && (
                                           <div className="mb-2 border-t border-[var(--border)] pt-2">
                                              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-3 py-1 mb-1">Vehicle Catalog</p>
                                              {results.v.map(v => (
                                                <Link to="/admin/vehicles" key={v.id} className="block px-3 py-2 hover:bg-[var(--hover-bg)] rounded-lg group" onClick={() => setIsSearchFocused(false)}>
                                                   <span className="text-sm font-bold text-[var(--foreground)] flex gap-2 items-center group-hover:text-red-500">
                                                      {v.brand} {v.model}
                                                      <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full">{v.category}</span>
                                                   </span>
                                                </Link>
                                              ))}
                                           </div>
                                        )}
                                     </div>
                                  )}
                               </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button 
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-red-600 transition-all hover:scale-110"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="p-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-red-600 transition-all hover:scale-110"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                        <div className="hidden sm:flex flex-col items-end">
                            <p className="text-sm font-bold text-[var(--foreground)] leading-tight">{user?.fullName || 'Staff'}</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium leading-tight">
                                {user ? roleDisplayNames[user.role] : 'Admin'}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                            {user?.fullName?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-6 xl:p-8">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
