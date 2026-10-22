/*
 * IIIF Presentation API 2/3/4 handling and geolocator data builders.
 *
 * Pure functions, no DOM.  Geolocator is non-destructive: a resource keeps
 * whatever Presentation API version it arrived with.  We only ever add the
 * navPlace (or Web Annotation + GeoJSON-LD) context and property.
 */

export const CONTEXTS = {
  api2: 'http://iiif.io/api/presentation/2/context.json',
  api3: 'https://iiif.io/api/presentation/3/context.json',
  api4: 'https://iiif.io/api/presentation/4/context.json',
  navPlace: 'http://iiif.io/api/extension/navplace/context.json',
  w3Annotation: 'http://www.w3.org/ns/anno.jsonld',
  geojson: 'http://geojson.org/geojson-ld/geojson-context.jsonld'
}

/**
 * The IIIF Presentation API version a resource declares via its @context.
 * Returns null when the resource declares no Presentation context (plain
 * Linked Open Data is fine for annotations).
 * @param {Object} resource
 * @returns {Number|null} 2, 3, 4, or null
 */
export function detectVersion(resource) {
  const contexts = [].concat(resource?.['@context'] ?? [])
  for (const ctx of contexts) {
    if (typeof ctx !== 'string') continue
    if (/iiif\.io\/api\/presentation\/2/.test(ctx)) return 2
    if (/iiif\.io\/api\/presentation\/3/.test(ctx)) return 3
    if (/iiif\.io\/api\/presentation\/4/.test(ctx)) return 4
  }
  return null
}

/**
 * The identifier of a resource in any JSON-LD flavor.
 * @param {Object} resource
 * @returns {String}
 */
export function getId(resource) {
  return resource?.['@id'] ?? resource?.id ?? ''
}

function variants(url) {
  return [url, url.replace(/^http:/, 'https:'), url.replace(/^https:/, 'http:')]
}

/**
 * Ensure a context URI is present, tolerating http/https variants of what
 * the resource already declares.  Always returns an array.  When adding,
 * the given (canonical) form is appended.
 * @param {String|Array|undefined} context an @context value
 * @param {String} url the context to guarantee
 * @returns {Array}
 */
export function ensureContext(context, url) {
  let list = [].concat(context ?? []).filter((c) => typeof c === 'string')
  if (!list.some((c) => variants(url).includes(c))) {
    list = list.concat([url])
  }
  return list
}

/**
 * Swap two context URIs so `first` precedes `second`, keeping whatever
 * scheme variants the resource already used.  No-op when either is absent.
 * @param {Array} context
 * @param {String} first
 * @param {String} second
 * @returns {Array}
 */
export function orderContext(context, first, second) {
  const list = [...context]
  const i = list.findIndex((c) => variants(first).includes(c))
  const j = list.findIndex((c) => variants(second).includes(c))
  if (i > -1 && j > -1 && i > j) {
    list[i] = second
    list[j] = first
  }
  return list
}

function serializeContext(list) {
  return list.length === 1 ? list[0] : list
}

/**
 * Build a W3C Web Annotation targeting the user's resource with a GeoJSON
 * Feature body.  The creator belongs on the annotation, never on the
 * targeted resource.
 * @param {Object} userObj the resolved (or minimal) target resource
 * @param {Object} feature a GeoJSON Feature
 * @param {String} [creator] optional name or e-mail to attribute the data
 * @param {String} [fallbackTarget] URI to target when userObj carries no id
 * @returns {Object}
 */
export function buildAnnotation(userObj, feature, creator, fallbackTarget) {
  let context = ensureContext(userObj['@context'], CONTEXTS.w3Annotation)
  context = ensureContext(context, CONTEXTS.geojson)
  context = orderContext(context, CONTEXTS.w3Annotation, CONTEXTS.geojson)
  const anno = {
    '@context': serializeContext(context),
    type: 'Annotation',
    motivation: 'tagging',
    body: feature,
    // A resolved object without an id still targets the URI it was fetched from.
    target: getId(userObj) || fallbackTarget || ''
  }
  if (creator) anno.creator = creator
  return anno
}

/**
 * Build a copy of the user's IIIF resource (any Presentation API version)
 * with a navPlace FeatureCollection added.  @context stays the first
 * property; an existing navPlace is replaced; the source model is otherwise
 * untouched.
 * @param {Object} userObj the resolved IIIF resource
 * @param {Object} feature a GeoJSON Feature
 * @returns {Object}
 */
export function buildNavPlace(userObj, feature) {
  const version = detectVersion(userObj) ?? 3
  let context = ensureContext(userObj['@context'], CONTEXTS.navPlace)
  context = ensureContext(context, CONTEXTS['api' + version])
  context = orderContext(context, CONTEXTS.navPlace, CONTEXTS['api' + version])
  const rest = { ...userObj }
  delete rest['@context']
  delete rest.navPlace
  const out = { '@context': serializeContext(context), ...rest }
  out.navPlace = {
    type: 'FeatureCollection',
    features: [feature]
  }
  return out
}

/**
 * Turn a flat [lng, lat, lng, lat, ...] list into a GeoJSON Feature,
 * rounded to 6 decimal places, closing polygon rings.
 * @param {String} geometryType Point | LineString | Polygon
 * @param {Array<Number>} coords flat lng/lat pairs
 * @returns {Object} a GeoJSON Feature
 */
export function toFeature(geometryType, coords) {
  const round = (n) => Math.round(n * 1000000) / 1000000
  const point = (i) => [round(coords[i]), round(coords[i + 1])]
  let coordinates
  if (geometryType === 'Point') {
    coordinates = point(0)
  } else {
    const positions = []
    for (let i = 0; i < coords.length; i += 2) positions.push(point(i))
    if (geometryType === 'Polygon') {
      if (positions.length > 1) positions.push([...positions[0]])
      coordinates = [positions]
    } else {
      coordinates = positions
    }
  }
  return {
    type: 'Feature',
    geometry: { type: geometryType, coordinates },
    properties: {}
  }
}
