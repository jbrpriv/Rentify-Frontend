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
        class: 'dual-column-wrapper group relative' 
      }), 
      0
    ];
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { state, dispatch } = this.editor.view;
        const { selection } = state;
        
        // Ensure cursor is empty
        if (!selection.empty) {
          return false;
        }

        // Check if cursor is directly inside a DualColumnSide at position 0 (the start)
        const $pos = selection.$anchor;
        
        // Find the dualColumn node wrapping us
        let depth = $pos.depth;
        let dualColumnNode = null;
        let dualColumnPos = null;

        for (let i = depth; i > 0; i--) {
          const node = $pos.node(i);
          if (node.type.name === 'dualColumn') {
            dualColumnNode = node;
            dualColumnPos = $pos.before(i);
            break;
          }
        }

        if (!dualColumnNode) {
          return false; // Not inside a dual column
        }

        // We are inside a dual column. Check if both sides are practically empty.
        // A single empty paragraph takes up 2 text size. Two empty paragraphs = 4.
        // We will just measure the text content. If it's completely empty of text, we delete it.
        if (dualColumnNode.textContent.trim().length === 0) {
          if (dispatch) {
            dispatch(state.tr.delete(dualColumnPos, dualColumnPos + dualColumnNode.nodeSize));
          }
          return true;
        }

        return false;
      },
    };
  },
});
