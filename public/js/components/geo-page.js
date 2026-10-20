/*
 * <geo-page> — site chrome (header, nav, footer) wrapped around page content.
 * A plain custom element; no `is=` built-in extension, which has spotty
 * support in Safari.  Light DOM so chota and style.css apply directly.
 */

const HEADER = `
  <header>
    <div class="row" style="display: flex; justify-content: flex-start;">
      <div>
        <img src="https://centerfordigitalhumanities.github.io/rerum/logo.png" alt="RERUM logo">
      </div>
      <small class="rerum_shimmer">reconditorium eximium rerum universalium mutabiliumque</small>
      <h1>rerum geolocator</h1>
    </div>
  </header>
`

const FOOTER = `
  <footer class="nav nav-center text-primary is-fixed is-full-width is-vertical-align">
    <a target="_blank"
      href="https://www.slu.edu/research/faculty-resources/research-computing.php"><small>&copy;2022-2026 Research
      Computing Group</small></a>
    <a target="_blank" href="https://slu.edu"><img class="brand" alt="SLU logo"
      src="https://www.slu.edu/marcom/tools-downloads/imgs/logo/left-aligned/slu_logoleftaligned_rgb.png"></a>
    <a target="_blank" href="https://www.slu.edu/arts-and-sciences/ong-center/"><img class="brand"
      alt="SLU RCG logo" src="https://centerfordigitalhumanities.github.io/media-assets/logos/rcg-logo.png"></a>
    <a target="_blank" href="http://rerum.io"><img class="brand" alt="Rerum logo"
      src="https://centerfordigitalhumanities.github.io/blog/assets/images/rerum.jpg"><small>RERUM
      v1</small></a>
    <a target="_blank" href="https://github.com/CenterForDigitalHumanities/geolocator"><img width="30" height="30"
      alt="Git logo" src="/github.svg"><small>&nbsp;&nbsp;Support/Contribute to Geolocator</small></a>
  </footer>
`

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about.html', label: 'About Geolocator' },
  { href: '/moreLinks.html', label: 'Additional Links' },
  { href: '/helpVideo.html', label: 'Tutorial' }
]

export function navTemplate(pathname) {
  const links = LINKS.map((l) => {
    const active = l.href === '/'
      ? pathname === '/' || pathname.endsWith('/index.html')
      : pathname.endsWith(l.href)
    return `<a style="margin: 0 10px;" class="${active ? 'active' : ''}" href="${l.href}">${l.label}</a>`
  }).join('\n')
  return `
  <nav class="nav-center" style="justify-content: center; position: relative;">
    ${links}
  </nav>
`
}

class GeoPage extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return
    this.dataset.rendered = 'true'
    // No <slot> here: slots only work in shadow DOM.  Move the page's own
    // children into the container between header and footer instead.
    const content = [...this.childNodes]
    this.innerHTML = HEADER
    const container = document.createElement('div')
    container.className = 'container'
    content.forEach((node) => container.appendChild(node))
    this.appendChild(container)
    this.insertAdjacentHTML('beforeend', navTemplate(window.location.pathname) + FOOTER)
  }
}

customElements.define('geo-page', GeoPage)
