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
        const navbar = document.createElement('geo-nav')
        const footer = document.createElement('geo-footer')
        this.prepend(header)
        this.append(navbar)
        this.append(footer)
    }
}

customElements.define("geo-page",GeoPage, {extends:"body"})

class GeoHeader extends HTMLElement {
    #headerTmpl = `
    <link rel="stylesheet" href="https://unpkg.com/chota@latest">
    <link rel="stylesheet" href="stylesheets/style.css">
    <header>
    <div class="row" style="display: flex; justify-content: flex-start;">
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

class GeoNav extends HTMLElement {
    #navTmpl = `
    <link rel="stylesheet" href="https://unpkg.com/chota@latest">
    <link rel="stylesheet" href="stylesheets/style.css">

    <nav class="nav-center" style="justify-content: center; position: relative;"}>
        <a style="margin: 0 10px;" class="active" href="index.html"> Home </a>
        <a style="margin: 0 10px;" class="active" href="about.html"> About Geolocator </a>
        <a style="margin: 0 10px;" class="active" href="moreLinks.html"> Additional Links </a>
        <a style="margin: 0 10px;" class="active" href="helpVideo.html"> Tutorial </a>
    </nav>
    `
    constructor(){
        super()
        this.attachShadow({mode:'open'})
        this.shadowRoot.innerHTML = this.#navTmpl
    }
}

customElements.define("geo-nav",GeoNav)

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
	    <a target="_blank" href="https://github.com/CenterForDigitalHumanities/geolocator.git"><img width="30" height="30" alt="Git logo" src="./github.svg">
        <small>&nbsp;&nbsp;Support/Contribute to Geolocator</small></a>
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
                <div class="popup"> Supply an existing Web Resource URI.  You also have the option to provide a name or E-mail to serve as the creator of this resource.  Use your own name or E-mail to take ownership of the data created!
                    <span class="popuptext" id="notResolvedMessage">
                        <button id="notResolvedBtn" class="close-button"><strong>x</strong></button>
                        <strong>Target URI could not be resolved.</strong> <br>Certain data previews will not be available. Applications that will use the data you are about to create will not be able to gather additional information about this targeted resource. You can supply a different URI or continue with this one.
                    </span>
                    <span class="popuptext" id="outdatedIIIFmessage">
                        <button id="IIIFbtn" class="close-button"><strong>x</strong></button>
                        The object provided must contain the IIIF Presentation API 3.0 (or later) context.json. Provide a different URI or click 'Confirm URI' to add this context and continue.
                    </span>
                    <span class="popuptext" id="navPlaceMessage">
                        <button id="navPlaceBtn" class="close-button"><strong>x</strong></button>
                        The object provided already contains 'navPlace'. Provide a different URI or click 'Confirm URI' to drop the existing 'navPlace' and continue.
                    </span>
                </div>
            </header>
            <div>
            <label>Name or E-mail (optional)</label><input id="objCreator" type="text" /> 
            </div>

            <div>
                <label>Object URI</label><input id="objURI" type="text" />
            </div>

            <footer>
                <p id="noTargetMessage" class="is-hidden" style="color: red"> <strong>You must provide something to target. </strong></p>
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
        notResolvedBtn.addEventListener("click", ()=>this.closePopup("notResolvedMessage"))
        IIIFbtn.addEventListener("click", ()=>this.closePopup("outdatedIIIFmessage"))
        navPlaceBtn.addEventListener("click", ()=>this.closePopup("navPlaceMessage"))
        uriBtn.addEventListener("click", this.provideTargetID.bind(this))
        confirmUriBtn.addEventListener("click", this.confirmTarget.bind(this))
    }

    closePopup(popupId) {
        document.getElementById(popupId).classList.remove('show')
    }

    /**
     * Take the user provided URI and check if can be resolved.
     * If so, preview the object it resolves to.  
     * If not, tell the user and let them choose whether to move forward or not.
     * @param {type} event
     * @return none
     */ 
    async provideTargetID(e){
        noTargetMessage.classList.add("is-hidden")
        document.getElementById("notResolvedMessage").classList.remove("show")
        document.getElementById("outdatedIIIFmessage").classList.remove("show")
        document.getElementById("navPlaceMessage").classList.remove("show")
        if(!objURI.value){
            confirmURI.classList.add("is-hidden")
            noTargetMessage.classList.remove("is-hidden")
            return
        }
        let target = objURI.value
        let targetObj = await fetch(target.replace(/^https?:/, location.protocol))
            .then(resp => resp.json())
            .then(obj => {
                // The RERUM property is noisy.  Let's remove it from previews.
                delete obj.__rerum
                obj.creator = objCreator.value? objCreator.value : undefined
                uriPreview.innerHTML = `<pre>${jsonFormatHighlight((JSON.stringify(obj, null, '\t')))}</pre>`
                localStorage.setItem("userResource", JSON.stringify(obj))
                return obj
            })
            .catch(err => {
                document.getElementById("notResolvedMessage").classList.toggle("show")
                uriPreview.innerHTML = `<pre>{Not Resolvable}</pre>`
                localStorage.setItem('userResource', objCreator.value? JSON.stringify({'@id':target, 'creator':objCreator.value}): JSON.stringify({'@id':target}))
                return null
            })
        confirmURI.classList.remove("is-hidden")
        if (targetObj) {
            const e = new CustomEvent("validateContext", {"detail":targetObj})
            document.dispatchEvent(e)
        }
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
            <header title="Use the map below to pan around">
                Use the map to draw a geometry. Finalize any shape by double clicking the final point. Subsequent clicks will clear any previous selections.
                <br><input disabled id="confirmCoords" type="button" class="button primary" value="See Preview" />
            </header>
            <div class="card-body">
                <div class="row">
                    <button class="geometry-type-button" style="background-image: url('https://www.svgrepo.com/show/532539/location-pin.svg?size=24') "id="pointBtn" title="Click on the desired location to place a point marker."> </button>
                    <button class="geometry-type-button" style="background-image: url('https://www.svgrepo.com/show/399231/polyline-pt.svg?size=24');" id="polylineBtn" title="Click to add points connected by line segments."> </button>
                    <button class="geometry-type-button" style="background-image: url('https://www.svgrepo.com/show/399227/polygon-pt.svg?size=24');" id="polygonBtn" title="Click to add vertices. Can click the first vertex to finish the shape."> </button>
                    <div style="margin-left: 20px;"></div>
                    <button class="geometry-type-button" style="background-image: url('https://www.svgrepo.com/show/274180/garbage-basket.svg?size=24');" id="clearBtn" title="Clear the map of all selections. Alternatively, click any of the geometry type buttons."> </button>
                </div>

                <div title="Use the map below to pan around.  Click to be given the option to use coordinates, or enter coordinates manually."
                    id="leafletPreview" class="col"></div>
            </div>
            <footer>

            </footer>
        </div>`

    pointList = []
    marker
    markerGroup
    previewMap
    isCompleteShape = false

    leafletIcon = L.icon({
        iconUrl: 'marker-icon.png',
        iconSize: [10, 10]
    })

    connectedCallback() {
        localStorage.removeItem("geoJSON")
        this.innerHTML = this.#pointPickerTmpl
        confirmCoords.addEventListener("click", this.confirmCoordinates)
        this.previewMap = L.map('leafletPreview').setView([12, 12], 2)
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 19,
            id: 'mapbox.satellite', //mapbox.streets
            accessToken: 'pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ'
        }).addTo(this.previewMap)

        this.markerGroup = L.layerGroup().addTo(this.previewMap)
        this.chooseGeometry("Point")

        pointBtn.addEventListener("click", () => {this.chooseGeometry('Point')})
        polylineBtn.addEventListener("click", () => {this.chooseGeometry('LineString')})
        polygonBtn.addEventListener("click", () => {this.chooseGeometry('Polygon')})
        clearBtn.addEventListener("click", () => {this.clearMapData()})
        
        this.previewMap.on('click', (e) => {
            if (this.isCompleteShape) { this.clearMapData() }
            this.isCompleteShape = false
            let storedGeomType = localStorage.getItem("geometryType")
            document.getElementById("confirmCoords").disabled = false
            
            let previouslySelectedCoords = localStorage.getItem('coordinates')
            previouslySelectedCoords = previouslySelectedCoords ? JSON.parse(previouslySelectedCoords) : []
            if (storedGeomType === "Point"){
                previouslySelectedCoords = [] //clear any previously selected points
            }
            previouslySelectedCoords.push(e.latlng.lng)
            previouslySelectedCoords.push(e.latlng.lat)

            this.marker = L.marker(e.latlng, {icon: this.leafletIcon})

            if (storedGeomType === "Point") {
                this.markerGroup.clearLayers()
                this.markerGroup.addLayer(this.marker)
            }
            else if(storedGeomType === "LineString"){
                this.clearMapLayers()
                this.pointList.push(e.latlng)
                this.markerGroup.addLayer(this.marker)
                L.polyline(this.pointList, {color: 'orange'}).addTo(this.previewMap)
            }
            else if(storedGeomType === "Polygon"){
                const currentZoomLevel = this.previewMap.getZoom()
                this.clearMapLayers()
                if (this.pointList.length > 0 && this.isCloseToPoint(e.latlng, this.pointList[0], currentZoomLevel)) {
                    this.isCompleteShape = true
                    previouslySelectedCoords.pop()
                    previouslySelectedCoords.pop()
                    this.pointList.push(this.pointList[0])
                    L.polygon(this.pointList, {color: 'lime'}).addTo(this.previewMap)
                }
                else {
                    this.pointList.push(e.latlng)
                    this.markerGroup.addLayer(this.marker)
                    L.polyline(this.pointList, {color: 'orange'}).addTo(this.previewMap)
                }
            }
            localStorage.setItem('coordinates', JSON.stringify(previouslySelectedCoords))
        })

        this.previewMap.on('dblclick', (e) => {
            this.isCompleteShape = true
            let storedGeomType = localStorage.getItem("geometryType")
            let previouslySelectedCoords = localStorage.getItem('coordinates')
            previouslySelectedCoords = previouslySelectedCoords ? JSON.parse(previouslySelectedCoords) : []
            previouslySelectedCoords.pop()
            previouslySelectedCoords.pop()
            this.pointList.pop()
            if (storedGeomType === "LineString") {
                this.clearMapLayers()
                this.pointList.push(e.latlng)
                L.polyline(this.pointList, {color: 'lime'}).addTo(this.previewMap) 
            }
            else if (storedGeomType === "Polygon") {
                if (this.pointList.length > 1) {
                    this.pointList.push(this.pointList[0])
                }
                L.polygon(this.pointList, {color: 'lime'}).addTo(this.previewMap)
            }
            localStorage.setItem('coordinates', JSON.stringify(previouslySelectedCoords))
        })
    }

    /**
     * Compares the distance between two points to determine if they are close enough to be considered the same point.
     * Used when creating polygons: users can click (within a margin of Error) the first point to close and complete the shape.
     * @param {JSON} newPoint object with lat and long keys. Newest point for comparison with firstPoint 
     * @param {JSON} firstPoint object with lat and long keys. Compared to newPoint for comparing distance
     * @param {Number} currentZoomLevel current zoom level of previewMap. Included in marginOfError calculation
     * @return {None}
     */
    isCloseToPoint(newPoint, firstPoint, currentZoomLevel){
        currentZoomLevel = currentZoomLevel + 1 // Avoid division by zero if zoomed all the way out
        let marginOfError = 0
        if (currentZoomLevel <= 8) { marginOfError = 2.95 * Math.exp(-0.438*currentZoomLevel) }
        else if (currentZoomLevel <= 14) { marginOfError = 18.1 * Math.exp(-0.675*currentZoomLevel)}
        else if (currentZoomLevel <= 20) { marginOfError = 16.4 * Math.exp(-0.693*currentZoomLevel)}
        const isClose = (Math.abs(newPoint.lat - firstPoint.lat) < marginOfError) && (Math.abs(newPoint.lng - firstPoint.lng) < marginOfError)
        return isClose
    }

    /**
     * chooseGeometry is called when the user clicks on geometry type button.
     * Serves to disable the Confirm button until new coords are selected and to clear the previous selected coordinates and shapes
     * @param {String} geomType A string indicated the geometry type selected by the user 
     * @returns {None} 
    */
    chooseGeometry(geomType) {
        localStorage.setItem("geometryType", geomType)
        this.highlightGeomType(geomType)
        this.clearMapData()
    }

    /**
     * Deletes any associated data with the previous shapes.
     * @returns {None}
     */
    clearMapData() {
        document.getElementById("confirmCoords").disabled = true
        localStorage.removeItem('coordinates')
        this.pointList = []
        this.markerGroup.clearLayers()
        this.clearMapLayers()
    }

    /**
     * Clears all previously drawn shapes on the preview map.
     * @returns {None}
     */
    clearMapLayers() {
        const layerTypes = {
            "LineString": L.Polyline,
            "Polygon": L.Polygon
        }
        
        this.previewMap.eachLayer(layer => {
            for (const geomType in layerTypes) {
                if (layer instanceof layerTypes[geomType]) {
                    this.previewMap.removeLayer(layer)
                    break
                }
            }
        })
    }

    /**
     * Highlights the geometry type selected by the user
     * @param {String} newGeomChoice A string indicated the geometry type selected by the user 
     * @returns {None} 
    */
    highlightGeomType(newGeomChoice) {
        if (newGeomChoice === "Point") {
            pointBtn.style.border = "3px solid black"
            polygonBtn.style.border = "0px solid black"
            polylineBtn.style.border = "0px solid black"
        } else if (newGeomChoice === "LineString") {
            pointBtn.style.border = "0px solid black"
            polygonBtn.style.border = "0px solid black"
            polylineBtn.style.border = "3px solid black"
        } else if (newGeomChoice === "Polygon") {
            pointBtn.style.border = "0px solid black"
            polygonBtn.style.border = "3px solid black"
            polylineBtn.style.border = "0px solid black"
        }
    }

    /**
     * Take the coordinates provided by the user and turn them into GeoJSON
     * @param {none}
     * @return {none}
     */
    confirmCoordinates() {
        let geo = {}
        const geometry_type = localStorage.getItem('geometryType') ?? 'Point'
        const coords = JSON.parse(localStorage.getItem('coordinates'))
        geo.type = geometry_type
        geo.coordinates = []
        for (let index = 0; index < coords.length; index += 2) {
            let long = parseInt(coords[index] * 1000000) / 1000000
            let lat = parseInt(coords[index+1] * 1000000) / 1000000
            geo.coordinates.push([long, lat])
        }
        switch(geometry_type){
            case 'Point':
                geo.coordinates = geo.coordinates[0]
                break
            case 'LineString':
                break //coordinates are already in correct form for LineString 
            case 'Polygon':
                geo.coordinates = [[...geo.coordinates, ...[geo.coordinates[0]]]]
                break
            default:
                geo.coordinates = geo.coordinates[0]
                break
        }
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
        var element = document.createElement('a')
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(objectToSave))
        element.setAttribute('download', 'iiif_resource.json')
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
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

        function createNewContext(context, uri){
            /* Create new context by updating context param with uri1. */
            let uri_index = 0
            if (context == null) {
                context = []
            } else if (!Array.isArray(context)) {
                context = [context]
            }
            //find if context contains variation of uri
            if (!(context.includes("http"+uri) || context.includes("https"+uri))) {
                uri = "http"+uri
                context = context.concat([uri])
                uri_index = context.length -1
            } else {
                const index1 = context.indexOf("http"+uri)
                const index2 = context.indexOf("https"+uri)
                uri_index = Math.max(index1, index2) //get whichever variation is present
                uri = context[uri_index]
            }
            return [context, uri]
        }

        function switchPositions(context, uri1, uri2) {
            /* Switch the positions of uri1 and uri2 if uri1 comes after uri2 in the context. */ 
            const uri1_Index = context.indexOf(uri1)
            const uri2_Index = context.indexOf(uri2)
            if (uri1_Index > uri2_Index) {
                context[uri1_Index] = uri2
                context[uri2_Index] = uri1
            }             
            return context
        }

        let wrapper
        switch(newValue){
            case "Annotation":
                this.querySelector(".createBtn").addEventListener("click", this.saveResource)
                let a_context = userObj["@context"]
                let w3URI = "://www.w3.org/ns/anno.jsonld"
                let geoURI = "://geojson.org/geojson-ld/geojson-context.jsonld"
                let [a_contextUpdated, w3URIupdated] = createNewContext(a_context, w3URI) 
                a_context = a_contextUpdated
                let [a_contextUpdate, geoURIupdated] = createNewContext(a_context, geoURI)
                a_context = a_contextUpdate
                a_context = switchPositions(a_context, w3URIupdated, geoURIupdated) //switch position of w3 and geo if w3 comes after geo - for consistency   
                wrapper = {
                    "@context": a_context,
                    "type": "Annotation",
                    "creator": userObj.creator,
                    "motivation": "tagging",
                    "body": geo,
                    "target": userObj["@id"] ?? userObj.id ?? ""  
                }
            break
            case "navPlace":
                this.querySelector(".createBtn").addEventListener("click", this.importResource)
                let n_context = userObj["@context"]
                let navPlaceURI = "://iiif.io/api/extension/navplace/context.json"
                let APIuri = "://iiif.io/api/presentation/3/context.json"
                let [n_contextUpdated, navPlaceURIupdated] = createNewContext(n_context, navPlaceURI)
                n_context = n_contextUpdated
                let [n_contextUpdate, APIuriUpdated] = createNewContext(n_context, APIuri)
                n_context = n_contextUpdate
                n_context = switchPositions(n_context, navPlaceURIupdated, APIuriUpdated) //switch position of nav and api if nav comes after api - for consistency
                n_context = n_context.filter(url => url !== "http://iiif.io/api/presentation/2/context.json") //remove api/2 URI if present
                const fc = {
                    "type" : "FeatureCollection",
                    "features" : [geo]
                }
                userObj["@context"] = n_context
                userObj.navPlace = fc
                wrapper = JSON.parse(JSON.stringify(userObj))
                
            break
            default: 
                this.querySelector(".createBtn").addClass("is-hidden")
                wrapper = JSON.parse(JSON.stringify(userObj))
        }
        this.querySelector(".resourcePreview").innerHTML = `<pre>${jsonFormatHighlight((JSON.stringify(wrapper, null, '\t')))}</pre>`
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
