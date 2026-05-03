import React, { useEffect, useCallback } from 'react';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['Ctrl', 'B'], action: 'Bold' },
  { keys: ['Ctrl', 'I'], action: 'Italic' },
  { keys: ['Ctrl', 'U'], action: 'Underline' },
  { keys: ['Ctrl', 'Shift', '>'], action: 'Increase font size' },
  { keys: ['Ctrl', 'Shift', '<'], action: 'Decrease font size' },
  { keys: ['Ctrl', 'Shift', 'E'], action: 'Align center' },
  { keys: ['Ctrl', 'Shift', 'R'], action: 'Align right' },
  { keys: ['Ctrl', 'Shift', 'L'], action: 'Align left' },
  { keys: ['Ctrl', 'Z'], action: 'Undo' },
  { keys: ['Ctrl', 'Y'], action: 'Redo' },
  { keys: ['Ctrl', 'S'], action: 'Save document' },
  { keys: ['?'], action: 'Show keyboard shortcuts' },
];

const ShortcutsModal = ({ isOpen, onClose }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Keyboard size={22} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-500 font-medium">Speed up your workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          {SHORTCUTS.map((shortcut, idx) => (
            <div key={idx} className="shortcut-row">
              <span className="text-sm font-semibold text-slate-700">{shortcut.action}</span>
              <div className="shortcut-keys">
                {shortcut.keys.map((key, kIdx) => (
                  <React.Fragment key={kIdx}>
                    <span className="shortcut-key">{key}</span>
                    {kIdx < shortcut.keys.length - 1 && (
                      <span className="text-slate-300 text-xs font-bold self-center">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Press ESC or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
