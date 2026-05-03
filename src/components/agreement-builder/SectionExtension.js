import { Node, mergeAttributes } from '@tiptap/core';

export const DocumentSection = Node.create({
  name: 'documentSection',
  group: 'block',
  content: 'block+',
  
  addAttributes() {
    return {
      type: {
        default: 'content',
        parseHTML: element => element.getAttribute('data-section-type'),
        renderHTML: attributes => ({
          'data-section-type': attributes.type,
          class: `document-section section-${attributes.type}`,
        }),
      },
      title: {
        default: '',
        parseHTML: element => element.getAttribute('data-section-title'),
        renderHTML: attributes => ({
          'data-section-title': attributes.title,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-section-type]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});
