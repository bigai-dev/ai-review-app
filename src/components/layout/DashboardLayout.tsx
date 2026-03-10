import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, Trophy, Settings, BarChart3, LogOut, ChevronDown, User, Pencil } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  alerts?: Record<string, boolean>;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeSection, onSectionChange, alerts = {} }) => {
  const { setCurrentView } = useApp();
  const [username, setUsername] = useState('Admin');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateProfile = () => {
      const storedUsername = localStorage.getItem('username');
      const storedProfilePic = localStorage.getItem('profile_pic');
      if (storedUsername) setUsername(storedUsername);
      setProfilePic(storedProfilePic);
    };

    updateProfile();

    // Listen for storage changes (from other tabs)
    window.addEventListener('storage', updateProfile);

    // Listen for custom event (from same tab)
    window.addEventListener('profileUpdated', updateProfile);

    return () => {
      window.removeEventListener('storage', updateProfile);
      window.removeEventListener('profileUpdated', updateProfile);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    localStorage.removeItem('profile_pic');
    window.location.href = '/login';
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'campaigns', icon: Trophy, label: 'Campaigns' },
    { id: 'reviews', icon: Users, label: 'Reviews' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <img src="/Anniks-logo.png" alt="Anniks Beauty" className="w-10 h-10 object-contain" />
            Anniks Beauty
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === item.id
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
              {alerts[item.id] && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => window.location.href = '/review'}
            className="flex items-center gap-3 text-slate-400 hover:text-white px-4 py-2 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Switch to Customer App</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-semibold text-gray-800 capitalize">{activeSection}</h1>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="h-8 w-8 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="h-8 w-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-sm font-medium text-gray-700">{username}</div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                <button
                  onClick={() => {
                    onSectionChange('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-gray-400" />
                  Edit Profile
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};