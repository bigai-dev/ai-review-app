import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { CustomerFlow } from './pages/customer/CustomerFlow';
import { MerchantDashboard } from './pages/merchant/MerchantDashboard';
import { Login } from './pages/merchant/Login';

// Protected Route Component
const ProtectedRoute = () => {
  const token = localStorage.getItem('auth_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

const LandingPage = () => (
  <div className="relative min-h-screen w-full overflow-hidden font-sans selection:bg-brand-200">
    {/* Background Wallpaper - Desktop */}
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 hidden md:block"
      style={{
        backgroundImage: "url('/Anniks_16-9 with logo.jpeg')",
      }}
    />
    {/* Background Wallpaper - Mobile */}
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 md:hidden"
      style={{
        backgroundImage: "url('/Anniks_9-16.jpeg')",
      }}
    />

    {/* Subtle Overlay to ensure card pops */}
    <div className="absolute inset-0 bg-brand-900/10 z-10" />

    {/* Main Layout Container */}
    <div className="relative z-20 flex flex-col justify-center items-center min-h-[100dvh] w-full p-4 md:pb-20">

      {/* Top Spacer - only active on desktop to offset center slightly upwards if needed, or just remove flex-1 */}
      <div className="hidden md:block md:h-[15vh] w-full" />

      {/* The Glass Card */}
      <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] md:rounded-[2.5rem] border border-white/50 shadow-2xl shadow-brand-900/10 p-6 pt-8 md:p-12 overflow-hidden relative">

          {/* Glass Highlight/Sheen */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          <div className="flex flex-col items-center text-center space-y-8">

            {/* Status Badge */}
            <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/50 border border-white/60 shadow-sm text-slate-600 text-sm font-semibold tracking-wide backdrop-filter backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-500/30"></span>
              System Online
            </span>

            {/* Headlines */}
            <div className="space-y-4 max-w-lg">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-slate-900 tracking-tight leading-[1.1]">
                Share Your <br className="hidden md:block" />
                <span className="text-brand-600">Experience</span>
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Help us shape the future of our services by sharing your valuable feedback.
              </p>
            </div>

            {/* Actions */}
            <div className="w-full max-w-sm space-y-4 pt-2">
              <a
                href="/review"
                className="group relative flex items-center justify-center w-full p-1 transition-transform active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                <div className="relative w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg border-t border-white/20">
                  Start a Review
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </a>

              <a
                href="/admin"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors py-2"
              >
                Admin Access
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="hidden md:block md:h-[10vh]" />
    </div>
  </div>
);

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/review" element={<CustomerFlow />} />
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute />}>
            {/* Redirect /admin to /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<MerchantDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;