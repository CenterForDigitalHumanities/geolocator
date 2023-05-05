/**
 * Initialize a map for a user to select coordinates on.  Have it update and Lat and Long are provided.
 * @type type
 */
function init(){
    var previewMap = L.map('leafletPreview').setView([12, 12], 2)
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 19,
        id: 'mapbox.satellite', //mapbox.streets
        accessToken: 'pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ'
    }).addTo(previewMap);

    leafLat.oninput = updateGeometry
    leafLong.oninput = updateGeometry
    function updateGeometry(event, clickedLat, clickedLong) {
        event.preventDefault()
        let lat = clickedLat ? clickedLat : leafLat.value
        lat = parseInt(lat * 1000000) / 1000000
        let long = clickedLong ? clickedLong : leafLong.value
        long = parseInt(long * 1000000) / 1000000
        if (lat && long) {
            previewMap.setView([lat, long], 16)
        }
        leafLat.value = lat
        leafLong.value = long
    }
    previewMap.on('click', e => L.popup().setLatLng(e.latlng).setContent(`<div>${e.latlng.toString()}<br><button class="tag is-small text-primary bd-primary" onclick="updateGeometry(event,${e.latlng.lat},${e.latlng.lng});">Use These</button></div>`).openOn(previewMap))
}


/**
 * Get a URI from the UI and check if it is resolvable.  Provide feedback
 */
async function provideTargetID(event) {
    let target = document.getElementById('objURI').value

    let targetObj = await fetch(target.replace(/^https?:/, location.protocol))
        .then(resp => resp.json())
        .catch(err => {
            alert("Target URI could not be resolved.  The annotation can still be created"
                + " and target the URI provided.  Interfaces that consume this data will not be able to"
                + " gather additional information about this targeted resource."
                + " Supply a different URI to try again.")
            URIpreview.innerHTML = `<pre>{Not Resolvable}</pre>`
            return null
        })
    if (targetObj) {
        URIpreview.innerHTML = `<pre>${JSON.stringify(targetObj, null, '\t')}</pre>`
    }
    confirmURI.classList.remove("is-hidden")
    window.scrollTo(0, confirmURI.offsetTop)
}

/**
 * Given all the information to create an annotation, offer the preview of it in the UI before submission.
 */
function previewAnnotation(event) {
    let geo = {}
    let lat = parseInt(leafLat.value * 1000000) / 1000000
    let long = parseInt(leafLong.value * 1000000) / 1000000
    if (lat && long) {
        geo = {
            type: "Point",
            coordinates: [long, lat]
        }
    }
    else {
        alert("Supply both a latitude and a longitude")
        return false
    }
    if (leafLat.value && leafLong.value) {
        let targetURL = document.getElementById('objURI').value
        let geoJSON = {
            "properties": {},
            "geometry": geo,
            "type": "Feature"
        }
        let demoAnno =
        {
            "@context": ["http://geojson.org/geojson-ld/geojson-context.jsonld", "http://iiif.io/api/presentation/3/context.json"],
            "type": "Annotation",
            "motivation": "tagging",
            "body": geoJSON,
            "target": targetURL,
            "creator": "geolocating@rerum.io"
        }
        createAnnotation.classList.remove("is-hidden")
        annoPreview.innerHTML = `<pre>${JSON.stringify(demoAnno, null, '\t')}</pre>`
        coordinatesCard.style.visibility = "hidden"
        coordinatesCard.classList.add("is-hidden")
        window.scrollTo(0, createAnnotation.offsetTop - 5)
    }
    else {
        alert("You must provide a latitude and a longitude to continue")
    }
}

/**
 * Trigger the part of the UI after the user has confirmed their targer
 * @param {type} event
 * @return {undefined}
 */
function confirmTarget(event) {
    supplyURI.classList.add("is-hidden")
    confirmURI.classList.add("is-hidden")
    coordinatesCard.style.visibility = "visible"
    coordinatesCard.classList.remove("is-hidden")
    coordinatesCard.style.top = "auto"
    coordinatesCard.style.position = "relative"
    window.scrollTo(0, coordinatesCard.offsetTop - 50)
}

/**
 * Do not submnit the annotation and start over.  The UI needs to be reset.  
 * @return {undefined}
 */
function restart() {
    annoPreview.innerHTML = ""
    URIpreview.innerHTML = ""
    supplyURI.classList.remove("is-hidden")
    for (let el of document.querySelectorAll('.notfirst')) { el.classList.add("is-hidden") }
}