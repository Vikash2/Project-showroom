import { useState, useMemo } from 'react';
import { useShowroom } from '../../state/ShowroomContext';
import { Edit2, Shield, Phone, Mail, Clock, Palette, MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ShowroomManagement = () => {
    const { allShowrooms, activeShowroom } = useShowroom();
    const [editingShowroom, setEditingShowroom] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const handleEdit = (showroom: any) => {
        setEditingShowroom({ ...showroom });
    };

    const handleSave = () => {
        // In a real app, this would be an API call
        toast.success(`${editingShowroom.name} configuration updated successfully!`);
        setEditingShowroom(null);
    };

    // Filter and pagination
    const filteredShowrooms = useMemo(() => {
        return allShowrooms.filter(showroom =>
            showroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            showroom.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            showroom.contact.phone.includes(searchTerm)
        );
    }, [allShowrooms, searchTerm]);

    const totalPages = Math.ceil(filteredShowrooms.length / itemsPerPage);
    const paginatedShowrooms = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredShowrooms.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredShowrooms, currentPage, itemsPerPage]);

    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-[var(--card-bg)] p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-[var(--border)] shadow-sm">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight">Showroom Management</h1>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1 sm:mt-2 font-medium">Configure branding, contact details, and locations for all branches.</p>
                </div>
                <button className="btn-primary flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 shadow-2xl shadow-red-600/20 w-full sm:w-auto justify-center whitespace-nowrap">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-widest">+ Add Showroom</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border)] p-3 sm:p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, city or phone..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm sm:text-base bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--text-primary)] transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {paginatedShowrooms.map((showroom) => (
                    <div key={showroom.showroomId} className="card p-4 sm:p-6 md:p-8 group border-[var(--border)] transition-all duration-300">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-6 sm:mb-8">
                            <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
                                <div
                                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 flex-shrink-0"
                                    style={{ backgroundColor: showroom.branding.primaryColor }}
                                >
                                    {showroom.name.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight truncate">{showroom.name}</h3>
                                    <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black bg-emerald-500/10 text-emerald-600 mt-1 sm:mt-2 uppercase tracking-[0.15em] transition-colors">
                                        <Shield size={10} className="fill-current sm:w-3 sm:h-3" /> Authorized
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleEdit(showroom)}
                                className="p-2 sm:p-3 text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--hover-bg)] rounded-lg sm:rounded-xl transition-all self-end sm:self-start"
                                title="Edit Showroom"
                            >
                                <Edit2 size={18} className="sm:w-[22px] sm:h-[22px]" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm font-medium">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2.5 sm:gap-3.5 text-[var(--text-secondary)]">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
                                        <Phone size={14} className="sm:w-4 sm:h-4" />
                                    </div>
                                    <span className="font-bold tracking-tight">{showroom.contact.phone}</span>
                                </div>
                                <div className="flex items-center gap-2.5 sm:gap-3.5 text-[var(--text-secondary)]">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
                                        <Mail size={14} className="sm:w-4 sm:h-4" />
                                    </div>
                                    <span className="font-bold truncate">{showroom.contact.email}</span>
                                </div>
                                <div className="flex items-center gap-2.5 sm:gap-3.5 text-[var(--text-secondary)]">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
                                        <MapPin size={14} className="sm:w-4 sm:h-4" />
                                    </div>
                                    <span className="font-bold">{showroom.address.city}, {showroom.address.state}</span>
                                </div>
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2.5 sm:gap-3.5 text-[var(--text-secondary)]">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
                                        <Clock size={14} className="sm:w-4 sm:h-4" />
                                    </div>
                                    <span className="font-bold text-xs sm:text-sm">{showroom.workingHours.weekdays}</span>
                                </div>
                                <div className="flex items-center gap-2.5 sm:gap-3.5 text-[var(--text-secondary)]">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
                                        <Palette size={14} className="sm:w-4 sm:h-4" />
                                    </div>
                                    <span className="font-bold truncate">Palette: {showroom.branding.primaryColor}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="text-[9px] sm:text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">
                                ID: {showroom.showroomId}
                            </div>
                            {activeShowroom.showroomId === showroom.showroomId && (
                                <span className="text-[9px] sm:text-[10px] text-[var(--primary)] font-black uppercase tracking-[0.15em] bg-red-500/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg">
                                    Currently Active View
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {filteredShowrooms.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)]">
                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredShowrooms.length)} of {filteredShowrooms.length} showrooms
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

            {/* Modal / Sidebar for editing */}
            {editingShowroom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-4 sm:p-0">
                    <div className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-md" onClick={() => setEditingShowroom(null)} />
                    <div className="relative w-full sm:w-full max-w-2xl sm:max-w-xl sm:h-full bg-[var(--card-bg)] sm:max-h-none max-h-[90vh] shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-right duration-500 rounded-2xl sm:rounded-none">
                        <div className="p-4 sm:p-6 md:p-8 border-b border-[var(--border)] flex justify-between items-start bg-[var(--bg-secondary)]">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">Showroom Profile</h2>
                                <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium mt-1 sm:mt-2">Refine branch specific configurations.</p>
                            </div>
                            <button onClick={() => setEditingShowroom(null)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--hover-bg)] transition-all text-2xl sm:text-3xl font-light flex-shrink-0 ml-2">&times;</button>
                        </div>
                        <div className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 sm:space-y-8 md:space-y-12">
                            <section className="space-y-3 sm:space-y-4 md:space-y-6">
                                <h4 className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Identity & Recognition</h4>
                                <div className="grid gap-3 sm:gap-4 md:gap-6">
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <label className="block text-xs sm:text-sm font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Showroom Name</label>
                                        <input type="text" value={editingShowroom.name} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium focus:ring-2 focus:ring-red-500 transition-all text-[var(--text-primary)]" onChange={(e) => setEditingShowroom({ ...editingShowroom, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <label className="block text-xs sm:text-sm font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Tagline</label>
                                        <input type="text" value={editingShowroom.tagline} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium focus:ring-2 focus:ring-red-500 transition-all text-[var(--text-primary)]" onChange={(e) => setEditingShowroom({ ...editingShowroom, tagline: e.target.value })} />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3 sm:space-y-4 md:space-y-6">
                                <h4 className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Aesthetic Settings</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <label className="block text-xs sm:text-sm font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Brand Primary</label>
                                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 bg-[var(--bg-secondary)] p-2 sm:p-3 rounded-lg sm:rounded-2xl border border-[var(--border)]">
                                            <input type="color" value={editingShowroom.branding.primaryColor} className="w-8 h-8 sm:w-10 sm:h-10 p-0 border-0 bg-transparent cursor-pointer rounded-lg overflow-hidden flex-shrink-0" onChange={(e) => setEditingShowroom({ ...editingShowroom, branding: { ...editingShowroom.branding, primaryColor: e.target.value } })} />
                                            <input type="text" value={editingShowroom.branding.primaryColor} className="bg-transparent text-xs sm:text-sm font-black text-[var(--text-primary)] outline-none flex-grow" onChange={(e) => setEditingShowroom({ ...editingShowroom, branding: { ...editingShowroom.branding, primaryColor: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3 sm:space-y-4 md:space-y-6">
                                <h4 className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Communication</h4>
                                <div className="grid gap-3 sm:gap-4 md:gap-6">
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <label className="block text-xs sm:text-sm font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Professional Phone</label>
                                        <input type="text" value={editingShowroom.contact.phone} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium focus:ring-2 focus:ring-red-500 transition-all text-[var(--text-primary)]" onChange={(e) => setEditingShowroom({ ...editingShowroom, contact: { ...editingShowroom.contact, phone: e.target.value } })} />
                                    </div>
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <label className="block text-xs sm:text-sm font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Support Email</label>
                                        <input type="email" value={editingShowroom.contact.email} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium focus:ring-2 focus:ring-red-500 transition-all text-[var(--text-primary)]" onChange={(e) => setEditingShowroom({ ...editingShowroom, contact: { ...editingShowroom.contact, email: e.target.value } })} />
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="p-3 sm:p-4 md:p-6 border-t border-[var(--border)] flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-6 bg-[var(--bg-secondary)]">
                            <button onClick={() => setEditingShowroom(null)} className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition order-2 sm:order-1">Discard</button>
                            <button onClick={handleSave} className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 order-1 sm:order-2">Apply Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowroomManagement;
