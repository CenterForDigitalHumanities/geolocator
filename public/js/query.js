/*
 * Query string handling.
 *
 * Reads the pre-hash query string directly (window.location.search) so
 * percent-encoded URIs from oh-my-rerum's iiif-content parameter are
 * visible, and builds shareable URLs.
 *
 * Supported parameters:
 *   iiif-content  target resource URI (OMR-compatible name)
 *   manifest      alias for iiif-content
 *   mode          navPlace | annotation
 *   result        URI of an already-created resource (shareable finished state)
 */

export function safeDecode(s) {
  if (s == null) return s
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

export function parseQueryString(search) {
  const params = new URLSearchParams(search)
  const get = (name) => {
    const v = params.get(name)
    return v === null ? null : v
  }
  const mode = get('mode')
  return {
    iiifContent: safeDecode(get('iiif-content') ?? get('manifest')),
    mode: mode === 'annotation' || mode === 'navPlace' ? mode : null,
    result: safeDecode(get('result'))
  }
}

export function parseQuery() {
  return parseQueryString(window.location.search)
}

export function buildUrl(base, params) {
  const url = new URL(base, typeof window !== 'undefined' ? window.location.href : 'http://localhost/')
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') url.searchParams.delete(key)
    else url.searchParams.set(key, value)
  }
  return url.toString()
}
