import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { Sparkles, ScrollText } from 'lucide-react';

const ClausesPlaceholderComponent = () => {
  return (
    <NodeViewWrapper className="clauses-placeholder-wrapper my-8">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative px-8 py-6 bg-white ring-1 ring-green-100 rounded-xl leading-none flex items-center space-x-6 border-2 border-dashed border-green-200 shadow-sm">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <ScrollText size={32} />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-500 animate-pulse" />
              <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Dynamic Section</p>
            </div>
            <p className="text-gray-900 font-extrabold text-xl">Clause Library Integration Zone</p>
            <p className="text-gray-500 text-sm font-medium">Drag-and-dropped clauses will appear exactly in this location during agreement drafting.</p>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const ClausesPlaceholder = Node.create({
  name: 'clausesPlaceholder',
  group: 'block',
  atom: true,
  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="clauses-placeholder"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'clauses-placeholder' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ClausesPlaceholderComponent);
  },
});
