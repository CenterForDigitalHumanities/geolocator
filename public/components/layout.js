/**
 * Template components like headers and footers for reuse across the site.
 * @author cubap@slu.edu
 */

class GeoPage extends HTMLBodyElement {
    constructor(){
        const header = document.createElement('geo-header')
        const footer = document.createElement('geo-footer')
        this.prepend(header)
        this.append(footer)
    }
}

customElements.define("geo-page",GeoPage, {extends:"body"})

class GeoHeader extends HTMLElement {
    #headerTmpl = `
    <header>
    <div class="row">
        <div>
            <img src="https://centerfordigitalhumanities.github.io/rerum/logo.png" alt="logo">
        </div>
        <small class="rerum_shimmer">reconditorium eximium rerum universalium mutabiliumque</small>
        <h1>
            rerum geolocator
        </h1>
    </div>
    </header>
`
    constructor(){

    }
}

customElements.define("geo-header",GeoHeader)

class GeoFooter extends HTMLElement {
    #footerTmpl = `
    <footer class="nav nav-center text-primary is-fixed is-full-width is-vertical-align">
        <a target="_blank"
            href="https://www.slu.edu/research/faculty-resources/research-computing.php"><small>&copy;2022 Research
                Computing Group</small></a>
        <a target="_blank" href="https://slu.edu"><img class="brand" alt="SLU logo"
                src="https://www.slu.edu/marcom/tools-downloads/imgs/logo/left-aligned/slu_logoleftaligned_rgb.png"></a>
        <a target="_blank" href="https://www.slu.edu/arts-and-sciences/ong-center/"><img class="brand"
                alt="SLU RCG logo"
                src="https://centerfordigitalhumanities.github.io/media-assets/logos/rcg-logo.png"></a>
        <a target="_blank" href="http://rerum.io"><img class="brand" alt="Rerum logo"
                src="https://centerfordigitalhumanities.github.io/blog/assets/images/rerum.jpg"><small>RERUM
                v1</small></a>
    </footer>`
    constructor(){
        super()
        this.attachShadow({mode:'open'})
        this.shadowRoot.innerHTML = this.#footerTmpl
    }
}

customElements.define("geo-footer",GeoFooter)
