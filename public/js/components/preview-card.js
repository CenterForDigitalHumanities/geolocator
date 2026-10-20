/*
 * <preview-card> — step 3: review the finished resource, then persist it.
 *
 * Set the `resource` property to the object built by iiif.js
 * (buildAnnotation / buildNavPlace) and the `mode` property to 'annotation'
 * or 'navPlace'.  Download works in every mode; Create POSTs a new annotation,
 * Import PUTs the navPlace into the existing resource's id.  Emits
 * `resource-created` with the stored object and `start-over`.
 */

import { jsonPreview } from '../utils.js'
import * as store from '../store.js'

const TEMPLATE = `
  <div class="card">
    <header>
      Here is your resource preview!  Scroll to review, then click 'Create'.
      <input data-el="downloadBtn" type="button" class="download-button" style="float: right;"
        title="Download object as a .json file" value="Download" />
    </header>
    <div>
      <p data-el="message" class="is-hidden" style="color: red"></p>
      <div data-el="preview" class="resourcePreview"></div>
    </div>
    <footer>
      <input data-el="saveBtn" type="button" class="button primary" />
      <input data-el="restartBtn" type="button" class="button secondary" value="Start Over" />
    </footer>
  </div>
`

export class PreviewCard extends HTMLElement {
  #resource = null
  #mode = 'annotation'

  constructor() {
    super()
    this.innerHTML = TEMPLATE
    this.querySelector('[data-el="downloadBtn"]').addEventListener('click', () => this.download())
    this.querySelector('[data-el="saveBtn"]').addEventListener('click', () => this.save())
    this.querySelector('[data-el="restartBtn"]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('start-over', { bubbles: true, composed: true }))
    })
  }

  set resource(obj) {
    this.#resource = obj
    this.querySelector('[data-el="preview"]').innerHTML = `<pre>${jsonPreview(obj)}</pre>`
  }

  get resource() {
    return this.#resource
  }

  set mode(mode) {
    this.#mode = mode
    this.querySelector('[data-el="saveBtn"]').value = mode === 'navPlace' ? 'Import' : 'Create'
  }

  get mode() {
    return this.#mode
  }

  showMessage(text) {
    const el = this.querySelector('[data-el="message"]')
    el.textContent = text
    el.classList.remove('is-hidden')
  }

  clearMessage() {
    const el = this.querySelector('[data-el="message"]')
    el.textContent = ''
    el.classList.add('is-hidden')
  }

  /** Save the previewed object to the user's machine as iiif_resource.json. */
  download() {
    if (!this.#resource) return
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(this.#resource, undefined, 4)))
    element.setAttribute('download', 'iiif_resource.json')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  async save() {
    if (!this.#resource) return
    this.clearMessage()
    const id = this.#resource['@id'] ?? this.#resource.id
    try {
      let stored
      if (this.#mode === 'navPlace') {
        if (!id) {
          this.showMessage("This object must contain 'id' or '@id' in order to continue.")
          return
        }
        stored = await store.updateResource(this.#resource)
      } else {
        if (id) {
          this.showMessage(`This Annotation already exists!  See ${id}`)
          return
        }
        stored = await store.createResource(this.#resource)
      }
      delete stored.new_obj_state
      this.#resource = stored
      this.querySelector('[data-el="preview"]').innerHTML = `<pre>${jsonPreview(stored)}</pre>`
      this.dispatchEvent(new CustomEvent('resource-created', {
        bubbles: true,
        composed: true,
        detail: { resource: stored, mode: this.#mode }
      }))
    } catch (err) {
      this.showMessage(`Could not save the resource: ${err.message ?? err}`)
    }
  }
}

customElements.define('preview-card', PreviewCard)
