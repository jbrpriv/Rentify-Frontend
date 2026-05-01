import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GripVertical, X, LayoutTemplate } from 'lucide-react';

const FloatingTemplateLibrary = ({ templates = [], isOpen, onClose, onApplyTemplate }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const panelRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('template-library-position');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
      } catch {
        setPosition({ x: window.innerWidth - 350, y: 140 });
      }
    } else {
      setPosition({ x: window.innerWidth - 350, y: 140 });
    }
  }, []);

  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('template-library-position', JSON.stringify(position));
    }
  }, [position]);

  const handleMouseDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    setIsDragging(true);
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 120, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const haystack = `${template?.name || ''} ${template?.description || ''}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [templates, searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="floating-toolbox"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'default',
        width: 360,
      }}
    >
      <div className="floating-toolbox-header" onMouseDown={handleMouseDown}>
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="opacity-60" />
          <h3>Template Library</h3>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          title="Close"
        >
          <X size={14} className="text-white" />
        </button>
      </div>

      <div className="floating-toolbox-body">
        <input
          type="text"
          className="floating-toolbox-search"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="space-y-2 px-1 mt-2">
          {filteredTemplates.map((template) => (
            <button
              key={template.id || template.name}
              className="w-full text-left px-3 py-2 rounded-lg border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-50 transition-colors"
              onClick={() => onApplyTemplate?.(template)}
              title="Apply template"
            >
              <div className="flex items-center gap-2">
                <LayoutTemplate size={13} className="text-indigo-600" />
                <p className="text-xs font-bold text-slate-800 truncate">
                  {template.name || 'Untitled Template'}
                </p>
              </div>
              {template.description && (
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {template.description}
                </p>
              )}
            </button>
          ))}
          {filteredTemplates.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">No templates match your search</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingTemplateLibrary;
