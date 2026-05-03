import { Node, Mark, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';

// ── Category → color mapping (aesthetic, accessible) ──
const CATEGORY_STYLES = {
  parties:    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', dot: '#3B82F6' }, // Blue
  property:   { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', dot: '#22C55E' }, // Green
  financials: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', dot: '#F59E0B' }, // Amber
  dates:      { bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9', dot: '#8B5CF6' }, // Purple
  policies:   { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C', dot: '#F43F5E' }, // Rose
  receipt:    { bg: '#ECFEFF', border: '#A5F3FC', text: '#0E7490', dot: '#06B6D4' }, // Cyan
  tenant:     { bg: '#F0FDFA', border: '#99F6E4', text: '#0F766E', dot: '#14B8A6' }, // Teal
  default:    { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', dot: '#94A3B8' }, // Slate
};

const VariableComponent = ({ node, selected }) => {
  const { label, category } = node.attrs;
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.default;

  return (
    <NodeViewWrapper className="inline" style={{ lineHeight: 'normal' }}>
      <span
        className={`variable-node ${selected ? 'is-selected' : ''}`}
        data-name={node.attrs.name}
        title={`Variable: ${label}`}
        aria-selected={selected ? 'true' : 'false'}
        style={{
          background: style.bg,
          borderColor: style.border,
          color: style.text,
        }}
      >
        <span
          className="variable-dot"
          style={{ background: style.dot }}
        />
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
        renderHTML: attributes => ({ 'data-name': attributes.name }),
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label') || element.innerText,
        renderHTML: attributes => ({ 'data-label': attributes.label }),
      },
      category: {
        default: 'default',
        parseHTML: element => element.getAttribute('data-category') || 'default',
        renderHTML: attributes => ({ 'data-category': attributes.category }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="variable"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-type': 'variable' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableComponent);
  },
});
