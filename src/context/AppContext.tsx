import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { Submission, DashboardStats, Platform } from '../types';

export type Language = 'en' | 'bm' | 'cn';

interface AppContextType {
  submissions: Submission[];
  addSubmission: (submission: Submission) => void;
  updateSubmissionStatus: (id: string, status: Submission['status']) => Promise<void>;
  updateSubmission: (id: string, updates: Partial<Submission>) => Promise<void>;
  getStats: () => DashboardStats;
  currentView: 'customer' | 'merchant';
  setCurrentView: (view: 'customer' | 'merchant') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
  refreshSubmissions: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'customer' | 'merchant'>(() => {
    return window.location.pathname.startsWith('/merchant') ? 'merchant' : 'customer';
  });
  const [language, setLanguage] = useState<Language>('cn');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch from backend on load
  // Fetch from backend on load and poll every 10s
  // Fetch from backend on load
  // No automatic polling to save Egress
  const fetchSubmissions = () => {
    fetch('/api/submissions')
      .then(res => res.json())
      .then(data => {
        if (data.submissions) {
          setSubmissions(data.submissions);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch submissions:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const addSubmission = async (sub: Submission) => {
    // Optimistic update
    setSubmissions(prev => [sub, ...prev]);

    try {
      // Strip base64 image data from proofs to stay under Vercel's 4.5MB body limit
      const lightProofs = (sub.proofs || []).map(p => ({
        ...p,
        content: p.type === 'image' ? '[image]' : p.content
      }));
      const lightSub = { ...sub, proofs: lightProofs };

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lightSub)
      });

      if (!res.ok) {
        console.error("Failed to save submission:", res.status, await res.text());
        return;
      }

      // Upload full proofs with base64 images separately
      const imageProofs = (sub.proofs || []).filter(p => p.type === 'image' && p.content && p.content !== '[image]');
      if (imageProofs.length > 0) {
        await fetch(`/api/submissions/${sub.id}/proofs`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proofs: sub.proofs })
        }).catch(err => console.error("Failed to upload proofs:", err));
      }
    } catch (err) {
      console.error("Failed to save submission:", err);
    }
  };

  const updateSubmissionStatus = async (id: string, status: Submission['status']) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    try {
      await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      // Auto-deduct mystery gift stock when review is verified
      if (status === 'Verified') {
        const token = localStorage.getItem('auth_token');
        await fetch('/api/mystery-gifts/deduct', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const updateSubmission = async (id: string, updates: Partial<Submission>) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    try {
      await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error("Failed to update submission", e);
    }
  };

  const getStats = (): DashboardStats => {
    const total = submissions.length;
    const verified = submissions.filter(s => s.status === 'Verified').length;
    const sentiment = submissions.reduce((acc, curr) => acc + curr.rating, 0) / (total || 1);

    return {
      totalScans: total + 24, // Fake organic traffic + real
      totalReviews: verified,
      conversionRate: total > 0 ? Math.round((verified / total) * 100) : 0,
      sentimentScore: parseFloat(sentiment.toFixed(1))
    };
  };

  const refreshSubmissions = fetchSubmissions;

  return (
    <AppContext.Provider value={{
      submissions,
      addSubmission,
      updateSubmissionStatus,
      updateSubmission,
      getStats,
      currentView,
      setCurrentView,
      language,
      setLanguage,
      isLoading,
      refreshSubmissions
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};