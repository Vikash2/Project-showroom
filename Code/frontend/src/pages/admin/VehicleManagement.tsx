import React, { useState, useMemo } from 'react';
import { useVehicles } from '../../state/VehicleContext';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

export default function VehicleManagement() {
  const { vehicles, addVehicle, deleteVehicle } = useVehicles();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Advanced Form state
  const [formData, setFormData] = useState({
    brand: 'Honda',
    model: '',
    category: 'Scooter' as const,
    image: '',
    description: '',
    launchYear: '',
    // Specs
    engine: '', mileage: '', weight: '', maxPower: '', maxTorque: '',
    transmission: '', fuelCapacity: '', length: '', width: '', height: '',
    wheelbase: '', frontBrake: '', rearBrake: '', frontTyre: '', rearTyre: '',
    frontSuspension: '', rearSuspension: '', features: '', warranty: '',
    // Variant info
    variantName: 'Standard',
    brakeType: 'Drum' as const,
    wheelType: 'Steel' as const,
    connectedFeatures: false,
    // Pricing
    exShowroomPrice: 0,
    regFee: 300, roadTax: 4200, smartCard: 200, numberPlate: 400,
    tpInsurance: 1500, compInsurance: 2800, paCover: 750, zeroDep: 1200,
    fastag: 200, extWarranty: 2500, amc: 3000, docCharges: 500
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const filteredVehicles = vehicles.filter(v => 
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rtoTotal = Number(formData.regFee) + Number(formData.roadTax) + Number(formData.smartCard) + Number(formData.numberPlate);
    const insTotal = Number(formData.tpInsurance) + Number(formData.compInsurance) + Number(formData.paCover) + Number(formData.zeroDep);
    const othTotal = Number(formData.fastag) + Number(formData.extWarranty) + Number(formData.amc) + Number(formData.docCharges);
    const exPrice = Number(formData.exShowroomPrice);
    
    addVehicle({
      brand: formData.brand,
      model: formData.model,
      category: formData.category,
      launchYear: formData.launchYear,
      description: formData.description,
      image: formData.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600',
      specs: { 
        engine: formData.engine, mileage: formData.mileage, weight: formData.weight,
        maxPower: formData.maxPower, maxTorque: formData.maxTorque, transmission: formData.transmission,
        fuelCapacity: formData.fuelCapacity, length: formData.length, width: formData.width,
        height: formData.height, wheelbase: formData.wheelbase, frontBrake: formData.frontBrake,
        rearBrake: formData.rearBrake, frontTyre: formData.frontTyre, rearTyre: formData.rearTyre,
        frontSuspension: formData.frontSuspension, rearSuspension: formData.rearSuspension,
        features: formData.features.split(',').map(f => f.trim()), warranty: formData.warranty
      },
      variants: [
        {
          id: `v-var-${Date.now()}`,
          name: formData.variantName,
          brakeType: formData.brakeType,
          wheelType: formData.wheelType,
          connectedFeatures: formData.connectedFeatures,
          pricing: {
            exShowroomPrice: exPrice,
            rtoCharges: {
              registrationFee: Number(formData.regFee), roadTax: Number(formData.roadTax),
              smartCard: Number(formData.smartCard), numberPlate: Number(formData.numberPlate),
              hypothecation: 0, total: rtoTotal
            },
            insurance: {
              thirdParty: Number(formData.tpInsurance), comprehensive: Number(formData.compInsurance),
              personalAccident: Number(formData.paCover), zeroDepreciation: Number(formData.zeroDep),
              total: insTotal
            },
            otherCharges: {
              fastag: Number(formData.fastag), extendedWarranty: Number(formData.extWarranty),
              amc: Number(formData.amc), documentationCharges: Number(formData.docCharges),
              accessoriesFitting: 0, total: othTotal
            },
            onRoadPrice: exPrice + rtoTotal + insTotal + othTotal
          },
          colors: [
             { name: 'Standard Black', hexCode: '#000000', status: 'In Stock', stockQuantity: 5 }
          ]
        }
      ]
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Vehicle Management</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Manage showroom catalog, variants, and colors</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base font-bold w-full sm:w-auto justify-center"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          Add Vehicle
        </button>
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-[var(--border)] flex gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text" 
              placeholder="Search vehicles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--text-primary)] transition-all"
            />
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden divide-y divide-[var(--border)]">
          {paginatedVehicles.map((vehicle) => (
            <div key={vehicle.id} className="p-4 hover:bg-[var(--hover-bg)] transition">
              <div className="flex gap-3 mb-3">
                <img src={vehicle.image} alt={vehicle.model} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[var(--text-primary)] truncate">{vehicle.brand} {vehicle.model}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{vehicle.specs.engine}</div>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px] font-medium text-[var(--text-secondary)]">
                    {vehicle.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                <div className="text-xs text-[var(--text-secondary)]">
                  <div className="font-semibold">{vehicle.variants.length} variant(s)</div>
                  <div className="text-[var(--text-muted)]">From ₹{vehicle.variants[0]?.pricing?.exShowroomPrice?.toLocaleString('en-IN') || 0}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-600 transition">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => deleteVehicle(vehicle.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {paginatedVehicles.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              No vehicles found matching your criteria.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm">
                <th className="p-4 font-medium">Vehicle</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Variants (Starting Price)</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-[var(--hover-bg)] transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={vehicle.image} alt={vehicle.model} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold text-[var(--text-primary)]">{vehicle.brand} {vehicle.model}</div>
                        <div className="text-xs text-[var(--text-muted)]">{vehicle.specs.engine}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">
                    <span className="px-2 py-1 bg-[var(--bg-tertiary)] rounded text-xs font-medium text-[var(--text-secondary)]">
                      {vehicle.category}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">
                    {vehicle.variants.length} variant(s) <br />
                    <span className="text-xs text-[var(--text-muted)]">From ₹{vehicle.variants[0]?.pricing?.exShowroomPrice?.toLocaleString('en-IN') || 0}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteVehicle(vehicle.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedVehicles.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No vehicles found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredVehicles.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)]">
          <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length} vehicles
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

      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[var(--card-bg)] rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-[var(--border)] flex justify-between items-center shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Add Comprehensive Vehicle</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1">
                <X size={22} className="sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <form id="add-vehicle-form" onSubmit={handleAddSubmit} className="space-y-6 sm:space-y-8">
                
                {/* 1. Basic Info */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] border-b border-red-500 inline-block mb-3 sm:mb-4 pb-1">1. Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Brand</label>
                      <input name="brand" required value={formData.brand} onChange={handleChange} type="text" className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Model Name</label>
                      <input name="model" required value={formData.model} onChange={handleChange} type="text" className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)]">
                        <option value="Scooter">Scooter</option>
                        <option value="Motorcycle">Motorcycle</option>
                        <option value="Electric">Electric</option>
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Image URL</label>
                      <input name="image" value={formData.image} onChange={handleChange} type="url" className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)]" />
                    </div>
                  </div>
                </div>

                {/* 2. Specs */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] border-b border-red-500 inline-block mb-3 sm:mb-4 pb-1">2. Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                     <div className="md:col-span-2">
                       <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Engine</label>
                       <input name="engine" value={formData.engine} onChange={handleChange} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Mileage</label>
                       <input name="mileage" value={formData.mileage} onChange={handleChange} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Weight</label>
                       <input name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
                     </div>
                     
                     <div>
                       <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Front Brake</label>
                       <input name="frontBrake" value={formData.frontBrake} onChange={handleChange} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Rear Brake</label>
                       <input name="rearBrake" value={formData.rearBrake} onChange={handleChange} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Front Susp.</label>
                       <input name="frontSuspension" value={formData.frontSuspension} onChange={handleChange} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Rear Susp.</label>
                       <input name="rearSuspension" value={formData.rearSuspension} onChange={handleChange} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
                     </div>

                     <div className="md:col-span-4">
                       <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Key Features (comma separated)</label>
                       <input name="features" value={formData.features} onChange={handleChange} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
                     </div>
                  </div>
                </div>

                {/* 3. Base Variant & Pricing */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] border-b border-red-500 inline-block mb-3 sm:mb-4 pb-1">3. Base Variant & Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-x-8 sm:gap-y-4">
                     <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Variant Name</label>
                        <input name="variantName" required value={formData.variantName} onChange={handleChange} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Ex-Showroom Price (₹)</label>
                        <input name="exShowroomPrice" required type="number" value={formData.exShowroomPrice} onChange={handleChange} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]" />
                     </div>
                     
                     {/* RTO Group */}
                     <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border)] shadow-sm">
                        <h4 className="text-sm font-bold text-[var(--text-secondary)] mb-3">RTO Charges</h4>
                        <div className="grid grid-cols-2 gap-2">
                           <div><label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Road Tax</label><input name="roadTax" type="number" value={formData.roadTax} onChange={handleChange} className="w-full text-sm py-1 px-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]" /></div>
                           <div><label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Reg Fee</label><input name="regFee" type="number" value={formData.regFee} onChange={handleChange} className="w-full text-sm py-1 px-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]" /></div>
                        </div>
                     </div>

                     {/* Ins Group */}
                     <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border)] shadow-sm">
                        <h4 className="text-sm font-bold text-[var(--text-secondary)] mb-3">Insurance Options</h4>
                        <div className="grid grid-cols-2 gap-2">
                           <div><label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Third Party</label><input name="tpInsurance" type="number" value={formData.tpInsurance} onChange={handleChange} className="w-full text-sm py-1 px-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]" /></div>
                           <div><label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Comprehensive</label><input name="compInsurance" type="number" value={formData.compInsurance} onChange={handleChange} className="w-full text-sm py-1 px-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]" /></div>
                        </div>
                     </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-3 sm:p-4 border-t border-[var(--border)] flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 shrink-0 bg-[var(--bg-secondary)]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition order-2 sm:order-1">Cancel</button>
              <button type="submit" form="add-vehicle-form" className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base bg-red-600 text-white hover:bg-red-700 transition order-1 sm:order-2">Save Complete Vehicle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
