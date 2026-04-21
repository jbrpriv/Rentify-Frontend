import { Node, mergeAttributes } from '@tiptap/core';

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

export const DualColumn = Node.create({
  name: 'dualColumn',
  group: 'block',
  content: 'dualColumnSide dualColumnSide', // Exactly two child columns
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
        class: 'dual-column-wrapper group' 
      }), 
      0
    ];
  },
});
