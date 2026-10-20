/*
 * <user-resource> — step 1: supply the web resource to geolocate.
 *
 * Resolves a URI, previews the object it points at, and collects an optional
 * creator attribution.  A ?iiif-content= prefill resolves automatically but
 * still requires an explicit Confirm click.  Emits `target-resolved` (so the
 * app can warn about an existing navPlace) and `target-confirmed`.
 */

import { jsonPreview } from '../utils.js'

const TEMPLATE = `
  <div class="card" data-step="supply">
    <header>
      <div class="popup"> Supply an existing Web Resource URI.  You also have the option to provide a name or E-mail
        to serve as the creator of this resource.  Use your own name or E-mail to take ownership of the data created!
        <span class="popuptext" data-notice="notResolved">
          <button class="close-button" data-action="close-notice"><strong>x</strong></button>
          <strong>Target URI could not be resolved.</strong> <br>Certain data previews will not be available.
          Applications that will use the data you are about to create will not be able to gather additional
          information about this targeted resource. You can supply a different URI or continue with this one.
        </span>
        <span class="popuptext" data-notice="navPlaceExists">
          <button class="close-button" data-action="close-notice"><strong>x</strong></button>
          The object provided already contains 'navPlace'. Provide a different URI or click 'Confirm URI' to
          replace the existing 'navPlace' and continue.
        </span>
      </div>
    </header>
    <div>
      <label for="objCreator">Name or E-mail (optional)</label>
      <input id="objCreator" type="text" />
    </div>
    <div>
      <label for="objURI">Object URI</label>
      <input id="objURI" type="text" />
    </div>
    <footer>
      <p data-el="noTarget" class="is-hidden" style="color: red">
        <strong>You must provide something to target.</strong>
      </p>
      <input data-el="nextBtn" type="button" class="button primary" value="Next" />
    </footer>
  </div>

  <div class="card is-hidden" data-step="confirm">
    <header>Resolved URI</header>
    <div>
      <input data-el="confirmBtn" type="button" class="button primary" value="Confirm URI" />
      <div data-el="preview"><pre>Resolving URI...</pre></div>
    </div>
  </div>
`

export class UserResource extends HTMLElement {
  #resource = null
  #uri = ''
  #pendingPrefill = null

  connectedCallback() {
    this.innerHTML = TEMPLATE
    this.querySelector('[data-el="nextBtn"]').addEventListener('click', () => this.resolve())
    this.querySelector('[data-el="confirmBtn"]').addEventListener('click', () => this.#confirm())
    this.querySelectorAll('[data-action="close-notice"]').forEach((btn) => {
      btn.addEventListener('click', () => btn.closest('.popuptext').classList.remove('show'))
    })
    if (this.#pendingPrefill !== null) {
      const prefill = this.#pendingPrefill
      this.#pendingPrefill = null
      this.setUri(prefill) // resolves now that the input exists
    }
  }

  /**
   * Prefill the URI input (from ?iiif-content=).  Set before upgrade/connect
   * or after; resolves automatically once the element is in the document.
   */
  setUri(uri) {
    const input = this.querySelector('#objURI')
    if (!input) {
      this.#pendingPrefill = uri
      return
    }
    input.value = uri
    this.resolve()
  }

  get creator() {
    return this.querySelector('#objCreator')?.value?.trim() ?? ''
  }

  /** Re-show a notice the app decided applies to the current mode. */
  showNotice(name) {
    this.querySelector(`[data-notice="${name}"]`)?.classList.add('show')
  }

  hideNotices() {
    this.querySelectorAll('.popuptext').forEach((n) => n.classList.remove('show'))
  }

  /**
   * Try to resolve the entered URI.  Unresolvable targets still proceed with
   * a minimal {@id} stub — the user decides whether that is acceptable.
   */
  async resolve() {
    const input = this.querySelector('#objURI')
    const target = input.value.trim()
    const noTarget = this.querySelector('[data-el="noTarget"]')
    this.hideNotices()
    if (!target) {
      noTarget.classList.remove('is-hidden')
      return
    }
    noTarget.classList.add('is-hidden')
    this.#uri = target
    const preview = this.querySelector('[data-el="preview"]')
    const confirmCard = this.querySelector('[data-step="confirm"]')
    confirmCard.classList.remove('is-hidden')
    preview.innerHTML = '<pre>Resolving URI...</pre>'
    let resolved = null
    try {
      // Match the page protocol to avoid mixed-content blocks on http deploys.
      const resp = await fetch(target.replace(/^https?:/, window.location.protocol))
      if (!resp.ok) throw new Error(`status ${resp.status}`)
      resolved = await resp.json()
    } catch {
      resolved = null
    }
    if (resolved && typeof resolved === 'object') {
      delete resolved.__rerum
      this.#resource = resolved
      preview.innerHTML = `<pre>${jsonPreview(resolved)}</pre>`
    } else {
      this.#resource = { '@id': target }
      preview.innerHTML = '<pre>{Not Resolvable}</pre>'
      this.showNotice('notResolved')
    }
    this.dispatchEvent(new CustomEvent('target-resolved', {
      bubbles: true,
      composed: true,
      detail: { uri: target, resource: this.#resource }
    }))
  }

  #confirm() {
    if (!this.#resource) return
    this.dispatchEvent(new CustomEvent('target-confirmed', {
      bubbles: true,
      composed: true,
      detail: { uri: this.#uri, resource: this.#resource, creator: this.creator }
    }))
  }
}

customElements.define('user-resource', UserResource)
