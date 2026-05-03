/**
 * LayoutEngine.js
 * 
 * After each editor update, this scans the ProseMirror .a4-page DOM
 * and wraps structural elements with layout-specific divs.
 * 
 * CRITICAL RULES:
 * - NEVER modify the ProseMirror node's own DOM (corrupts undo history).
 * - Only work on the OUTER wrapper div around EditorContent.
 * - All wrapper divs get data-layout-injected="true" so they can be cleaned up.
 * - The actual <h1>, <p>, <table> etc. remain in place inside ProseMirror —
 *   we use CSS transforms only via class injection on the .a4-page itself.
 * 
 * APPROACH: Add data-layout-role attributes to the first structural elements
 * so CSS can target them cleanly, then use CSS grid on .a4-page for layouts
 * that need sidebar positioning.
 */

export function applyLayoutRoles(editorDom, layoutStyle) {
  if (!editorDom) return;
  
  // Clear previous role attributes and injected wrappers
  editorDom.querySelectorAll('[data-layout-injected="true"]').forEach(el => {
    // Move children back to parent before removing wrapper
    while (el.firstChild) {
      el.parentNode.insertBefore(el.firstChild, el);
    }
    el.remove();
  });

  editorDom.querySelectorAll('[data-layout-role]').forEach(el => {
    el.removeAttribute('data-layout-role');
  });
  
  if (layoutStyle === 'minimalist') return;
  
  const proseMirror = editorDom.querySelector('.ProseMirror');
  if (!proseMirror) return;
  
  // Identify key blocks
  const firstH1 = proseMirror.querySelector('h1');
  const firstP = proseMirror.querySelector('p:not(:empty)');
  const firstTable = proseMirror.querySelector('table.agreement-table');
  const clausesPlaceholder = proseMirror.querySelector('[data-type="clauses-placeholder"]');

  // Wrap Hero elements
  if (firstH1) {
    firstH1.setAttribute('data-layout-role', 'primary-heading');
  }

  // Wrap Clauses in a modular section
  if (clausesPlaceholder) {
    wrapInSection(clausesPlaceholder, 'clauses', 'primary-sidebar-item');
  }

  // Wrap Table in a modular section
  if (firstTable) {
    const tableWrapper = firstTable.closest('.tableWrapper') || firstTable;
    wrapInSection(tableWrapper, 'table', 'primary-table');
  }
}

function wrapInSection(element, type, role) {
  if (!element || element.parentNode.hasAttribute('data-layout-injected')) return;
  
  const wrapper = document.createElement('div');
  wrapper.className = `document-section section-${type}`;
  wrapper.setAttribute('data-layout-injected', 'true');
  wrapper.setAttribute('data-layout-role', role);
  
  element.parentNode.insertBefore(wrapper, element);
  wrapper.appendChild(element);
}
