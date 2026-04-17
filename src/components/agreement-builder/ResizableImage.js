import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useCallback, useRef } from 'react';

const ResizableImageComponent = ({ node, updateAttributes, selected }) => {
  const { src, alt, title, width, textAlign } = node.attrs;
  const imageRef = useRef(null);

  const onResize = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = imageRef.current?.getBoundingClientRect().width || 0;

    const onMouseMove = (moveEvent) => {
      const currentX = moveEvent.clientX;
      const diff = currentX - startX;
      let newWidth = startWidth + diff;
      
      // Constraints: min 50px, max 100% of container
      if (newWidth < 50) newWidth = 50;
      
      updateAttributes({ width: `${newWidth}px` });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [updateAttributes]);

  return (
    <NodeViewWrapper 
      className={`resizable-image-wrapper ${selected ? 'is-selected' : ''}`}
      style={{ 
        display: 'flex',
        justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'
      }}
    >
      <div 
        className="relative group"
        style={{ width: width || 'auto' }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          title={title}
          className="document-image block w-full h-auto rounded-lg shadow-sm"
          draggable="false"
        />
        
        {/* Resize Handle */}
        {selected && (
          <div
            className="absolute bottom-1 right-1 w-4 h-4 bg-blue-600 rounded-sm cursor-nwse-resize flex items-center justify-center shadow-lg border border-white"
            onMouseDown={onResize}
          >
            <div className="w-1.5 h-1.5 border-r border-b border-white opacity-80" />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const ResizableImage = Node.create({
  name: 'image',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: 'auto',
      },
      // Note: textAlign is handled by the TextAlign extension
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: element => ({
          src: element.getAttribute('src'),
          alt: element.getAttribute('alt'),
          title: element.getAttribute('title'),
          width: element.style.width || element.getAttribute('width') || 'auto',
        }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, { 
      style: `width: ${node.attrs.width}; display: block; margin: ${node.attrs.textAlign === 'center' ? '0 auto' : node.attrs.textAlign === 'right' ? '0 0 0 auto' : '0'};`,
    })];
  },

  addCommands() {
    return {
      setImage: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});
