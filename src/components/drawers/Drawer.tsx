import type { ReactNode } from 'react';

export default function Drawer({ open, onClose, title, hint, children }: { open: boolean; onClose: () => void; title: string; hint: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <h4 style={{ marginBottom: 14 }}>{title}</h4>
        <div className="hint" style={{ marginBottom: 14 }}>{hint}</div>
        {children}
      </div>
    </>
  );
}
