import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CONTEXTS,
  detectVersion,
  getId,
  ensureContext,
  orderContext,
  buildAnnotation,
  buildNavPlace,
  toFeature
} from '../public/js/iiif.js'

test('detectVersion recognizes IIIF 2, 3, and 4 contexts', () => {
  assert.equal(detectVersion({ '@context': 'http://iiif.io/api/presentation/2/context.json' }), 2)
  assert.equal(detectVersion({ '@context': 'https://iiif.io/api/presentation/3/context.json' }), 3)
  assert.equal(detectVersion({ '@context': 'http://iiif.io/api/presentation/4/context.json' }), 4)
  assert.equal(detectVersion({ '@context': ['foo', 'https://iiif.io/api/presentation/3/context.json'] }), 3)
})

test('detectVersion returns null for non-IIIF resources', () => {
  assert.equal(detectVersion({}), null)
  assert.equal(detectVersion({ '@context': 'http://www.w3.org/ns/anno.jsonld' }), null)
})

test('getId reads @id and id', () => {
  assert.equal(getId({ '@id': 'http://a' }), 'http://a')
  assert.equal(getId({ id: 'http://b' }), 'http://b')
  assert.equal(getId({}), '')
})

test('ensureContext adds a missing context and tolerates http/https variants', () => {
  const added = ensureContext([], CONTEXTS.api3)
  assert.deepEqual(added, [CONTEXTS.api3])
  const present = ensureContext(['http://' + CONTEXTS.api3.replace(/^https?:\/\//, '')], CONTEXTS.api3)
  assert.equal(present.length, 1)
  assert.equal(present[0], 'http://' + CONTEXTS.api3.replace(/^https?:\/\//, ''))
  const fromNull = ensureContext(null, CONTEXTS.navPlace)
  assert.deepEqual(fromNull, [CONTEXTS.navPlace])
})

test('orderContext puts the first URI before the second', () => {
  const ctx = [CONTEXTS.geojson, CONTEXTS.w3Annotation]
  const ordered = orderContext(ctx, CONTEXTS.w3Annotation, CONTEXTS.geojson)
  assert.ok(ordered.indexOf(CONTEXTS.w3Annotation) < ordered.indexOf(CONTEXTS.geojson))
})

test('buildAnnotation produces a tagging annotation with anno-before-geojson context', () => {
  const target = { '@id': 'https://example.org/man', '@context': CONTEXTS.api3 }
  const feature = toFeature('Point', [1, 2])
  const anno = buildAnnotation(target, feature, 'Jane Doe')
  assert.equal(anno.type, 'Annotation')
  assert.equal(anno.motivation, 'tagging')
  assert.equal(anno.target, 'https://example.org/man')
  assert.equal(anno.creator, 'Jane Doe')
  assert.deepEqual(anno.body, feature)
  const ctx = anno['@context']
  assert.ok(Array.isArray(ctx))
  assert.ok(ctx.indexOf(CONTEXTS.w3Annotation) < ctx.indexOf(CONTEXTS.geojson))
})

test('buildAnnotation omits creator when not provided and serializes single contexts', () => {
  const anno = buildAnnotation({ '@id': 'https://example.org/x' }, toFeature('Point', [0, 0]))
  assert.equal('creator' in anno, false)
  const ctx = anno['@context']
  assert.ok(Array.isArray(ctx))
  assert.equal(ctx[0], CONTEXTS.w3Annotation)
})

test('buildAnnotation falls back to the supplied URI when the object has no id', () => {
  const anno = buildAnnotation({}, toFeature('Point', [0, 0]), null, 'https://example.org/no-id')
  assert.equal(anno.target, 'https://example.org/no-id')
})

test('buildNavPlace keeps the source version, orders contexts, and wraps the feature', () => {
  const source = {
    '@context': CONTEXTS.api2,
    '@id': 'https://example.org/man2',
    label: { 'en': ['A IIIF 2 manifest'] },
    navPlace: { type: 'FeatureCollection', features: ['stale'] }
  }
  const feature = toFeature('Point', [5, 6])
  const out = buildNavPlace(source, feature)
  const keys = Object.keys(out)
  assert.equal(keys[0], '@context')
  const ctx = out['@context']
  assert.ok(ctx.includes(CONTEXTS.navPlace))
  assert.ok(ctx.includes(CONTEXTS.api2))
  assert.ok(ctx.indexOf(CONTEXTS.navPlace) < ctx.indexOf(CONTEXTS.api2))
  assert.equal(out.navPlace.type, 'FeatureCollection')
  assert.deepEqual(out.navPlace.features, [feature])
  assert.equal(out.label['en'][0], 'A IIIF 2 manifest')
})

test('buildNavPlace mints an api3 context when the source has none', () => {
  const out = buildNavPlace({ '@id': 'https://example.org/plain' }, toFeature('Point', [0, 0]))
  assert.ok(out['@context'].includes(CONTEXTS.api3))
  assert.ok(out['@context'].includes(CONTEXTS.navPlace))
})

test('toFeature rounds to 6 decimals and closes polygon rings', () => {
  const point = toFeature('Point', [1.12345678, 2.98765432])
  assert.deepEqual(point.geometry.coordinates, [1.123457, 2.987654])
  assert.equal(point.type, 'Feature')
  assert.deepEqual(point.properties, {})

  const line = toFeature('LineString', [0, 0, 1, 1])
  assert.deepEqual(line.geometry.coordinates, [[0, 0], [1, 1]])

  const poly = toFeature('Polygon', [0, 0, 1, 0, 1, 1])
  assert.deepEqual(poly.geometry.coordinates, [[[0, 0], [1, 0], [1, 1], [0, 0]]])
})
