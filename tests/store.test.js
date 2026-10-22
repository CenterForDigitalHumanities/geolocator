import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as store from '../public/js/store.js'

// store.js talks to the page origin through fetch; stub both for Node.
globalThis.window = { location: { origin: 'https://geo.example.org' } }

function mockFetch(handler) {
  const calls = []
  globalThis.fetch = async (url, opts = {}) => {
    calls.push({ url: String(url), opts })
    return handler(String(url), opts)
  }
  return calls
}

const jsonResponse = (body, ok = true, status = 200) => ({
  ok,
  status,
  text: async () => JSON.stringify(body)
})

test('createResource POSTs JSON to /create and returns the stored object', async () => {
  const calls = mockFetch(async () => jsonResponse({ '@id': 'https://x/1', hello: 'world' }))
  const result = await store.createResource({ type: 'Annotation' })
  assert.equal(calls[0].url, 'https://geo.example.org/create')
  assert.equal(calls[0].opts.method, 'POST')
  assert.match(calls[0].opts.headers['Content-Type'], /application\/json/)
  assert.deepEqual(JSON.parse(calls[0].opts.body), { type: 'Annotation' })
  assert.equal(result['@id'], 'https://x/1')
})

test('updateResource PUTs to /update', async () => {
  const calls = mockFetch(async () => jsonResponse({ ok: true }))
  await store.updateResource({ '@id': 'https://x/2' })
  assert.equal(calls[0].url, 'https://geo.example.org/update')
  assert.equal(calls[0].opts.method, 'PUT')
})

test('queryResources passes limit and skip as query params', async () => {
  const calls = mockFetch(async () => jsonResponse([]))
  await store.queryResources({ type: 'Annotation' }, { limit: 5, skip: 10 })
  const url = new URL(calls[0].url)
  assert.equal(url.pathname, '/query')
  assert.equal(url.searchParams.get('limit'), '5')
  assert.equal(url.searchParams.get('skip'), '10')
  assert.deepEqual(JSON.parse(calls[0].opts.body), { type: 'Annotation' })
})

test('deleteResource encodes the id into the path', async () => {
  const calls = mockFetch(async () => ({ ok: true, status: 200, text: async () => 'gone' }))
  const result = await store.deleteResource('https://x/3?a=1')
  assert.equal(calls[0].opts.method, 'DELETE')
  assert.ok(calls[0].url.startsWith('https://geo.example.org/delete/https%3A'))
  assert.equal(result, 'gone')
})

test('a failed request throws with status and parsed body', async () => {
  mockFetch(async () => ({
    ok: false,
    status: 502,
    text: async () => JSON.stringify({ error: 'upstream down' })
  }))
  await assert.rejects(
    () => store.createResource({}),
    (err) => {
      assert.equal(err.status, 502)
      assert.deepEqual(err.body, { error: 'upstream down' })
      assert.match(err.message, /502/)
      return true
    }
  )
})
