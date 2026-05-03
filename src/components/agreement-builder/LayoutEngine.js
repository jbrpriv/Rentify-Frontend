/**
 * LayoutEngine.js
 *
 * After each editor update, assigns data-layout-role attributes to key
 * structural elements so CSS can target them cleanly.
 *
 * CRITICAL RULES:
 * - NEVER modify the ProseMirror node's own DOM (corrupts undo history).
 * - Only add/remove data attributes and lightweight wrappers on elements
 *   that already exist in the document.
 * - All injected wrapper divs get data-layout-injected="true" so they can
 *   be cleaned up before the next run.
 */

export function applyLayoutRoles(editorDom, layoutStyle) {
  if (!editorDom) return;

  // Clean up previous injections
  editorDom.querySelectorAll('[data-layout-injected="true"]').forEach(el => {
    while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
    el.remove();
  });
  editorDom.querySelectorAll('[data-layout-role]').forEach(el => {
    el.removeAttribute('data-layout-role');
  });

  if (layoutStyle === 'minimalist') return;

  // Find ProseMirror — it may be a direct child (new structure) or nested
  const proseMirror = editorDom.querySelector('.ProseMirror') || editorDom;

  const firstH1 = proseMirror.querySelector('h1');
  const firstTable = proseMirror.querySelector('table.agreement-table');
  const clausesPlaceholder = proseMirror.querySelector('[data-type="clauses-placeholder"]');

  if (firstH1) {
    firstH1.setAttribute('data-layout-role', 'primary-heading');
  }

  if (clausesPlaceholder) {
    wrapInSection(clausesPlaceholder, 'clauses', 'primary-sidebar-item');
  }

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