import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';

const VariableComponent = ({ node }) => {
  const { name, label } = node.attrs;
  const isClause = name?.includes('clause');
  
  return (
    <NodeViewWrapper className="inline">
      <span 
        className={`variable-node inline-flex items-center px-2 py-0.5 mx-0.5 border rounded-md font-bold cursor-default select-none group transition-all
          ${isClause 
            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
            : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'}`}
        data-name={name}
        title={`Variable: ${label}`}
      >
        <span className="opacity-60 mr-1 text-[10px]">{isClause ? '§' : '{x}'}</span>
        {label}
      </span>
    </NodeViewWrapper>
  );
};

export const Variable = Node.create({
  name: 'variable',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: element => element.getAttribute('data-name'),
        renderHTML: attributes => ({
          'data-name': attributes.name,
        }),
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label') || element.innerText,
        renderHTML: attributes => ({
          'data-label': attributes.label,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="variable"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // atom: true means no children — do NOT include the trailing 0 (child slot).
    // We also bake data-type in here so parseHTML can reliably identify these spans.
    return ['span', mergeAttributes({ 'data-type': 'variable' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableComponent);
  },
});
