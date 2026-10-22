import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GeometryDraft, isCloseToPoint } from '../public/js/geometry.js'

const pt = (lat, lng) => ({ lat, lng })

test('empty draft has no feature', () => {
  assert.equal(new GeometryDraft('Point').feature, null)
  assert.equal(new GeometryDraft('Polygon').feature, null)
})

test('Point: each click replaces the prior selection', () => {
  const d = new GeometryDraft('Point')
  d.click(pt(1, 2), 5)
  d.click(pt(3, 4), 5)
  assert.deepEqual(d.coords, [4, 3])
  assert.equal(d.vertices.length, 1)
  assert.deepEqual(d.feature.geometry.coordinates, [4, 3])
})

test('Point: double-click is a no-op (regression: it used to wipe coords)', () => {
  const d = new GeometryDraft('Point')
  d.click(pt(1, 2), 5)
  d.doubleClick() // Leaflet fires click, click, dblclick
  d.doubleClick()
  assert.deepEqual(d.coords, [2, 1])
  assert.ok(d.feature)
})

test('LineString: clicks accumulate, double-click drops the duplicate vertex', () => {
  const d = new GeometryDraft('LineString')
  d.click(pt(0, 0), 5)
  d.click(pt(1, 1), 5)
  d.click(pt(2, 2), 5) // first click of the double-click
  d.click(pt(2, 2), 5) // second click of the double-click
  d.doubleClick()
  assert.equal(d.complete, true)
  assert.deepEqual(d.coords, [0, 0, 1, 1, 2, 2])
  assert.deepEqual(d.vertices.map((v) => [v.lat, v.lng]), [[0, 0], [1, 1], [2, 2]])
  assert.deepEqual(d.feature.geometry.coordinates, [[0, 0], [1, 1], [2, 2]])
})

test('Polygon: clicking the first vertex closes the ring and completes', () => {
  const d = new GeometryDraft('Polygon')
  d.click(pt(0, 0), 2)
  d.click(pt(4, 0), 2)
  d.click(pt(0, 4), 2)
  d.click(pt(0.5, 0.5), 2) // within the (loose) close margin at zoom 2
  assert.equal(d.complete, true)
  assert.deepEqual(d.coords, [0, 0, 0, 4, 4, 0]) // flat lng,lat pairs
  const ring = d.feature.geometry.coordinates[0]
  assert.deepEqual(ring[0], ring[ring.length - 1]) // GeoJSON ring closed
})

test('Polygon: double-click closes the ring for rendering', () => {
  const d = new GeometryDraft('Polygon')
  d.click(pt(0, 0), 10)
  d.click(pt(4, 0), 10)
  d.click(pt(0, 4), 10)
  d.click(pt(5, 5), 10)
  d.click(pt(5, 5), 10)
  d.doubleClick()
  assert.equal(d.complete, true)
  assert.deepEqual(d.coords, [0, 0, 0, 4, 4, 0, 5, 5])
  const v = d.vertices
  assert.deepEqual([v[0].lat, v[0].lng], [v[v.length - 1].lat, v[v.length - 1].lng])
})

test('click after completion starts a fresh shape', () => {
  const d = new GeometryDraft('LineString')
  d.click(pt(0, 0), 5)
  d.click(pt(1, 1), 5)
  d.doubleClick()
  assert.equal(d.complete, true)
  d.click(pt(7, 8), 5)
  assert.equal(d.complete, false)
  assert.deepEqual(d.coords, [8, 7])
})

test('setType resets the draft', () => {
  const d = new GeometryDraft('LineString')
  d.click(pt(0, 0), 5)
  d.setType('Polygon')
  assert.equal(d.type, 'Polygon')
  assert.equal(d.feature, null)
  assert.equal(d.complete, false)
})

test('isCloseToPoint margin shrinks as zoom increases', () => {
  const first = pt(0, 0)
  assert.equal(isCloseToPoint(pt(0.5, 0.5), first, 2), true) // loose when zoomed out
  assert.equal(isCloseToPoint(pt(0.5, 0.5), first, 18), false) // tight at high zoom
})

test('valid: half-drawn shapes have no feature', () => {
  const line = new GeometryDraft('LineString')
  line.click(pt(0, 0), 5)
  assert.equal(line.valid, false)
  assert.equal(line.feature, null)
  line.click(pt(1, 1), 5)
  assert.equal(line.valid, false) // not finalized yet
  line.click(pt(1, 1), 5) // dblclick gesture: click, click, dblclick
  line.doubleClick()
  assert.equal(line.valid, true)

  const tiny = new GeometryDraft('Polygon')
  tiny.click(pt(0, 0), 10)
  tiny.click(pt(1, 1), 10)
  tiny.click(pt(1, 1), 10)
  tiny.doubleClick() // only two real vertices: not a polygon
  assert.equal(tiny.valid, false)
  assert.equal(tiny.feature, null)

  const point = new GeometryDraft('Point')
  assert.equal(point.valid, false)
  point.click(pt(5, 5), 5)
  assert.equal(point.valid, true)
})
