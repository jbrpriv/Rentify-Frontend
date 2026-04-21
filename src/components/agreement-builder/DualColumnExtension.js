import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';
import { X } from 'lucide-react';

const DualColumnComponent = ({ node, updateAttributes, deleteNode }) => {
  const [leftContent, setLeftContent] = useState(node.attrs.leftContent || '');
  const [rightContent, setRightContent] = useState(node.attrs.rightContent || '');

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
    <NodeViewWrapper className="dual-column-node" draggable="true" data-drag-handle>
      <div className="dual-column-wrapper group">
        <button
          className="dual-column-delete"
          onClick={deleteNode}
          title="Remove split section"
          contentEditable={false}
        >
          <X size={12} strokeWidth={3} />
        </button>

        {/* Left Column */}
        <div className="dual-column-side">
          <div
            className="dual-column-content"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleLeftContentChange}
            dangerouslySetInnerHTML={{ __html: leftContent }}
            data-placeholder="Write here..."
          />
        </div>

        {/* Right Column */}
        <div className="dual-column-side">
          <div
            className="dual-column-content"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleRightContentChange}
            dangerouslySetInnerHTML={{ __html: rightContent }}
            data-placeholder="Write here..."
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
