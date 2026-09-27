import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const PginSeal: React.FC<LogoProps> = ({ className = '', size = 56 }) => (
  <img
    src="assets/PGIN.png"
    alt="Provincial Government of Ilocos Norte seal"
    width={size}
    height={size}
    className={`shrink-0 object-contain ${className}`}
  />
);

export const InydoSeal: React.FC<LogoProps> = ({ className = '', size = 56 }) => (
  <img
    src="assets/INYDO.png"
    alt="Ilocos Norte Youth Development Office seal"
    width={size}
    height={size}
    className={`shrink-0 object-contain ${className}`}
  />
);

export const DualLogoHeader: React.FC<{ size?: number; showText?: boolean }> = ({
  size = 56,
  showText = true,
}) => (
  <div className="flex items-center gap-3">
    <div className="flex shrink-0 items-center gap-2">
      <PginSeal size={size} />
      <InydoSeal size={size} />
    </div>
    {showText && (
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">iSerbi</span>
          <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-red-600">
            INYDO
          </span>
        </div>
        <span className="mt-0.5 truncate text-xs font-medium text-slate-500">
          Community Service System
        </span>
      </div>
    )}
  </div>
);
