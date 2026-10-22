import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseQueryString, buildUrl } from '../public/js/query.js'

test('parseQueryString reads iiif-content, mode, and result', () => {
  const q = parseQueryString('?iiif-content=https%3A%2F%2Fexample.org%2Fm&mode=annotation&result=https%3A%2F%2Fexample.org%2Fa1')
  assert.equal(q.iiifContent, 'https://example.org/m')
  assert.equal(q.mode, 'annotation')
  assert.equal(q.result, 'https://example.org/a1')
})

test('manifest is an alias for iiif-content', () => {
  const q = parseQueryString('?manifest=https%3A%2F%2Fexample.org%2Fm')
  assert.equal(q.iiifContent, 'https://example.org/m')
})

test('iiif-content wins over manifest', () => {
  const q = parseQueryString('?iiif-content=a&manifest=b')
  assert.equal(q.iiifContent, 'a')
})

test('unknown or missing mode is null', () => {
  assert.equal(parseQueryString('?mode=sideways').mode, null)
  assert.equal(parseQueryString('').mode, null)
  assert.equal(parseQueryString('?mode=navPlace').mode, 'navPlace')
})

test('percent-encoding is decoded exactly once (no double-decode)', () => {
  // URLSearchParams already decodes; a second pass would corrupt %2520 -> ' '.
  const q = parseQueryString('?iiif-content=https%3A%2F%2Fexample.org%2Ffoo%2520bar')
  assert.equal(q.iiifContent, 'https://example.org/foo%20bar')
})

test('malformed percent-encoding is left alone', () => {
  const q = parseQueryString('?iiif-content=100%25&result=%E2%9C%93')
  assert.equal(q.iiifContent, '100%')
  assert.equal(q.result, '✓')
})

test('buildUrl sets, replaces, and removes parameters', () => {
  const base = 'https://geo.example.org/'
  assert.equal(
    buildUrl(base, { mode: 'navPlace' }),
    'https://geo.example.org/?mode=navPlace'
  )
  assert.equal(
    buildUrl(base + '?mode=navPlace&result=x', { mode: 'annotation', result: null }),
    'https://geo.example.org/?mode=annotation'
  )
  const withUri = buildUrl(base, { 'iiif-content': 'https://example.org/m?x=1' })
  assert.equal(parseQueryString(new URL(withUri).search).iiifContent, 'https://example.org/m?x=1')
})
