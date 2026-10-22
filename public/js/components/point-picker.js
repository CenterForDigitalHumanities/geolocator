/*
 * <point-picker> — step 2: draw a geometry on a Leaflet map.
 *
 * Replaces the old Mapbox-tile version (whose personal access token is burned)
 * with OpenStreetMap tiles.  All drawing state lives in the pure
 * GeometryDraft state machine (js/geometry.js); this component only wires
 * Leaflet events into it and re-renders the map from its state.  Emits
 * `geometry-confirmed` with the draft's GeoJSON Feature.
 *
 * Requires the Leaflet global `L` (loaded by the page).
 */

import { GeometryDraft } from '../geometry.js'

const ICONS = {
  Point: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
  LineString: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 18 10 9l4 5 6-9"/><circle cx="4" cy="18" r="2" fill="currentColor"/><circle cx="10" cy="9" r="2" fill="currentColor"/><circle cx="14" cy="14" r="2" fill="currentColor"/><circle cx="20" cy="5" r="2" fill="currentColor"/></svg>',
  Polygon: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 3l8 6-3 10H7L4 9z"/><circle cx="12" cy="3" r="1.8" fill="currentColor"/><circle cx="20" cy="9" r="1.8" fill="currentColor"/><circle cx="17" cy="19" r="1.8" fill="currentColor"/><circle cx="7" cy="19" r="1.8" fill="currentColor"/><circle cx="4" cy="9" r="1.8" fill="currentColor"/></svg>',
  clear: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zM6 9h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9z"/></svg>'
}

const TEMPLATE = `
  <div class="card">
    <header title="Use the map below to pan around">
      Use the map to draw a geometry. Finalize any shape by double clicking the final point. Subsequent clicks will
      clear any previous selections.
      <br><input data-el="confirmCoords" disabled type="button" class="button primary" value="See Preview" />
    </header>
    <div class="card-body">
      <div class="row geometry-type-row">
        <button data-el="pointBtn" class="geometry-type-button" title="Click on the desired location to place a point marker.">${ICONS.Point}</button>
        <button data-el="polylineBtn" class="geometry-type-button" title="Click to add points connected by line segments.">${ICONS.LineString}</button>
        <button data-el="polygonBtn" class="geometry-type-button" title="Click to add vertices. Can click the first vertex to finish the shape.">${ICONS.Polygon}</button>
        <div style="margin-left: 20px;"></div>
        <button data-el="clearBtn" class="geometry-type-button" title="Clear the map of all selections. Alternatively, click any of the geometry type buttons.">${ICONS.clear}</button>
      </div>
      <div title="Use the map below to pan around.  Click to be given the option to use coordinates, or enter coordinates manually."
        data-el="map" class="col" id="leafletPreview"></div>
    </div>
  </div>
`

const TILE_ATTRIBUTION =
  'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'

export class PointPicker extends HTMLElement {
  #draft = new GeometryDraft('Point')
  #map = null
  #markerGroup = null
  #markerIcon = null

  connectedCallback() {
    this.innerHTML = TEMPLATE
    const q = (el) => this.querySelector(`[data-el="${el}"]`)
    this.#markerIcon = L.icon({ iconUrl: '/marker-icon.png', iconSize: [10, 10] })
    this.#map = L.map(q('map').id).setView([12, 12], 2)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19
    }).addTo(this.#map)
    this.#markerGroup = L.layerGroup().addTo(this.#map)
    this.#chooseGeometry('Point')

    q('pointBtn').addEventListener('click', () => this.#chooseGeometry('Point'))
    q('polylineBtn').addEventListener('click', () => this.#chooseGeometry('LineString'))
    q('polygonBtn').addEventListener('click', () => this.#chooseGeometry('Polygon'))
    q('clearBtn').addEventListener('click', () => this.#clearMapData())
    q('confirmCoords').addEventListener('click', () => this.#confirm())
    this.#map.on('click', (e) => this.#onClick(e))
    this.#map.on('dblclick', (e) => this.#onDblClick(e))
  }

  /** The GeoJSON Feature for the current selection, or null if incomplete. */
  get feature() {
    return this.#draft.feature
  }

  reset() {
    this.#chooseGeometry('Point')
  }

  /** The map is created while hidden; re-measure when its step becomes visible. */
  refresh() {
    this.#map?.invalidateSize()
  }

  #onClick(e) {
    this.#draft.click(e.latlng, this.#map.getZoom())
    this.querySelector('[data-el="confirmCoords"]').disabled = !this.#draft.valid
    this.#render()
  }

  #onDblClick() {
    if (this.#draft.type === 'Point') return // the click already placed the point
    this.#draft.doubleClick()
    this.querySelector('[data-el="confirmCoords"]').disabled = !this.#draft.valid
    this.#render()
  }

  /** Redraw markers and the shape from the draft's current state. */
  #render() {
    this.#markerGroup.clearLayers()
    this.#clearMapLayers()
    const { type, vertices, complete } = this.#draft
    if (vertices.length > 1) {
      if (complete && type === 'Polygon') {
        L.polygon(vertices, { color: 'lime' }).addTo(this.#map)
      } else {
        L.polyline(vertices, { color: complete ? 'lime' : 'orange' }).addTo(this.#map)
      }
    }
    for (const v of vertices) {
      this.#markerGroup.addLayer(L.marker(v, { icon: this.#markerIcon }))
    }
  }

  #chooseGeometry(geomType) {
    this.#draft.setType(geomType)
    this.#highlightGeomType(geomType)
    this.#clearMapData()
  }

  #clearMapData() {
    this.querySelector('[data-el="confirmCoords"]').disabled = true
    this.#draft.reset()
    this.#markerGroup?.clearLayers()
    this.#clearMapLayers()
  }

  #clearMapLayers() {
    this.#map.eachLayer((layer) => {
      if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
        this.#map.removeLayer(layer)
      }
    })
  }

  #highlightGeomType(geomType) {
    const map = { Point: 'pointBtn', LineString: 'polylineBtn', Polygon: 'polygonBtn' }
    for (const [type, elName] of Object.entries(map)) {
      this.querySelector(`[data-el="${elName}"]`)
        .classList.toggle('selected', type === geomType)
    }
  }

  #confirm() {
    const feature = this.feature
    if (!feature) return
    this.dispatchEvent(new CustomEvent('geometry-confirmed', {
      bubbles: true,
      composed: true,
      detail: { feature, geometryType: this.#draft.type }
    }))
  }
}

customElements.define('point-picker', PointPicker)
