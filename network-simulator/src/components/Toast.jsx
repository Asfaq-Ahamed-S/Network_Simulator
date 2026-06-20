import { useEffect } from 'react';

const STYLES = {
  block: {
    bg: '#1a0505',
    border: '#ef4444',
    accent: '#ef4444',
    icon: '🚫',
    label: 'BLOCKED',
  },
  warn: {
    bg: '#1a1000',
    border: '#f59e0b',
    accent: '#f59e0b',
    icon: '⚠️',
    label: 'WARNING',
  },
};

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, toast.type === 'block' ? 5000 : 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const s = STYLES[toast.type];

  return (
    <div style={{
      position: 'fixed',
      bottom: '28px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: '8px',
      padding: '12px 18px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      zIndex: 99999,
      maxWidth: '500px',
      minWidth: '300px',
      boxShadow: `0 0 24px ${s.border}50`,
      animation: 'slideUp 0.2s ease',
    }}>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>

      <span style={{ fontSize: '18px', flexShrink: 0 }}>{s.icon}</span>

      <div style={{ flex: 1 }}>
        <div style={{ color: s.accent, fontSize: '10px', fontWeight: '700', letterSpacing: '1px', marginBottom: '3px' }}>
          {s.label}
        </div>
        <div style={{ color: '#e2e8f0', fontSize: '12px', lineHeight: '1.5' }}>
          {toast.message}
        </div>
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'none', border: 'none',
          color: '#64748b', cursor: 'pointer',
          fontSize: '14px', flexShrink: 0,
          padding: '0', lineHeight: 1,
        }}
      >✕</button>
    </div>
  );
};

export default Toast;