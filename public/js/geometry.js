/*
 * Pure geometry-drawing state machine behind <point-picker>.
 *
 * Tracks the vertices the map renders and the flat GeoJSON coordinate list
 * the feature is built from, with no DOM or Leaflet dependency so the
 * click/double-click rules can be unit-tested in Node.
 *
 * Leaflet fires click, click, dblclick for a double-click, so the second
 * click has already added a duplicate vertex by the time dblclick runs;
 * doubleClick() drops it.  In Point mode a double-click must not touch the
 * state at all (the single click already placed the point).
 */

import { toFeature } from './iiif.js'

/**
 * Compares the distance between two points to determine if they are close
 * enough to be considered the same point. Used when creating polygons:
 * users can click (within a margin of error) the first point to close and
 * complete the shape. The margin shrinks as zoom increases.
 */
export function isCloseToPoint(newPoint, firstPoint, currentZoomLevel) {
  const z = currentZoomLevel + 1 // Avoid division by zero if zoomed all the way out
  let marginOfError = 0
  if (z <= 8) marginOfError = 2.95 * Math.exp(-0.438 * z)
  else if (z <= 14) marginOfError = 18.1 * Math.exp(-0.675 * z)
  else if (z <= 20) marginOfError = 16.4 * Math.exp(-0.693 * z)
  return Math.abs(newPoint.lat - firstPoint.lat) < marginOfError &&
    Math.abs(newPoint.lng - firstPoint.lng) < marginOfError
}

export class GeometryDraft {
  /**
   * @param {String} type Point | LineString | Polygon
   */
  constructor(type = 'Point') {
    this.type = type
    this.vertices = [] // [{lat, lng}] in click order, for rendering
    this.coords = [] // flat [lng, lat, ...], for the GeoJSON geometry
    this.complete = false
  }

  /** True when the selection is a usable geometry, not a half-drawn shape. */
  get valid() {
    if (this.type === 'Point') return this.coords.length >= 2
    if (!this.complete) return false
    // vertices include the closing duplicate for polygons
    return this.type === 'LineString' ? this.coords.length >= 4 : this.vertices.length >= 4
  }

  /** The GeoJSON Feature for the current selection, or null if incomplete. */
  get feature() {
    return this.valid ? toFeature(this.type, this.coords) : null
  }

  reset() {
    this.vertices = []
    this.coords = []
    this.complete = false
  }

  setType(type) {
    this.type = type
    this.reset()
  }

  /**
   * Register a single map click.
   * @param {{lat:Number, lng:Number}} latlng
   * @param {Number} zoom current map zoom (for the polygon close margin)
   */
  click(latlng, zoom) {
    if (this.complete) this.reset()
    if (this.type === 'Point') {
      this.reset() // a point replaces prior selections
    } else if (
      this.type === 'Polygon' &&
      this.vertices.length > 0 &&
      isCloseToPoint(latlng, this.vertices[0], zoom)
    ) {
      // Clicking the first vertex closes the ring; the click itself is not a new vertex.
      this.vertices.push(this.vertices[0])
      this.complete = true
      return
    }
    this.vertices.push(latlng)
    this.coords.push(latlng.lng, latlng.lat)
  }

  /**
   * Register a double-click, which finalizes a LineString or Polygon.
   * No-op for Point (the preceding click already placed the point).
   */
  doubleClick() {
    if (this.type === 'Point') return
    this.complete = true
    // The click that precedes the double-click added a duplicate vertex; drop it.
    this.vertices.pop()
    this.coords.pop()
    this.coords.pop()
    if (this.type === 'Polygon' && this.vertices.length > 1) {
      this.vertices.push(this.vertices[0]) // close the ring for rendering
    }
  }
}
