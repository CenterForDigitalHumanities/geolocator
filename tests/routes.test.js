import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import app from '../app.js'

test('GET / serves the single-page app', async () => {
  const res = await request(app).get('/')
  assert.equal(res.status, 200)
  assert.match(res.text, /RERUM Geolocator/)
  assert.match(res.text, /<geo-page>/)
  assert.match(res.text, /js\/app\.js/)
})

test('the old generator pages redirect to the mode parameter', async () => {
  const a = await request(app).get('/navPlace.html')
  assert.equal(a.status, 301)
  assert.equal(a.headers.location, '/?mode=navPlace')
  const b = await request(app).get('/annotate.html')
  assert.equal(b.status, 301)
  assert.equal(b.headers.location, '/?mode=annotation')
})

test('non-JSON POSTs are rejected with 415', async () => {
  const res = await request(app)
    .post('/create')
    .set('Content-Type', 'text/plain')
    .send('type=Annotation')
  assert.equal(res.status, 415)
})

test('unknown paths get a plain 404 page', async () => {
  const res = await request(app).get('/no-such-thing')
  assert.equal(res.status, 404)
  assert.match(res.text, /404/)
})
