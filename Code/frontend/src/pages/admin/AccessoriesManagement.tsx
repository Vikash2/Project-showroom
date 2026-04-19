import { useState, useMemo } from 'react';
import { useAccessories } from '../../state/AccessoryContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Shield, 
  Settings, 
  Wrench,
  Check,
  X
} from 'lucide-react';
import type { Accessory, AccessoryCategory } from '../../types/accessory';

export default function AccessoriesManagement() {
  const { accessories, addAccessory, updateAccessory, deleteAccessory } = useAccessories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AccessoryCategory | 'All'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Form State
  const [formData, setFormData] = useState<Omit<Accessory, 'id'>>({
    name: '',
    description: '',
    price: 0,
    installationCharges: 0,
    category: 'Protection',
    inStock: true
  });

  const categories: (AccessoryCategory | 'All')[] = ['All', 'Safety', 'Protection', 'Convenience', 'Aesthetics', 'Style'];

  const filteredAccessories = useMemo(() => {
    return accessories.filter(acc => {
      const matchesSearch = acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           acc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || acc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [accessories, searchQuery, selectedCategory]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAccessories.length / itemsPerPage);
  const paginatedAccessories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAccessories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAccessories, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccessory) {
      updateAccessory(editingAccessory.id, formData);
    } else {
      addAccessory(formData);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingAccessory(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      installationCharges: 0,
      category: 'Protection',
      inStock: true
    });
  };

  const openEditModal = (acc: Accessory) => {
    setEditingAccessory(acc);
    setFormData({
      name: acc.name,
      description: acc.description,
      price: acc.price,
      installationCharges: acc.installationCharges,
      category: acc.category,
      inStock: acc.inStock
    });
    setIsAddModalOpen(true);
  };

  const getCategoryIcon = (cat: AccessoryCategory) => {
    switch (cat) {
      case 'Safety': return <ShieldCheck size={20} className="text-emerald-500" />;
      case 'Protection': return <Shield size={20} className="text-blue-500" />;
      case 'Convenience': return <Settings size={20} className="text-purple-500" />;
      default: return <Wrench size={20} className="text-amber-500" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">Accessories Management</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Manage your genuine {filteredAccessories.length} accessories catalog</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" /> Add Accessory
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[var(--card-bg)] p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm border border-[var(--border)] flex flex-col gap-3 sm:gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or description..." 
            className="w-full bg-[var(--bg-secondary)] border-none rounded-lg px-10 py-2.5 text-sm sm:text-base font-medium focus:ring-2 focus:ring-red-500 outline-none text-[var(--text-primary)] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-red-50 text-red-600' : 'text-[var(--text-muted)] hover:bg-[var(--hover-bg)]'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accessories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {paginatedAccessories.map(acc => (
          <div key={acc.id} className="group bg-[var(--card-bg)] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-[var(--border)] shadow-sm hover:shadow-lg hover:border-red-200 transition-all duration-300 relative overflow-hidden flex flex-col">
             {/* Status Badge */}
             <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
                {acc.inStock ? (
                  <span className="bg-emerald-50 text-emerald-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1 whitespace-nowrap">
                    <Check size={10} /> In Stock
                  </span>
                ) : (
                  <span className="bg-red-50 text-red-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-red-100 flex items-center gap-1 whitespace-nowrap">
                    <X size={10} /> Out
                  </span>
                )}
             </div>

             <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6 pr-20">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[var(--bg-secondary)] rounded-lg sm:rounded-2xl flex items-center justify-center text-[var(--text-muted)] group-hover:bg-red-50 group-hover:text-red-500 transition-colors shadow-inner flex-shrink-0">
                   {acc.category === 'Safety' && <ShieldCheck size={20} className="sm:w-6 sm:h-6" />}
                   {acc.category === 'Protection' && <Shield size={20} className="sm:w-6 sm:h-6" />}
                   {acc.category === 'Convenience' && <Settings size={20} className="sm:w-6 sm:h-6" />}
                   {!['Safety', 'Protection', 'Convenience'].includes(acc.category) && <Wrench size={20} className="sm:w-6 sm:h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-black text-sm sm:text-base text-[var(--text-primary)] group-hover:text-red-600 transition-colors truncate">{acc.name}</h3>
                   <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{acc.category}</p>
                </div>
             </div>

             <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4 sm:mb-6 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] font-medium leading-relaxed flex-grow">
                {acc.description}
             </p>

             <div className="flex items-end justify-between border-t border-[var(--border)] pt-4 sm:pt-6">
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Price</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg sm:text-2xl font-black text-[var(--text-primary)]">₹{acc.price.toLocaleString('en-IN')}</span>
                    {acc.installationCharges > 0 && <span className="text-[9px] sm:text-xs text-[var(--text-muted)] font-bold">+₹{acc.installationCharges}</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                   <button 
                     onClick={() => openEditModal(acc)}
                     className="p-1.5 sm:p-2 hover:bg-[var(--hover-bg)] rounded-lg text-[var(--text-muted)] hover:text-blue-500 transition-colors"
                     title="Edit"
                   >
                     <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                   </button>
                   <button 
                     onClick={() => { if(confirm('Delete this accessory?')) deleteAccessory(acc.id); }}
                     className="p-1.5 sm:p-2 hover:bg-[var(--hover-bg)] rounded-lg text-[var(--text-muted)] hover:text-red-500 transition-colors"
                     title="Delete"
                   >
                     <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filteredAccessories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)]">
          <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAccessories.length)} of {filteredAccessories.length} accessories
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

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-[var(--card-bg)] w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
              <div className="p-4 sm:p-6 md:p-8 border-b border-[var(--border)] flex justify-between items-start">
                 <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[var(--text-primary)]">
                    {editingAccessory ? 'Edit Accessory' : 'Add New Accessory'}
                 </h2>
                 <button onClick={closeModal} className="p-1.5 sm:p-2 hover:bg-[var(--hover-bg)] rounded-lg sm:rounded-full text-[var(--text-muted)] transition-colors flex-shrink-0 ml-2">
                    <X size={20} className="sm:w-6 sm:h-6" />
                 </button>
              </div>
              <form onSubmit={handleSubmit} id="add-accessory-form" className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
                 <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Accessory Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-medium focus:ring-2 focus:ring-red-500 transition-all text-sm sm:text-base text-[var(--text-primary)]"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Price (₹)</label>
                       <input 
                         required
                         type="number" 
                         className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-medium focus:ring-2 focus:ring-red-500 transition-all text-sm sm:text-base text-[var(--text-primary)]"
                         value={formData.price}
                         onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Fitting Fee (₹)</label>
                       <input 
                         type="number" 
                         className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-medium focus:ring-2 focus:ring-red-500 transition-all text-sm sm:text-base text-[var(--text-primary)]"
                         value={formData.installationCharges}
                         onChange={e => setFormData({...formData, installationCharges: Number(e.target.value)})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Category</label>
                       <select 
                         className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-medium focus:ring-2 focus:ring-red-500 transition-all appearance-none text-sm sm:text-base text-[var(--text-primary)]"
                         value={formData.category}
                         onChange={e => setFormData({...formData, category: e.target.value as AccessoryCategory})}
                       >
                          {categories.filter(c => c !== 'All').map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Status</label>
                       <div className="flex h-10 sm:h-12 bg-[var(--bg-secondary)] rounded-lg sm:rounded-xl p-1">
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, inStock: true})}
                            className={`flex-1 rounded-lg font-bold text-xs sm:text-sm transition-all ${formData.inStock ? 'bg-emerald-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                          >
                            In Stock
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, inStock: false})}
                            className={`flex-1 rounded-lg font-bold text-xs sm:text-sm transition-all ${!formData.inStock ? 'bg-red-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                          >
                            Out of Stock
                          </button>
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Description</label>
                    <textarea 
                      required
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-medium focus:ring-2 focus:ring-red-500 transition-all min-h-[80px] sm:min-h-[100px] text-sm sm:text-base text-[var(--text-primary)]"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                 </div>
              </form>

              <div className="p-3 sm:p-4 md:p-6 border-t border-[var(--border)] flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 md:gap-4 bg-[var(--bg-secondary)]">
                 <button type="button" onClick={closeModal} className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition">Cancel</button>
                 <button type="submit" form="add-accessory-form" className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-red-600/20 active:scale-95">
                    {editingAccessory ? 'Save Changes' : 'Add Accessory'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
