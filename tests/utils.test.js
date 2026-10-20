import { test } from 'node:test'
import assert from 'node:assert/strict'
import { escapeHtml, jsonHighlight, jsonPreview } from '../public/js/utils.js'

test('escapeHtml neutralizes HTML-significant characters', () => {
  assert.equal(escapeHtml(`<script>alert("x & y')</script>`),
    '&lt;script&gt;alert(&quot;x &amp; y&#39;)&lt;/script&gt;')
})

test('jsonHighlight classifies tokens', () => {
  const html = jsonHighlight('{"a": 1, "b": "s", "c": true, "d": null}')
  assert.match(html, /<span class="json-key">&quot;a&quot;:<\/span>/)
  assert.match(html, /<span class="json-number">1<\/span>/)
  assert.match(html, /<span class="json-string">&quot;s&quot;<\/span>/)
  assert.match(html, /<span class="json-boolean">true<\/span>/)
  assert.match(html, /<span class="json-null">null<\/span>/)
})

test('jsonHighlight is safe against embedded markup', () => {
  const html = jsonHighlight(JSON.stringify({ evil: '<img src=x onerror=alert(1)>' }))
  assert.equal(html.includes('<img'), false)
  assert.equal(html.includes('&lt;img'), true)
})

test('jsonPreview accepts objects and strings', () => {
  assert.match(jsonPreview({ n: 1 }), /json-number/)
  assert.match(jsonPreview('plain text'), /plain text/)
})
