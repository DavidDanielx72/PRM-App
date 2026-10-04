import React from 'react';

export default function LoadingSpinner({ label = 'Loading…', full = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 py-12 animate-fade-in">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-cput-blue/10" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cput-blue animate-spin" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-b-cput-gold animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
      </div>
      <p className="text-sm font-medium text-slate-400 tracking-wide">{label}</p>
    </div>
  );

  return full ? (
    <div className="min-h-screen flex items-center justify-center bg-cput-light">{content}</div>
  ) : (
    content
  );
}
