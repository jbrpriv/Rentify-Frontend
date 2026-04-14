import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import React from 'react';

const VariableComponent = ({ node }) => {
  return (
    <span 
      className="variable-node inline-block px-2 py-0.5 mx-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-md font-bold cursor-default select-none group"
      data-name={node.attrs.name}
    >
      {node.attrs.label}
    </span>
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
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'variable' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableComponent);
  },
});
