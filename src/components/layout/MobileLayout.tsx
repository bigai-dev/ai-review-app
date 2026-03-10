import React from 'react';
import { ArrowLeft, Globe } from 'lucide-react';
import { useApp, Language } from '../../context/AppContext';
import { MOCK_MERCHANT } from '../../constants';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  rewardSummary?: {
    base: string;
    bonusEntries: number;
  };
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  step,
  totalSteps,
  onBack,
  rewardSummary
}) => {
  const { language, setLanguage } = useApp();
  // Calculate progress percentage
  const progress = Math.min(((step + 1) / totalSteps) * 100, 100);

  const toggleLang = () => {
    const next = language === 'en' ? 'bm' : language === 'bm' ? 'cn' : 'en';
    setLanguage(next);
  };

  const getLangLabel = (l: Language) => {
    if (l === 'en') return 'EN';
    if (l === 'bm') return 'BM';
    return '中文';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex justify-center font-sans antialiased">
      <div className="w-full max-w-md bg-white shadow-2xl shadow-gray-200/50 min-h-screen flex flex-col relative overflow-hidden">

        {/* Ambient Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-brand-100/50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[60%] h-[40%] bg-brand-100/40 rounded-full blur-3xl pointer-events-none opacity-50"></div>

        {/* Sticky Header with Glassmorphism */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-gray-100 transition-all duration-300">
          <div className="px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && step > 0 && (
                <button
                  onClick={onBack}
                  className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 rounded-full transition-colors active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}

              <img src={MOCK_MERCHANT.logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-100" />

              <div className="flex flex-col justify-center">
                <h1 className="font-bold text-gray-900 text-lg leading-none tracking-tight">
                  {title || 'Anniks Beauty'}
                </h1>
                {step < totalSteps - 1 && (
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    Step {step + 1} of {totalSteps}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-xs font-semibold text-gray-600 transition-all active:scale-95 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" />
              {getLangLabel(language)}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1 w-full bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-700 ease-out rounded-r-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-40 relative z-10 scroll-smooth">
          {children}
        </main>

        {/* Reward Summary Pill (Floating) */}

      </div>
    </div>
  );
};