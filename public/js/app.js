/*
 * Geolocator single-page app.
 *
 * One page, two modes (navPlace | annotation), four steps:
 *   supply a target URI -> draw a geometry -> preview -> done.
 *
 * Shareable state lives in the query string:
 *   ?iiif-content=URI   prefill the target (alias: ?manifest=)
 *   ?mode=navPlace|annotation
 *   ?result=URI         show an already-created resource's finished state
 */

import './components/geo-page.js'
import './components/user-resource.js'
import './components/point-picker.js'
import './components/preview-card.js'
import { parseQuery, buildUrl } from './query.js'
import { buildAnnotation, buildNavPlace, getId } from './iiif.js'
import { jsonPreview } from './utils.js'

const VIEWERS = {
  navPlace: (uri) => `https://map.rerum.io/?iiif-content=${encodeURIComponent(uri)}`,
  annotation: (uri) => `https://map.rerum.io/annotation-viewer.html?data=${encodeURIComponent(uri)}`
}

/** The href for a resource URI only if it is a safe web URL; '' otherwise. */
function safeUrl(uri) {
  try {
    const u = new URL(uri, window.location.href)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : ''
  } catch {
    return ''
  }
}

/** Render a resource URI as a textContent-built link (never innerHTML) so a
 * crafted id cannot inject markup or a javascript: href. */
function renderUriLink(el, uri) {
  el.innerHTML = ''
  const href = uri ? safeUrl(uri) : ''
  if (href) {
    const a = document.createElement('a')
    a.target = '_blank'
    a.rel = 'noopener'
    a.href = href
    a.textContent = uri
    el.appendChild(a)
  } else {
    el.textContent = uri || '{ no URI }'
  }
}

const els = {
  navPlaceBtn: document.getElementById('navPlaceModeBtn'),
  annotationBtn: document.getElementById('annotationModeBtn'),
  userResource: document.querySelector('user-resource'),
  pointPicker: document.querySelector('point-picker'),
  preview: document.querySelector('preview-card'),
  finished: document.getElementById('finished'),
  theuri: document.getElementById('theuri'),
  viewerLink: document.getElementById('viewerLink'),
  takeout: document.getElementById('takeout'),
  resultError: document.getElementById('resultError')
}

let mode = 'navPlace'
let target = null // { uri, resource, creator }

function setMode(next) {
  mode = next
  els.navPlaceBtn.classList.toggle('active', mode === 'navPlace')
  els.annotationBtn.classList.toggle('active', mode === 'annotation')
  history.replaceState(null, '', buildUrl(window.location.pathname, {
    mode,
    'iiif-content': target?.uri ?? parseQuery().iiifContent
  }))
}

function showStep(step) {
  els.userResource.classList.toggle('is-hidden', step !== 'supply')
  els.pointPicker.classList.toggle('is-hidden', step !== 'draw')
  els.preview.classList.toggle('is-hidden', step !== 'preview')
  els.finished.classList.toggle('is-hidden', step !== 'done')
  if (step === 'draw') els.pointPicker.refresh() // map was built while hidden
}

function resetAll() {
  target = null
  history.replaceState(null, '', buildUrl(window.location.pathname, {
    mode,
    'iiif-content': null,
    result: null
  }))
  els.userResource.querySelector('#objURI').value = ''
  els.userResource.querySelector('#objCreator').value = ''
  els.userResource.querySelector('[data-step="confirm"]').classList.add('is-hidden')
  els.userResource.hideNotices()
  els.pointPicker.reset()
  els.preview.clearMessage()
  showStep('supply')
}

function showFinished(resource) {
  const uri = getId(resource)
  renderUriLink(els.theuri, uri)
  els.viewerLink.setAttribute('href', safeUrl(uri) ? VIEWERS[mode](uri) : '#')
  const copy = { ...resource }
  delete copy.__rerum
  els.takeout.innerHTML = `<pre>${jsonPreview(copy)}</pre>`
  showStep('done')
}

/* ---- step wiring ------------------------------------------------------- */

els.userResource.addEventListener('target-resolved', (e) => {
  els.userResource.hideNotices()
  if (mode === 'navPlace' && e.detail.resource?.navPlace) {
    els.userResource.showNotice('navPlaceExists')
  }
})

els.userResource.addEventListener('target-confirmed', (e) => {
  target = e.detail
  history.replaceState(null, '', buildUrl(window.location.pathname, {
    mode,
    'iiif-content': target.uri
  }))
  showStep('draw')
})

els.pointPicker.addEventListener('geometry-confirmed', (e) => {
  const resource = mode === 'navPlace'
    ? buildNavPlace(target.resource, e.detail.feature)
    : buildAnnotation(target.resource, e.detail.feature, target.creator, target.uri)
  els.preview.mode = mode
  els.preview.resource = resource
  showStep('preview')
})

els.preview.addEventListener('resource-created', (e) => {
  showFinished(e.detail.resource)
})

els.preview.addEventListener('start-over', () => resetAll())
document.getElementById('startOverBtn').addEventListener('click', () => resetAll())

els.navPlaceBtn.addEventListener('click', () => setMode('navPlace'))
els.annotationBtn.addEventListener('click', () => setMode('annotation'))

/* ---- entry point ------------------------------------------------------- */

async function init() {
  const query = parseQuery()
  setMode(query.mode ?? 'navPlace')
  if (query.result) {
    els.finished.classList.remove('is-hidden')
    try {
      const resp = await fetch(query.result)
      if (!resp.ok) throw new Error(`status ${resp.status}`)
      const resource = await resp.json()
      const uri = getId(resource)
      setMode(resource.navPlace ? 'navPlace' : 'annotation')
      renderUriLink(els.theuri, uri)
      els.viewerLink.setAttribute('href', safeUrl(uri) ? VIEWERS[mode](uri) : '#')
      const copy = { ...resource }
      delete copy.__rerum
      els.takeout.innerHTML = `<pre>${jsonPreview(copy)}</pre>`
    } catch (err) {
      els.resultError.textContent = `Could not load ${query.result}: ${err.message ?? err}`
      els.resultError.classList.remove('is-hidden')
    }
    return
  }
  showStep('supply')
  if (query.iiifContent) els.userResource.setUri(query.iiifContent)
}

init()
