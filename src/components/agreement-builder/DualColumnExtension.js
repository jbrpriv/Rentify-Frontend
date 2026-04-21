import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React from 'react';
import { X } from 'lucide-react';

export const DualColumnSide = Node.create({
  name: 'dualColumnSide',
  content: 'block+',
  isolating: true,
  selectable: false,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="dual-column-side"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div', 
      mergeAttributes(HTMLAttributes, { 
        'data-type': 'dual-column-side', 
        class: 'dual-column-side p-4 min-h-[100px] outline-none relative' 
      }), 
      0
    ];
  },
});

const DualColumnComponent = ({ deleteNode }) => {
  return (
    <NodeViewWrapper className="dual-column-node group relative" draggable="true" data-drag-handle>
      <button
        className="dual-column-delete absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white border-2 border-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md cursor-pointer disabled:opacity-0"
        onClick={deleteNode}
        title="Remove split section"
        contentEditable={false}
      >
        <X size={12} strokeWidth={3} />
      </button>

      {/* NodeViewContent injects the two DualColumnSide components directly here into this grid wrapper */}
      <NodeViewContent 
        as="div" 
        className="dual-column-wrapper grid grid-cols-2 min-h-[100px] relative after:content-[''] after:absolute after:top-0 after:bottom-0 after:left-1/2 after:border-l-2 after:border-dotted after:border-slate-300 after:-translate-x-1/2 after:z-[1] after:pointer-events-none" 
      />
    </NodeViewWrapper>
  );
};

export const DualColumn = Node.create({
  name: 'dualColumn',
  group: 'block',
  content: 'dualColumnSide dualColumnSide', 
  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="dual-column"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div', 
      mergeAttributes(HTMLAttributes, { 
        'data-type': 'dual-column', 
        class: 'dual-column-node group relative' 
      }), 
      0
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DualColumnComponent);
  },
});
