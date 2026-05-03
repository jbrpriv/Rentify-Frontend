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
  
  // Clear previous role attributes
  editorDom.querySelectorAll('[data-layout-role]').forEach(el => {
    el.removeAttribute('data-layout-role');
  });
  
  if (layoutStyle === 'minimalist') return;
  
  const proseMirror = editorDom.querySelector('.ProseMirror');
  if (!proseMirror) return;
  
  const firstH1 = proseMirror.querySelector('h1');
  const firstP = proseMirror.querySelector('p:not(:empty)');
  const firstTable = proseMirror.querySelector('table.agreement-table');
  const clausesPlaceholder = proseMirror.querySelector('[data-type="clauses-placeholder"]');
  
  if (firstH1) firstH1.setAttribute('data-layout-role', 'primary-heading');
  if (firstP) firstP.setAttribute('data-layout-role', 'intro-paragraph');
  
  // Tables now span full width, but we still mark them for potential styling
  if (firstTable) {
    const wrapper = firstTable.closest('.tableWrapper') || firstTable;
    wrapper.setAttribute('data-layout-role', 'primary-table');
  }

  // Clauses Placeholder now takes the sidebar role in modern/premium layouts
  if (clausesPlaceholder) {
    clausesPlaceholder.setAttribute('data-layout-role', 'primary-sidebar-item');
  }
}
