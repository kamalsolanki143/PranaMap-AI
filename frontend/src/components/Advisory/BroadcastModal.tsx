'use client';
import React from 'react';
import { Send, AlertTriangle, X } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  wardName: string;
  onClose: () => void;
  onConfirm: () => void;
  isBroadcasting: boolean;
}

export default function BroadcastModal({
  isOpen,
  wardName,
  onClose,
  onConfirm,
  isBroadcasting,
}: BroadcastModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative overflow-hidden transition-colors">
        {/* Glow accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-cyan via-accent-teal to-aqi-veryUnhealthy" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isBroadcasting}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shrink-0">
            <Send size={24} className={isBroadcasting ? 'animate-bounce' : ''} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary tracking-tight">Broadcast Advisory</h3>
            <p className="text-xs text-text-muted mt-0.5">Delhi NCR Emergency Alert System</p>
          </div>
        </div>

        {/* Dialog Content */}
        <div className="bg-surfaceHover border border-border p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-aqi-sensitive uppercase tracking-wider">
            <AlertTriangle size={14} />
            <span>Target Ward: {wardName}</span>
          </div>
          <p className="text-sm text-text-primary leading-relaxed">
            Send advisory to all registered citizens in <strong className="text-accent-cyan">{wardName}</strong>?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isBroadcasting}
            className="px-5 py-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surfaceHover text-xs font-semibold uppercase tracking-wider transition-all"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isBroadcasting}
            className="px-6 py-2.5 rounded-lg bg-accent-cyan text-surface font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-glow flex items-center gap-2"
          >
            {isBroadcasting ? (
              <>
                <span className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                <span>Broadcasting...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Broadcast</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
