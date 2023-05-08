// NOTE this is old code from the old "generate and preview an annotation" workflow, and may be deprecated out of existance. 

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
 * Do not submnit the annotation and start over.  The UI needs to be reset.  
 * @return {undefined}
 */
function restart() {
    annoPreview.innerHTML = ""
    URIpreview.innerHTML = ""
    supplyURI.classList.remove("is-hidden")
    for (let el of document.querySelectorAll('.notfirst')) { el.classList.add("is-hidden") }
}