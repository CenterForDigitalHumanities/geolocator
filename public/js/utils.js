/*
 * Small DOM-free helpers: safe HTML escaping and JSON syntax highlighting.
 * Replaces the json-format-highlight CDN dependency.
 */

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Wrap JSON tokens in <span class="json-*"> elements.
 * Tokenizing happens on the raw text; every piece is escaped on the way out,
 * so the result is safe for innerHTML.
 * @param {String} str pretty-printed JSON
 * @returns {String} HTML
 */
export function jsonHighlight(str) {
  const tokenRe = /("(?:\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false)\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g
  const parts = String(str).split(tokenRe)
  let out = ''
  for (let i = 0; i < parts.length; i += 3) {
    out += escapeHtml(parts[i])
    const token = parts[i + 1]
    if (token === undefined) continue
    let cls = 'json-number'
    if (token.startsWith('"')) cls = parts[i + 2] ? 'json-key' : 'json-string'
    else if (/^(?:true|false)$/.test(token)) cls = 'json-boolean'
    else if (token === 'null') cls = 'json-null'
    out += `<span class="${cls}">${escapeHtml(token)}</span>`
  }
  return out
}

/**
 * Pretty-print any value as highlighted JSON HTML.
 * @param {Object|String} value
 * @returns {String} HTML for a <pre> block
 */
export function jsonPreview(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, '\t')
  return jsonHighlight(text)
}
