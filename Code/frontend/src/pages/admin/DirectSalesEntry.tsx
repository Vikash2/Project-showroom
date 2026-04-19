import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../../state/VehicleContext';
import { useDirectSales } from '../../state/DirectSaleContext';
import { useAccessories } from '../../state/AccessoryContext';
import { useAuth } from '../../state/AuthContext';
import { useShowroom } from '../../state/ShowroomContext';
import { ShoppingCart, User, Car, FileText, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import type { DirectSaleRecord, DirectSaleCustomer, DirectSaleVehicleConfig } from '../../types/directSale';
import DirectSalesForm from '../../components/Sales/DirectSalesForm';

export default function DirectSalesEntry() {
  const navigate = useNavigate();
  const { vehicles } = useVehicles();
  const { accessories } = useAccessories();
  const { addDirectSale } = useDirectSales();
  const { user } = useAuth();
  const { activeShowroom } = useShowroom();

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<Partial<DirectSaleCustomer>>({});
  const [vehicleConfig, setVehicleConfig] = useState<Partial<DirectSaleVehicleConfig>>({});
  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState<string[]>([]);
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [draftSaleId, setDraftSaleId] = useState<string | null>(null);

  // Computed values
  const selectedVehicle = vehicles.find(v => v.id === vehicleConfig.modelId);
  const selectedVariant = selectedVehicle?.variants.find(v => v.id === vehicleConfig.variantId);

  const pricing = useMemo(() => {
    if (!selectedVariant) return { exShowroom: 0, rtoTotal: 0, insuranceTotal: 0, accessoriesTotal: 0, otherChargesTotal: 0, onRoadPrice: 0 };
    
    const p = selectedVariant.pricing;
    const accTotal = accessories
      .filter(a => selectedAccessoryIds.includes(a.id))
      .reduce((sum, a) => sum + a.price + a.installationCharges, 0);

    return {
      exShowroom: p.exShowroomPrice,
      rtoTotal: p.rtoCharges.total,
      insuranceTotal: p.insurance.total,
      otherChargesTotal: p.otherCharges.total,
      accessoriesTotal: accTotal,
      onRoadPrice: p.onRoadPrice + accTotal
    };
  }, [selectedVariant, selectedAccessoryIds, accessories]);

  const handleCreateDraft = () => {
    if (!customer.fullName || !customer.mobile || !customer.address) {
      alert('Please fill in all required customer details');
      return;
    }
    if (!vehicleConfig.modelId || !vehicleConfig.variantId || !vehicleConfig.colorName) {
      alert('Please select vehicle configuration');
      return;
    }

    // Create draft direct sale
    const saleId = addDirectSale({
      customer: customer as DirectSaleCustomer,
      vehicleConfig: vehicleConfig as DirectSaleVehicleConfig,
      pricing,
      saleDetails: {
        soldThrough: 'CASH',
        hypothecationSelected: 'No',
        hypothecationCharge: 0,
        registration: 'Yes',
        otherState: { selected: '', amount: 0 },
        insurance: 'YES',
        insuranceNominee: { name: '', age: 0, relation: '' },
        selectedAccessoriesFinal: {},
        accessoriesTotal: 0,
        typeOfSale: 'NEW',
        discount: 0,
        specialDiscount: 0,
        specialDiscountApprovalStatus: 'NONE',
        isGstNumber: 'NO',
        jobClub: 'NO',
        otherCharges: 0,
      },
      documents: {
        aadharCard: {},
        panCard: {},
        drivingLicense: {},
        addressProof: {},
        passportPhotos: {},
      },
      status: 'Draft',
      createdBy: user?.email,
      showroomId: activeShowroom?.id,
    });

    setDraftSaleId(saleId);
    setShowSalesForm(true);
  };

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, JSX.Element> = {
      Safety: <CheckCircle size={20} className="text-emerald-500" />,
      Protection: <CheckCircle size={20} className="text-blue-500" />,
      Convenience: <CheckCircle size={20} className="text-purple-500" />,
      Aesthetics: <CheckCircle size={20} className="text-amber-500" />,
    };
    return icons[cat] || <CheckCircle size={20} className="text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Direct Sales Entry</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Create sales for walk-in customers without prior booking</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <ShoppingCart size={18} className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Walk-in Customer</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--border)]">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { num: 1, label: 'Customer Info', icon: User },
            { num: 2, label: 'Vehicle Selection', icon: Car },
            { num: 3, label: 'Sales Details', icon: FileText },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s.num
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-2 border-[var(--border)]'
                    }`}
                  >
                    {step > s.num ? <CheckCircle size={24} /> : <Icon size={24} />}
                  </div>
                  <span
                    className={`text-xs font-semibold mt-2 ${
                      step >= s.num ? 'text-red-600' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`h-1 flex-1 mx-4 rounded-full transition-all ${
                      step > s.num ? 'bg-red-600' : 'bg-[var(--border)]'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Customer Information */}
      {step === 1 && (
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--border)] animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Customer Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customer.fullName || ''}
                onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-red-500 text-[var(--text-primary)]"
                placeholder="As per Aadhar Card"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customer.mobile || ''}
                onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-red-500 text-[var(--text-primary)]"
                placeholder="10 digit mobile number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={customer.email || ''}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-red-500 text-[var(--text-primary)]"
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                Emergency Contact
              </label>
              <input
                type="tel"
                value={customer.emergencyContact || ''}
                onChange={(e) => setCustomer({ ...customer, emergencyContact: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-red-500 text-[var(--text-primary)]"
                placeholder="Alternate contact number"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                Complete Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={customer.address || ''}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-red-500 text-[var(--text-primary)] min-h-[100px]"
                placeholder="Street, Locality, City, State, Pincode"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!customer.fullName || !customer.mobile || !customer.address}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Vehicle Selection <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Vehicle Selection */}
      {step === 2 && (
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--border)] animate-in fade-in slide-in-from-right-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Vehicle Selection</h2>
          
          <div className="space-y-8">
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-4">Select Model</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setVehicleConfig({ modelId: v.id, variantId: undefined, colorName: undefined })}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                      vehicleConfig.modelId === v.id
                        ? 'border-red-600 bg-red-50 dark:bg-red-950/30'
                        : 'border-[var(--border)] hover:border-red-300'
                    }`}
                  >
                    <img src={v.image} alt={v.model} className="w-full h-24 object-contain mb-3" />
                    <h3 className="font-bold text-sm text-[var(--text-primary)] text-center">
                      {v.brand} {v.model}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Variant Selection */}
            {selectedVehicle && (
              <div className="animate-in fade-in">
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-4">Select Variant</label>
                <div className="grid sm:grid-cols-3 gap-4">
                  {selectedVehicle.variants.map((variant) => (
                    <div
                      key={variant.id}
                      onClick={() => setVehicleConfig({ ...vehicleConfig, variantId: variant.id, colorName: undefined })}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        vehicleConfig.variantId === variant.id
                          ? 'border-red-600 bg-red-50 dark:bg-red-950/30'
                          : 'border-[var(--border)] hover:border-red-300'
                      }`}
                    >
                      <div className="font-bold text-[var(--text-primary)]">{variant.name}</div>
                      <div className="text-red-600 font-black mt-2">
                        ₹{variant.pricing.exShowroomPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">Ex-Showroom</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {selectedVariant && (
              <div className="animate-in fade-in">
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-4">Select Color</label>
                <div className="flex flex-wrap gap-5">
                  {selectedVariant.colors.map((color) => {
                    const isActive = vehicleConfig.colorName === color.name;
                    return (
                      <button
                        key={color.name}
                        onClick={() => setVehicleConfig({ ...vehicleConfig, colorName: color.name })}
                        className="group relative flex flex-col items-center gap-2 focus:outline-none"
                      >
                        <span
                          className={`w-12 h-12 rounded-full block transition-all shadow-md ${
                            isActive
                              ? 'ring-4 ring-red-600 ring-offset-2 ring-offset-[var(--card-bg)] scale-110'
                              : 'ring-2 ring-[var(--border)] hover:ring-red-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            isActive ? 'text-red-600' : 'text-[var(--text-muted)]'
                          }`}
                        >
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Accessories */}
            {selectedVariant && (
              <div className="animate-in fade-in">
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-4">
                  Add Accessories (Optional)
                </label>
                <div className="space-y-3">
                  {accessories.map((acc) => {
                    const isSelected = selectedAccessoryIds.includes(acc.id);
                    return (
                      <div
                        key={acc.id}
                        onClick={() =>
                          setSelectedAccessoryIds((prev) =>
                            isSelected ? prev.filter((id) => id !== acc.id) : [...prev, acc.id]
                          )
                        }
                        className={`cursor-pointer flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-red-600 bg-red-50 dark:bg-red-950/30'
                            : 'border-[var(--border)] hover:border-red-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${
                              isSelected ? 'bg-red-600 border-red-600' : 'border-[var(--border)]'
                            }`}
                          >
                            {isSelected && <CheckCircle size={13} className="text-white" />}
                          </div>
                          <div className="w-11 h-11 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center">
                            {getCategoryIcon(acc.category)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[var(--text-primary)]">{acc.name}</h4>
                            <p className="text-xs text-[var(--text-muted)]">{acc.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-[var(--text-primary)]">
                            ₹{acc.price.toLocaleString('en-IN')}
                          </div>
                          {acc.installationCharges > 0 && (
                            <div className="text-xs text-[var(--text-muted)]">
                              + ₹{acc.installationCharges} fitting
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-xl font-bold text-[var(--text-muted)] hover:bg-[var(--hover-bg)] transition"
            >
              Back
            </button>
            <button
              onClick={handleCreateDraft}
              disabled={!vehicleConfig.modelId || !vehicleConfig.variantId || !vehicleConfig.colorName}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Sales Details <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Pricing Summary Widget */}
      {step === 2 && selectedVariant && (
        <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Pricing Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Ex-Showroom</span>
              <span>₹{pricing.exShowroom.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">RTO & Registration</span>
              <span>₹{pricing.rtoTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Insurance</span>
              <span>₹{pricing.insuranceTotal.toLocaleString('en-IN')}</span>
            </div>
            {pricing.accessoriesTotal > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Accessories</span>
                <span>+ ₹{pricing.accessoriesTotal.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between items-end">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total On-Road</span>
              <span className="text-2xl font-black">₹{pricing.onRoadPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Direct Sales Form Modal */}
      {showSalesForm && draftSaleId && (
        <DirectSalesForm
          saleId={draftSaleId}
          onClose={() => {
            setShowSalesForm(false);
            navigate('/admin/sales-processing');
          }}
          onSave={() => {
            setShowSalesForm(false);
            navigate('/admin/sales-processing');
          }}
        />
      )}
    </div>
  );
}
