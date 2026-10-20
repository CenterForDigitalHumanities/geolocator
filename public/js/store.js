/*
 * RERUM store client.
 *
 * Every call to the geolocator's own Express proxy goes through this module.
 * The proxy (routes/*.js) forwards to the RERUM instance configured by
 * RERUM_API_ADDR.  Keeping all traffic here means a future switch to
 * tiny.rerum.io (TinyNode) token passthrough — dropping the server proxy in
 * favor of direct, client-held tokens — is a one-file change.
 */

const ENDPOINTS = {
  create: 'create',
  update: 'update',
  overwrite: 'overwrite',
  query: 'query',
  remove: 'delete'
}

async function request(endpoint, { method = 'POST', body, params } = {}) {
  const url = new URL(ENDPOINTS[endpoint], window.location.origin)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value != null) url.searchParams.set(key, value)
    }
  }
  const res = await fetch(url, {
    method,
    mode: 'cors',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    throw Object.assign(new Error(`Geolocator API ${res.status}`), { status: res.status, body: data })
  }
  return data
}

/**
 * POST a brand new resource to the store.  Returns the created object,
 * which carries its minted URI.
 */
export function createResource(obj) {
  return request('create', { method: 'POST', body: obj })
}

/**
 * PUT an existing resource (by @id/id) with the given properties merged in.
 * Used by the navPlace flow to "import" an external IIIF object.
 */
export function updateResource(obj) {
  return request('update', { method: 'PUT', body: obj })
}

/**
 * PUT a full replacement for an existing resource.
 */
export function overwriteResource(obj) {
  return request('overwrite', { method: 'PUT', body: obj })
}

/**
 * POST a RERUM query.  Accepts { limit, skip } as a second argument.
 */
export function queryResources(conditions, { limit, skip } = {}) {
  return request('query', { method: 'POST', body: conditions, params: { limit, skip } })
}

/**
 * DELETE a resource by its store id.
 */
export async function deleteResource(id) {
  const url = new URL(`${ENDPOINTS.remove}/${encodeURIComponent(id)}`, window.location.origin)
  const res = await fetch(url, { method: 'DELETE', mode: 'cors' })
  if (!res.ok) {
    throw Object.assign(new Error(`Geolocator API ${res.status}`), { status: res.status })
  }
  return res.text()
}
