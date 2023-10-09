#!/usr/bin/env node
/**
 * Template components like headers and footers for reuse across the site.
 * @author cubap@slu.edu
 * 
 * Also components to make shapes on Web Maps and generate data in RERUM
 * @author bryan.j.haberberger@slu.edu
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
        <div id="supplyCreator" class="card">
            <header>
            Supply an existing Web Resource URI.  You also have the option to provide a name or E-mail to serve as the creator of this resource.  Use your own name or E-mail to take ownership of the data created!
            </header>
            <div>
            <label>Name or E-mail (optional)</label><input id="objCreator" type="text" /> 
            </div>

            <div>
                <label>Object URI</label><input id="objURI" type="text" />
            </div>

            <footer>
                <input id="uriBtn" type="button" class="button primary" value="Next" />
            </footer>
        </div>


        <div id="confirmURI" class="card is-hidden notfirst">
            <header>Resolved URI</header>
            <div>
                <input id="confirmUriBtn" type="button" class="button primary" value="Confirm URI" />
                <div id="uriPreview">
                    <pre>Resolving URI...</pre>
                </div>
            </div>
            <footer>

            </footer>
        </div>`

    connectedCallback() {
        this.innerHTML = this.#uriInputTmpl
        localStorage.removeItem("providedURI")
        localStorage.removeItem("userResource")
        uriBtn.addEventListener("click", this.provideTargetID)
        confirmUriBtn.addEventListener("click", this.confirmTarget)
    }

    /**
     * Take the user provided URI and check if can be resolved.
     * If so, preview the object it resolves to.  
     * If not, tell the user and let them choose whether to move forward or not.
     * @param {type} event
     * @return none
     */ 
    async provideTargetID(e){
        if(!objURI.value){
            alert("You must provide something to target.")
            return
        }
        let target = objURI.value
        confirmURI.classList.remove("is-hidden")
        let targetObj = await fetch(target.replace(/^https?:/, location.protocol))
            .then(resp => resp.json())
            .then(obj => {
                // The RERUM property is noisy.  Let's remove it from previews.
                delete obj.__rerum
                obj.creator = objCreator.value? objCreator.value : undefined;
                uriPreview.innerHTML = `<pre>${JSON.stringify(obj, null, '\t')}</pre>`
                localStorage.setItem("userResource", JSON.stringify(obj))
                return obj
            })
            .catch(err => {
                alert("Target URI could not be resolved."
                    + " Certain data previews will not be available."
                    + " Applications that will use the data you are about to create"
                    + " will note be able to gather additional information about this targeted resource."
                    + " You can supply a different URI or continue with this one.")
                uriPreview.innerHTML = `<pre>{Not Resolvable}</pre>`
                localStorage.setItem('userResource', objCreator.value? JSON.stringify({'@id':target, 'creator':objCreator.value}): JSON.stringify({'@id':target}))
                return null
            })
        //This might help mobile views
        //window.scrollTo(0, confirmURI.offsetTop)
    }

    /**
     * Cache the resource the user has confirmed they want to use so it can be used by other app components.
     * @param {type} event
     * @return none
     */
    confirmTarget(event) {
        this.closest('user-resource').setAttribute("data-uri", objURI.value)
        const e = new CustomEvent("userResourceConfirmed", {"detail":objURI.value})
        document.dispatchEvent(e)
    }
}

customElements.define("user-resource", UserResource)

class PointPicker extends HTMLElement {
    #pointPickerTmpl = `
        <div id="coordinatesCard" class="card">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css"
             integrity="sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI="
             crossorigin=""/>
            <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"
             integrity="sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM="
             crossorigin=""></script>
            <header title="Use the map below to pan around.  Click to be given the option to use coordinates, 
                or enter coordinates manually.">
                Use the map to select coordinates. You may also supply coordinates manually.
                <br><input id="confirmCoords" type="button" class="button primary" value="Confirm Coordinates" />
            </header>
            <div class="card-body">
                <div>
                    <label>Latitude</label>
                    <input id="leafLat" step=".000000001" type="number" />
                    <label>Longitude</label>
                    <input id="leafLong" step=".000000001" type="number" />
                </div>
                <div title="Use the map below to pan around.  Click to be given the option to use coordinates, or enter coordinates manually."
                    id="leafletPreview" class="col"></div>
            </div>
            <footer>

            </footer>
        </div>`

    connectedCallback() {
        localStorage.removeItem("geoJSON")
        this.innerHTML = this.#pointPickerTmpl
        leafLat.addEventListener("input", this.updateGeometry)
        leafLong.addEventListener("input", this.updateGeometry)
        confirmCoords.addEventListener("click", this.confirmCoordinates)
        let previewMap = L.map('leafletPreview').setView([12, 12], 2)
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 19,
            id: 'mapbox.satellite', //mapbox.streets
            accessToken: 'pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ'
        }).addTo(previewMap);

        function updateGeometry(event, clickedLat, clickedLong) {
            let lat = clickedLat ? clickedLat : leafLat.value
            lat = parseInt(lat * 1000000) / 1000000
            let long = clickedLong ? clickedLong : leafLong.value
            long = parseInt(long * 1000000) / 1000000
            leafLat.value = lat
            leafLong.value = long
            if(clickedLat || clickedLong){
                event.preventDefault()
                event.stopPropagation()
                event.target.closest(".leaflet-popup").remove()
            }
        }
        
        previewMap.on('click', (e) => {
            previewMap.setView(e.latlng, 16)
            L.popup().setLatLng(e.latlng).setContent(`<div>${e.latlng.toString()}<br><button id="useCoords" class="tag is-small text-primary bd-primary">Use These</button></div>`).openOn(previewMap)
            leafletPreview.querySelector('#useCoords').addEventListener("click", (clickEvent) => {updateGeometry(clickEvent, e.latlng.lat, e.latlng.lng)})
        })
    }

    /**
     * Take the coordinates provided by the user and turn them into GeoJSON
     * @param none
     * @return none
     */
    confirmCoordinates() {
        let lat = parseInt(leafLat.value * 1000000) / 1000000
        let long = parseInt(leafLong.value * 1000000) / 1000000
        let geo = {}
        if (lat && long) {
            geo.type = "Point"
            geo.coordinates = [long, lat]
        }
        else {
            alert("Supply both a latitude and a longitude")
            return false
        }
        let targetURL = document.getElementById('objURI').value
        let geoJSON = {
            "type": "Feature",
            "geometry": geo,
            "properties": {} 
        }
        const e = new CustomEvent("coordinatesConfirmed", {"detail":JSON.stringify(geoJSON)})
        document.dispatchEvent(e)
    }
}

customElements.define("point-picker", PointPicker)

class GeolocatorPreview extends HTMLElement {
    #uriInputTmpl = `
        <div class="card">
            <header>
                Here is your resource preview!  Scroll to review, then click 'Create'.
                <input type="button" class="downloadBtn download-button" style="float: right;" title="Download object as a .json file"/>
            </header>
            
            <div>
                <div class="resourcePreview"> </div>
            </div>

            <footer>
                <input type="button" class="createBtn button primary" value="Create"/>
                <input type="button" class="restartBtn button secondary" value="Start Over" />
            </footer>
        </div>`

    connectedCallback() {
        localStorage.removeItem("newResource")
        this.innerHTML = this.#uriInputTmpl
        this.querySelector(".downloadBtn").addEventListener("click", this.downloadLocally)
        if(this.getAttribute("do-save")){
            this.querySelector(".restartBtn").addEventListener("click", () => document.location.reload())
        }
        else{
            this.querySelector("footer").remove()
        }
    }

    /**
     * When download icon is clicked on the resource preview page, the JSON object is sent to
     * the user's local machine's Downloads folder. It is saved with a filename of 'iiif_resource.json'.
     * @return none
     */
    downloadLocally(event) {
        const objectToSave = localStorage.getItem("newResource")
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(objectToSave));
        element.setAttribute('download', 'iiif_resource.json');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
    

    /**
     * The trigger which lets this element know which type of data is ready for preview
     * @param none
     * @return {Array The names of the attributes to observe}
     */ 
    static get observedAttributes() { return ['resource-type'] }

    /**
     * The resource-type changed, letting the element know what kind of data is ready for preview
     * The geoJSON and userResource must be set, or this cannot build a preview.
     * @param {String} name The name of the attribute that has changed
     * @param {String} oldValue The original value of the attribute
     * @param {String} newValue The new value of the attribute
     * @return none
     * */
    attributeChangedCallback(name, oldValue, newValue) {
        if(oldValue === newValue) return

        const userObj = JSON.parse(localStorage.getItem("userResource"))
        const geo = JSON.parse(localStorage.getItem("geoJSON"))
        if(!geo || !userObj) return

        let wrapper
        switch(newValue){
            case "Annotation":
                this.querySelector(".createBtn").addEventListener("click", this.saveResource)
                wrapper = {
                    "@context": ["http://www.w3.org/ns/anno.jsonld", "https://geojson.org/geojson-ld/geojson-context.jsonld"],
                    "type": "Annotation",
                    "creator": userObj.creator,
                    "motivation": "tagging",
                    "body": geo,
                    "target": userObj["@id"] ?? userObj.id ?? ""  
                }
            break
            case "navPlace":
                this.querySelector(".createBtn").addEventListener("click", this.importResource)
                let context = userObj["@context"]
                context = Array.isArray(context) ? 
                context.unshift("https://iiif.io/api/extension/navplace/context.json") :
                ["https://iiif.io/api/extension/navplace/context.json", userObj["@context"]]
                const fc = {
                    "type" : "FeatureCollection",
                    "features" : [geo]
                }
                userObj["@context"] = context
                userObj.navPlace = fc
                wrapper = JSON.parse(JSON.stringify(userObj))
                
            break
            default: 
                this.querySelector(".createBtn").addClass("is-hidden")
                wrapper = JSON.parse(JSON.stringify(userObj))
        }
        this.querySelector(".resourcePreview").innerHTML = `<pre>${JSON.stringify(wrapper, null, '\t')}</pre>`
        localStorage.setItem("newResource", JSON.stringify(wrapper, undefined, 4))
        // Typically when this has happened the preview is ready to be seen.
        // It may be better to let a front end handle whether they want to show this preview or not by dispatching an event.
        if(Array.from(this.classList).includes("is-hidden")){
            this.classList.remove("is-hidden")
        }
    }

    /**
     * Import the resource the user has generated so it can persist and be used elsewhere.
     * This is an existing IIIF Defined Type which has had the navPlace property added.
     * This requires a RERUM Import. 
     * @param {Event} event
     * @return none
     */
    importResource(event) {
        const resourceToSave = JSON.parse(localStorage.getItem("newResource"))
        const id = resourceToSave["@id"] ?? resourceToSave.id
        if(!id){
            alert("This object must contain 'id' or '@id' in order to continue.")
            return
        }
        fetch("update", {
            method: "PUT",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: localStorage.getItem("newResource")
        })
        .then(response => response.json())
        .then(newObj => {
            delete newObj.new_obj_state
            localStorage.setItem("newResource", JSON.stringify(newObj))
            const e = new CustomEvent("newResourceCreated", {"detail":JSON.stringify(newObj)})
            document.dispatchEvent(e)
            return newObj
        })
        .catch(err => {return null})
    }

    /**
     * Save the Web Annotation the user has generated so it can persist and be used elsewhere.
     * @param {Event} event
     * @return none
     */
    saveResource(event) {
        const resourceToSave = JSON.parse(localStorage.getItem("newResource"))
        const id = resourceToSave["@id"] ?? resourceToSave.id
        if(id){
            //You already did this and you have the Annotation URI!
            alert(`This Annotation already exists!  See ${id}`)
            return
        }
        fetch("create", {
            method: "POST",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: localStorage.getItem("newResource")
        })
        .then(response => response.json())
        .then(newObj => {
            delete newObj.new_obj_state
            localStorage.setItem("newResource", JSON.stringify(newObj))
            const e = new CustomEvent("newResourceCreated", {"detail":JSON.stringify(newObj)})
            document.dispatchEvent(e)
            return newObj
        })
        .catch(err => {return null})
    }
}

customElements.define("geolocator-preview", GeolocatorPreview)
