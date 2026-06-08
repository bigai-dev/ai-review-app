import React from 'react';

interface LogoMarkProps {
  /** Tailwind size classes for the badge (defaults to w-10 h-10). */
  className?: string;
  /** Initials shown inside the badge. */
  label?: string;
}

/**
 * Simple circular letter-mark logo. Replaces the previous image logo so the
 * brand can be changed without swapping image files.
 */
export const LogoMark: React.FC<LogoMarkProps> = ({ className = 'w-10 h-10', label = 'AI' }) => (
  <div
    className={`${className} shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-display font-bold shadow-sm`}
    aria-label="AI Review App logo"
  >
    <span className="text-sm leading-none tracking-tight">{label}</span>
  </div>
);
