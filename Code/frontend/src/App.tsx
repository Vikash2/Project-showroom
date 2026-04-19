import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VehicleCard from './components/VehicleCard';
import InquiryForm from './components/InquiryForm';
import {
  MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, CheckCircle2, ArrowRight
} from 'lucide-react';
import { ShowroomProvider, useShowroom } from './state/ShowroomContext';
import { VehicleProvider, useVehicles } from './state/VehicleContext';
import { InquiryProvider } from './state/InquiryContext';
import { BookingProvider } from './state/BookingContext';
import { AccessoryProvider } from './state/AccessoryContext';
import { DirectSaleProvider } from './state/DirectSaleContext';
import AdminLayout from './components/admin/AdminLayout';
import ShowroomManagement from './pages/admin/ShowroomManagement';
import VehicleManagement from './pages/admin/VehicleManagement';
import LeadsManagement from './pages/admin/LeadsManagement';
import BookingManagement from './pages/admin/BookingManagement';
import SalesProcessing from './pages/admin/SalesProcessing';
import AccessoriesManagement from './pages/admin/AccessoriesManagement';
import ShowroomReports from './pages/admin/ShowroomReports';
import { ThemeProvider } from './state/ThemeContext';
import { AuthProvider } from './state/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import BookingFlow from './pages/customer/BookingFlow'; 
import VehicleCatalog from './pages/customer/VehicleCatalog';
import DirectSalesEntry from './pages/admin/DirectSalesEntry';
import NotFound from './pages/NotFound';

import './index.css';


import AdminDashboard from './pages/admin/AdminDashboard';

function Footer() {
  const { activeShowroom } = useShowroom();
  return (
    <footer id="contact" className="bg-slate-900 text-white pt-24 pb-12 transition-colors duration-300">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 font-medium">
          <div className="space-y-8">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{ backgroundColor: activeShowroom.branding.primaryColor }}
              >
                {activeShowroom.name.charAt(0)}
              </div>
              <span className="text-2xl font-black tracking-tighter">{activeShowroom.name}</span>
            </div>
            <p className="text-slate-400 text-sm leading-8">
              Your authorized {activeShowroom.brand} 2-wheeler dealer in {activeShowroom.address.city}. Committed to providing the best riding experience and after-sales service.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-red-600 transition-all duration-300 shadow-xl"><Icon size={20} /></a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-10">Contact Info</h4>
            <ul className="space-y-6">
              <li className="flex gap-4 text-slate-300 text-sm leading-relaxed">
                <MapPin size={22} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span>{activeShowroom.address.street}, {activeShowroom.address.city}, {activeShowroom.address.state} - {activeShowroom.address.pincode}</span>
              </li>
              <li className="flex gap-4 text-slate-300 text-sm">
                <Phone size={22} className="text-red-500 flex-shrink-0" />
                <span className="font-bold tracking-wide">{activeShowroom.contact.phone}</span>
              </li>
              <li className="flex gap-4 text-slate-300 text-sm">
                <Mail size={22} className="text-red-500 flex-shrink-0" />
                <span className="font-bold">{activeShowroom.contact.email}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-10">Working Hours</h4>
            <ul className="space-y-8">
              <li className="flex gap-5 text-slate-300 text-sm">
                <Clock size={22} className="text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-white mb-2 uppercase tracking-wide text-xs">Mon - Sat</p>
                  <p className="text-slate-400 font-bold">{activeShowroom.workingHours.weekdays}</p>
                </div>
              </li>
              <li className="flex gap-5 text-slate-300 text-sm">
                <Clock size={22} className="text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-white mb-2 uppercase tracking-wide text-xs">Sunday</p>
                  <p className="text-slate-400 font-bold">{activeShowroom.workingHours.sunday}</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-10">Quick Links</h4>
            <ul className="space-y-5">
              {[
                `${activeShowroom.brand} Scooters`,
                `${activeShowroom.brand} Motorcycles`,
                'Service Booking',
                'Spare Parts'
              ].map((link, i) => (
                <li key={i}><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors font-bold tracking-wide">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 text-center font-bold">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">
            © 2025 {activeShowroom.name} • Authorized {activeShowroom.brand} Dealer
          </p>
        </div>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Vehicle Showcase Section */}
      <motion.section
        id="vehicles"
        className="py-20 bg-[var(--bg-secondary)] transition-colors duration-300 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container-custom relative z-10">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Elite Collection</h2>
            <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full mb-6"></div>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto font-medium text-lg">Explore our best-selling {useShowroom().activeShowroom.brand} 2-wheelers.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {useVehicles().vehicles.map((v, i) => (
              <VehicleCard key={v.id || i}
                model={v.brand + " " + v.model}
                category={v.category}
                price={v.variants[0]?.pricing?.exShowroomPrice?.toLocaleString('en-IN') || "0"}
                image={v.image}
                specs={{
                  mileage: v.specs.mileage,
                  engine: v.specs.engine,
                  weight: v.specs.weight
                }}
              />
            ))}
          </div>

          <div className="mt-16 text-center">
            <a href="/vehicles" className="btn-secondary inline-flex items-center gap-3 px-10 py-5 text-xl group shadow-2xl">
              View Full Catalog
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </motion.section>

      {/* Inquiry Form Section */}
      <motion.section
        id="inquiry"
        className="py-20 bg-[var(--bg-primary)] relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-red-500/20 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] mb-12 leading-[1.1] tracking-tighter">
                Ready to take the <br />
                <span className="text-red-600">Next Step?</span>
              </h2>
              <div className="space-y-10">
                {[
                  { icon: CheckCircle2, title: 'Instant Quotation', desc: 'Get a detailed on-road price breakdown including RTO and Insurance.', color: 'red' },
                  { icon: Clock, title: 'Priority Test Ride', desc: 'Schedule a test ride at your preferred time and experience the machine.', color: 'blue' },
                  { icon: CheckCircle2, title: 'Maximum Exchange Value', desc: 'Get the best market value for your old vehicle in minutes.', color: 'emerald' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className={`w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0 text-[var(--text-muted)] group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-sm`}>
                      <item.icon size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-[var(--text-primary)] mb-2">{item.title}</h4>
                      <p className="text-[var(--text-secondary)] font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <InquiryForm />
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function ScrollToHash() {
  const { pathname, hash } = useLocation();
  const { activeShowroom } = useShowroom();

  useEffect(() => {
    // Title management
    const titles: Record<string, string> = {
      '/': `${activeShowroom.name} | Authorized ${activeShowroom.brand} Dealer`,
      '/vehicles': `Vehicle Catalog | ${activeShowroom.name}`,
      '/login': `Staff Login | ${activeShowroom.name}`,
      '/admin': `Dashboard | ${activeShowroom.name}`
    };

    const baseTitle = titles[pathname] || activeShowroom.name;
    document.title = pathname.startsWith('/admin') ? titles['/admin'] : baseTitle;

    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        const offset = 80; // Navbar height
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <ThemeProvider defaultTheme="system" storageKey="showroom-vms-theme">
      <AuthProvider>
        <ShowroomProvider>
          <VehicleProvider>
            <InquiryProvider>
              <AccessoryProvider>
                <BookingProvider>
                  <DirectSaleProvider>
                    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
                    {!isAdminPath && <ScrollToHash />}
                    {!isAdminPath && <Navbar />}
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/vehicles" element={<VehicleCatalog />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/book" element={
                        <ProtectedRoute allowedRoles={['Super Admin', 'Showroom Manager', 'Sales Executive', 'Accountant', 'Documentation Officer', 'Customer']}>
                          <BookingFlow />
                        </ProtectedRoute>
                      } />
                      
                      {/* Admin Dashboard */}
                      <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['Super Admin', 'Showroom Manager', 'Sales Executive', 'Accountant', 'Documentation Officer']}>
                          <AdminLayout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="showrooms" element={<ShowroomManagement />} />
                        <Route path="vehicles" element={<VehicleManagement />} />
                        <Route path="leads" element={<LeadsManagement />} />
                        <Route path="bookings" element={<BookingManagement />} />
                        <Route path="bookings/new" element={<BookingFlow />} />
                        <Route path="sales-processing" element={<SalesProcessing />} />
                        <Route path="direct-sales" element={<DirectSalesEntry />} />
                        <Route path="accessories" element={<AccessoriesManagement />} />
                        <Route path="reports" element={<ShowroomReports />} />
                        <Route path="settings" element={<div className="p-8 font-bold text-[var(--text-primary)] transition-colors">Settings (Coming Soon)</div>} />
                        <Route path="*" element={<NotFound />} />
                      </Route>

                      {/* 404 Catch-All Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    {!isAdminPath && <Footer />}
                    <Toaster position="bottom-right" />
                    </div>
                  </DirectSaleProvider>
                </BookingProvider>
              </AccessoryProvider>
            </InquiryProvider>
          </VehicleProvider>
        </ShowroomProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
