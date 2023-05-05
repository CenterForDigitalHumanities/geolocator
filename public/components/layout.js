/**
 * Template components like headers and footers for reuse across the site.
 * @author cubap@slu.edu
 */

class GeoPage extends HTMLBodyElement {
    constructor(){
        super()
        const header = document.createElement('geo-header')
        const footer = document.createElement('geo-footer')
        this.prepend(header)
        this.append(footer)
    }
}

customElements.define("geo-page",GeoPage, {extends:"body"})

class GeoHeader extends HTMLElement {
    #headerTmpl = `
    <link rel="stylesheet" href="https://unpkg.com/chota@latest">
    <link rel="stylesheet" href="stylesheets/style.css">
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
        super()        
        this.attachShadow({mode:'open'})
        this.shadowRoot.innerHTML = this.#headerTmpl
    }
}

customElements.define("geo-header",GeoHeader)

class GeoFooter extends HTMLElement {
    #footerTmpl = `
    <link rel="stylesheet" href="https://unpkg.com/chota@latest">
    <link rel="stylesheet" href="stylesheets/style.css">
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


class UserResource extends HTMLElement {
    #uriInputTmpl = `
        <div id="supplyURI" class="card">
            <header>
                Supply an existing Web Resource URI to assert coordinates upon to begin.
                We encourage that your provide your favorite IIIF object that contains a label and/or description.
            </header>
            <div>
                <label>Object URI</label><input id="objURI" type="text" />
            </div>
            <footer>
                <input id="uriBtn" type="button" class="button primary" value="Use This URI" />
            </footer>
        </div>

        <div id="confirmURI" class="card is-hidden notfirst">
            <header>Resolved URI</header>
            <div>
                <input id="confirmUriBtn" type="button" class="button primary" value="Confirm URI" />
                <div id="uriPreview">

                </div>
            </div>
            <footer>

            </footer>
        </div>`

    connectedCallback() {
        this.innerHTML = this.#uriInputTmpl
        uriBtn.addEventListener("click", this.provideTargetID)
        confirmUriBtn.addEventListener("click", this.confirmTarget)
    }

    async provideTargetID(e){
        let target = objURI.value
        let targetObj = await fetch(target.replace(/^https?:/, location.protocol))
            .then(resp => resp.json())
            .catch(err => {
                alert("Target URI could not be resolved.  The annotation can still be created"
                    + " and target the URI provided.  Interfaces that consume this data will not be able to"
                    + " gather additional information about this targeted resource."
                    + " Supply a different URI to try again.")
                uriPreview.innerHTML = `<pre>{Not Resolvable}</pre>`
                return null
            })
        if (targetObj) {
            uriPreview.innerHTML = `<pre>${JSON.stringify(targetObj, null, '\t')}</pre>`
        }
        confirmURI.classList.remove("is-hidden")
        window.scrollTo(0, confirmURI.offsetTop)
    }

    /**
     * Trigger the part of the UI after the user has confirmed their targer
     * @param {type} event
     * @return {undefined}
     */
    confirmTarget(event) {
        supplyURI.classList.add("is-hidden")
        confirmURI.classList.add("is-hidden")
        this.closest('user-resource').setAttribute("data-uri", objURI.value)
    }
}

customElements.define("user-resource", UserResource)
