import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';
import { Columns, X } from 'lucide-react';

const DualColumnComponent = ({ node, updateAttributes, deleteNode }) => {
  const [leftHeader, setLeftHeader] = useState(node.attrs.leftHeader || 'Column A');
  const [rightHeader, setRightHeader] = useState(node.attrs.rightHeader || 'Column B');
  const [leftContent, setLeftContent] = useState(node.attrs.leftContent || '');
  const [rightContent, setRightContent] = useState(node.attrs.rightContent || '');

  const handleLeftHeaderChange = (e) => {
    const val = e.target.textContent;
    setLeftHeader(val);
    updateAttributes({ leftHeader: val });
  };

  const handleRightHeaderChange = (e) => {
    const val = e.target.textContent;
    setRightHeader(val);
    updateAttributes({ rightHeader: val });
  };

  const handleLeftContentChange = (e) => {
    const val = e.target.innerHTML;
    setLeftContent(val);
    updateAttributes({ leftContent: val });
  };

  const handleRightContentChange = (e) => {
    const val = e.target.innerHTML;
    setRightContent(val);
    updateAttributes({ rightContent: val });
  };

  return (
    <NodeViewWrapper className="dual-column-node my-6" draggable="true" data-drag-handle>
      <div className="dual-column-wrapper" style={{ position: 'relative' }}>
        <button
          className="dual-column-delete"
          onClick={deleteNode}
          title="Remove dual column"
          contentEditable={false}
        >
          <X size={12} />
        </button>

        {/* Label */}
        <div
          contentEditable={false}
          className="absolute -top-3 left-4 z-10 flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest"
        >
          <Columns size={10} />
          Dual Column
        </div>

        {/* Left Column */}
        <div className="dual-column-side">
          <div
            className="dual-column-header"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleLeftHeaderChange}
            dangerouslySetInnerHTML={{ __html: leftHeader }}
          />
          <div
            className="dual-column-content"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleLeftContentChange}
            dangerouslySetInnerHTML={{ __html: leftContent }}
          />
        </div>

        {/* Right Column */}
        <div className="dual-column-side">
          <div
            className="dual-column-header"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleRightHeaderChange}
            dangerouslySetInnerHTML={{ __html: rightHeader }}
          />
          <div
            className="dual-column-content"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleRightContentChange}
            dangerouslySetInnerHTML={{ __html: rightContent }}
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const DualColumn = Node.create({
  name: 'dualColumn',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      leftHeader: { default: 'Column A' },
      rightHeader: { default: 'Column B' },
      leftContent: { default: '' },
      rightContent: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="dual-column"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'dual-column' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DualColumnComponent);
  },
});
