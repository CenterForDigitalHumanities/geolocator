/* 
 * RERUM Geolocator Application Script
 * @author Bryan Haberberger
 * 
 * 
 */


GEOLOCATOR = {}

GEOLOCATOR.mymap={}

GEOLOCATOR.APPAGENT = "http://devstore.rerum.io/v1/id/5ed28964e4b048da2fa4be2b"

GEOLOCATOR.URLS = {
    DELETE: "delete",
    CREATE: "create",
    UPDATE: "update",
    QUERY: "query",
    OVERWRITE: "overwrite"
}

/**
 * A Web Annotation will have a body or a body.value that is a GeoJSON objects.
 * We want to return a flat array of the Features contained in the body.
 * This will also format the GeoJSON.properties for our metadata pop ups.
 * 
 * @param {type} annotation
 * @return {Array}
 */
GEOLOCATOR.parseGeoJSONFromWebAnnotation = function (annotation){
    let features = []
    let geoJsonType = ""
    let geoJsonObject = {}
    if(annotation.body.value && (annotation.body.value.type || annotation.body.value["@type"])){
        geoJsonType = annotation.body.value.type ? annotation.body.value.type : annotation.body.value["@type"] ? annotation.body.value["@type"] : ""
        geoJsonObject = annotation.body.value
    }
    else{
        geoJsonType = annotation.body.type ? annotation.body.type : annotation.body["@type"] ? annotation.body["@type"] : ""
        geoJsonObject = annotation.body
    }
    if(typeof geoJsonType === "string"){
        if(geoJsonType === "Feature"){
            if(!geoJsonObject.hasOwnProperty("properties")){
                geoJsonObject.properties = {}
            }
            if(annotation.hasOwnProperty("creator")){
                geoJsonObject.properties.annoCreator = annotation.creator
            }
            geoJsonObject.properties.annoID = annotation["@id"] ? annotation["@id"] : annotation.id ? annotation.id : ""
            geoJsonObject.properties.targetID = annotation.target ? annotation.target : ""
            features = [geoJsonObject]
        }
        else if (geoJsonType === "FeatureCollection"){
            if(geoJsonObject.hasOwnProperty("features") && geoJsonObject.features.length){
                features = geoJsonObject.features.map(feature => {
                    //We assume the application that created these coordinates did not apply properties.  
                    if(!feature.hasOwnProperty("properties")){
                        feature.properties = {}
                    }
                    if(annotation.hasOwnProperty("creator")){
                        feature.properties.annoCreator = annotation.creator
                    }
                    feature.properties.annoID = annotation["@id"] ? annotation["@id"] : annotation.id ? annotation.id : ""
                    feature.properties.targetID = annotation.target ? annotation.target : ""
                    return feature
                })
            }
        }
    }
    //TODO type could technically be an array.
    return features
}

/**
 * Given the URI of a web resource, resolve it and draw the GeoJSON-LD within.
 * @param {type} URI of the web resource to dereference and consume.
 * @return {Array}
 */
GEOLOCATOR.consumeForGeoJSON = async function(dataURL){
    let geoJSONFeatures = []
    let dataObj = await fetch(dataURL.replace(/^https?:/,location.protocol))
        .then(resp => resp.json())
        .then(man => {return man})
        .catch(err => {return null})
   
    if(dataObj){
        let dataURI = dataObj["@id"] ? dataObj["@id"] : dataObj.id ? dataObj.id : ""
        let resourceType = dataObj.type ? dataObj.type : dataObj["@type"] ? dataObj["@type"] : ""
        let linkedDataContexts = dataObj.hasOwnProperty("@context") ? dataObj["@context"] : ""
        /**
         * Baked in support for IIIF Presentation API 3 resource types
         * Note that this demo imagines supporting other resource types besides those listed in the IIIF Presentation 3 API.  TODO.
         * For now, it will alert users about their web resource before processing anything.  If it isn't a supported type, we don't even try.  FIXME
         */
        if(linkedDataContexts){
            if(typeof dataObj["@context"] === "string"){
//                console.error("The resource you provided needs the GeoJSON-LD Linked Data Context and the Linked Data Context for itself to be processed.  @context should be an array.")
//                return geoJSONFeatures
            }
            else if (Array.isArray(dataObj["@context"]) && dataObj["@context"].length > 0){
//                if(!dataObj["@context"].includes("https://geojson.org/geojson-ld/geojson-context.jsonld") && !dataObj["@context"].includes("http://geojson.org/geojson-ld/geojson-context.jsonld")){
//                    console.error("The GeoJSON-LD context is not present on your resource.  Please add this to the @context on your resource for processing.")
//                    return geoJSONFeatures
//                }
            }
            else if(typeof dataObj["@context"] === "object"){
                alert("We cannot support custom context objects.  You can include multiple Linked Data context links.")
                return geoJSONFeatures
            }
        }
        else{
            alert("The object provided does not contain any Linked Data contexts.  Please include the GeoJSON-LD context as well as the context for your resource.")
            return geoJSONFeatures
        }
        /**
         * @context verification and validation.  This could probably be made better with a helper function.
         */
        switch(resourceType){
            case "Manifest":
            case "Canvas":
                if(typeof dataObj["@context"] === "string" && 
                        (dataObj["@context"] !== "https://iiif.io/api/presentation/3/context.json" || dataObj["@context"] !== "http://iiif.io/api/presentation/3/context.json")
                    ){
                    alert("The IIIF resource type does not have the correct @context, it must be Presentation API 3.")
                    return geoJSONFeatures
                }
                else if (Array.isArray(dataObj["@context"]) && dataObj["@context"].length > 0){
                    if(!(dataObj["@context"].includes("http://iiif.io/api/presentation/3/context.json") || dataObj["@context"].includes("https://iiif.io/api/presentation/3/context.json"))){
                        alert("The IIIF resource type does not have the correct @context.")
                        return geoJSONFeatures
                    }
                }
                else if(typeof dataObj["@context"] === "object"){
                    alert("We cannot support custom context objects.  You can include multiple context JSON files.  Please include the latest IIIF Presentation API 3 context.")
                    return geoJSONFeatures
                }
            break
            case "Annotation":
            case "AnnotationPage":
                if(typeof dataObj["@context"] === "string" && (
                        (dataObj["@context"] !== "https://iiif.io/api/presentation/3/context.json" || dataObj["@context"] !== "http://iiif.io/api/presentation/3/context.json") 
                        ||(dataObj["@context"] !== "http://www.w3.org/ns/anno.jsonld" || dataObj["@context"] !== "https://www.w3.org/ns/anno.jsonld")
                        )
                    ){
                    console.error("This Web Annotation does not have a supporting context.  Please fix the @context for "+ dataURI)
                    //return geoJSONFeatures
                }
                else if (Array.isArray(dataObj["@context"]) && dataObj["@context"].length > 0){
                    if(!((dataObj["@context"].includes("https://iiif.io/api/presentation/3/context.json" || dataObj["@context"] !== "http://iiif.io/api/presentation/3/context.json")) 
                        ||(dataObj["@context"].includes("http://www.w3.org/ns/anno.jsonld") || dataObj["@context"].includes("https://www.w3.org/ns/anno.jsonld"))
                        )){
                        console.error("The Web Annotation does not have the correct @context.  Please fix the @context for "+ dataURI)
                        //return geoJSONFeatures
                    }
                }
                else if(typeof dataObj["@context"] === "object"){
                    console.error("We cannot support custom context objects.  You can include multiple context JSON files, but please include the latest IIIF Presentation API 3 or Web Annotation context.")
                    //return geoJSONFeatures
                }
            break
            default:
                alert("The data resource type is not supported.  It must be a IIIF Presentation API 3 'Manifest', 'Canvas', 'Annotation' or 'AnnotationPage'.  Please check the type.")
        }
        let hasNavPlace = false
        if(resourceType === "Manifest"){
            let manifestGeo = {}
            let geos= []
            let itemsGeos = []
            if(dataObj.hasOwnProperty("navPlace")){
                //Remember these are feature collections.  We just want to move forward with the features.
                if(dataObj.navPlace.features){
                    //It is embedded
                    manifestGeo = dataObj.navPlace.features
                }
                else{
                    //It could be referenced
                    let fid = dataObj.navPlace.id
                    manifestGeo = await fetch(fid.replace(/^https?:/,location.protocol))
                        .then(resp => resp.json())
                        .then(collection => {
                            return collection.features
                        })
                        .catch(err => {
                            console.error(err)
                            return []
                        })
                            
                }
                geos.push(manifestGeo)
            }
            /*
             * Also the Canvases??
            */
            if(dataObj.hasOwnProperty("items") && dataObj.items.length){
                itemsGeos = dataObj.items.filter(item => {
                    let itemType = item.type ? item.type : item["@type"] ? item["@type"] : ""
                    return (item.hasOwnProperty("navPlace") && itemType === "Canvas")
                }).map(canvas => {
                    //Remember these are feature collections.  We just want to move forward with the features.
                    return canvas.navPlace.features
                })
            }
            geoJSONFeatures = [...geos, ...itemsGeos]
            return geoJSONFeatures
        }
        else if(resourceType === "Canvas"){
            if(dataObj.hasOwnProperty("navPlace")){
                hasNavPlace = true
                //Remember these are feature collections.  We just want to move forward with the features.
                geoJSONFeatures = dataObj.navPlace.features
                return geoJSONFeatures
            }
        }
        else if(resourceType === "Annotation"){
            geoJSONFeatures = GEOLOCATOR.parseGeoJSONFromWebAnnotation(dataObj)
            return geoJSONFeatures
        }
        else if(resourceType === "AnnotationPage"){
            if(dataObj.hasOwnProperty("items") && dataObj.items.length){
                geoJSONFeatures = dataObj.items.map(webAnno => {
                    return GEOLOCATOR.parseGeoJSONFromWebAnnotation(webAnno)
                })
                return geoJSONFeatures
            }
        }
        else{
            // There is no way for me to get the features, I don't know where to look.
            alert("Unable to get GeoJSON Features.  The resource type is unknown and I don't know where to look.")
            return geoJSONFeatures
        }
                
        /**
         * If the object does not have navPlace, then it may have annotations on it.  Check for GeoJSON there.  
         * Note that instead of preferencing, we could just consume both.  That is not the use case here though.
         * If navPlace exists, then we don't check for Annotations.  
         * Note that the hasNavPlace variable will let you know if we found any instance of navPlace, which you can switch on. 
         */
        if(dataObj.hasOwnProperty("annotations") && dataObj.annotations.length){
            let annoGeos = dataObj.annotations.map(webAnno => {
                let webAnnoType = webAnno.type ? webAnno.type : webAnno["@type"] ? webAnno["@type"] : ""
                let webAnnoBodyType = ""
                if(webAnnoType === "Annotation"){
                    return GEOLOCATOR.parseGeoJSONFromWebAnnotation(webAnno)
                }
                else if(webAnnoType === "AnnotationPage"){
                    if(webAnno.hasOwnProperty("items") && webAnno.items.length){
                        return webAnno.items.map(webAnno => {
                            return GEOLOCATOR.parseGeoJSONFromWebAnnotation(webAnno)
                        })
                    }
                }
            })
            //If you don't return r in the navPlace checks, it will make it to here and combine the navPlace geos and the annotation geos
            geoJSONFeatures = [...geoJSONFeatures, ...annoGeos]
            if(geoJSONFeatures.length === 0){
                console.warning("There was no GeoJSON found in the Annotations on this web resource.")
            }
            return geoJSONFeatures
        }
        else{
            console.warning("There were no annotations found on this web resource.")
            return geoJSONFeatures
        }
    }
    else{
        console.error("URI did not resolve and so was not dereferencable.  There is no data.")
        return geoJSONFeatures
    }
}

/**
 * Initialize the application by gathering all GeoJSON-LD Web Annotations from RERUM and 
 * formatting them appropriately for the given open source Web map.  Leaflet and MapML are supported.
 * @param {type} view
 * @return {undefined}
 */
GEOLOCATOR.init =  async function(view){
    let latlong = [12, 12] //default starting coords
    let historyWildcard = {"$exists":true, "$size":0}
    let geoWildcard = {"$exists":true}
    let geos = []
    document.getElementById("leafLat").oninput = GEOLOCATOR.updateGeometry
    document.getElementById("leafLong").oninput = GEOLOCATOR.updateGeometry
    //For my map demo app
    let geoAssertionsQuery = {
        "__rerum.history.next": historyWildcard,
        "__rerum.generatedBy"  : GEOLOCATOR.APPAGENT,
        "creator" : GEOLOCATOR.APPAGENT
    }
    let geoJsonData = []
    //Maybe want to do specific warnings around 'iiif-content' so separate support
    let IIIFdataInURL = GEOLOCATOR.getURLVariable("iiif-content")
    let dataInURL = IIIFdataInURL
    if(!IIIFdataInURL){
        dataInURL = GEOLOCATOR.getURLVariable("data-uri")
    }
    if(dataInURL){
        geoJsonData = await GEOLOCATOR.consumeForGeoJSON(dataInURL)
        .then(geoMarkers => {return geoMarkers})
        .catch(err => {
            console.error(err)
            return []
        })
    }
    else{
        geoJsonData = await fetch(GEOLOCATOR.URLS.QUERY, {
            method: "POST",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(geoAssertionsQuery)
        })
        .then(response => response.json())
        .then(geoMarkers => {
            return geoMarkers.map(anno => {
               return GEOLOCATOR.parseGeoJSONFromWebAnnotation(anno)
            })
        })
        .catch(err => {
            console.error(err)
            return []
        })
    }
    let formattedGeoJsonData = geoJsonData.flat(1) //AnnotationPages and FeatureCollections cause arrays in arrays.  
    //We have good GeoJSON.  Now we need to make sure label/name and description/summary inside of GeoJSON.properties is formatted correctly.
    let allGeos = await formattedGeoJsonData.map(async function(geoJSON){ 
        //Avoid NULLS and blanks in the UI
        let targetObjDescription = "No English description provided.  See targeted resource for more details."
        let targetObjLabel = "No English label provided.  See targeted resource for more details."
        let description = ""
        let label = ""
        //We are generating these properties dynamically because they may have not been stored in GeoJSON.properties correctly or at all.
        //We have to format things, like language maps, into something the web map will understand (basic key:string || num).
        if(geoJSON.properties.hasOwnProperty("summary")){
            if(typeof geoJSON.properties.summary === "string"){
                description = geoJSON.properties.summary
            }
            else{
                if(geoJSON.properties.summary.hasOwnProperty("en")){
                    description = geoJSON.properties.summary.en[0] ? geoJSON.properties.summary.en[0] : "No English description provided.  See targeted resource for more details."
                }
                else{
                    description = "No English description provided.  See targeted resource for more details."
                }
            }
        }
        if(geoJSON.properties.hasOwnProperty("label")){
            if(typeof geoJSON.properties.label === "string"){
                label = geoJSON.properties.label
            }
            else{
                if(geoJSON.properties.label.hasOwnProperty("en")){
                    label = geoJSON.properties.label.en[0] ? geoJSON.properties.label.en[0] : "No English label provided.  See targeted resource for more details."
                }
                else{
                    label = "No English label provided.  See targeted resource for more details."
                }
            }
        }
        else if(geoJSON.properties.hasOwnProperty("name")){
            //Check for 'name' as an alternative to 'label'
            if(typeof geoJSON.properties.name === "string"){
                label = geoJSON.properties.name
            }
            else{
                if(geoJSON.properties.name.hasOwnProperty("en")){
                    label = geoJSON.properties.name.en[0] ? geoJSON.properties.name.en[0] : "No English label provided.  See targeted resource for more details."
                }
                else{
                    label = "No English label provided.  See targeted resource for more details."
                }
            }
        }
        let isIIIF = false
        let targetURI = geoJSON.properties.targetID ? geoJSON.properties.targetID : "Error"
        let annoID = geoJSON.properties.annoID ? geoJSON.properties.annoID : "Unknown"
        let creator = geoJSON.properties.annoCreator ? geoJSON.properties.annoCreator : "geolocating@rerum.io"
        //Here we make our formatted props the geoJSON properties.  Values have to be (string || num), no arrays or objects.
        let formattedProps = {"annoID":annoID, "targetID":targetURI, "label":label,"description":description, "creator": creator, "isIIIF":isIIIF}
        geoJSON.properties = formattedProps
        /**
         * Everything below is to support metadata from the target object.  Typically, a web map UI shows key \n value for free.  
         * We want to show the label and description/summary from the target, especially if they are not provided in GeoJSON.properties.
         * We have to format things, like language maps, into something the web map will understand (basic key:string || num).
         * In the end, we could just say "we only support what is in the GeoJSON.properties already, which is what you should be doing".
         * Instead, here we attempt to resolve the target and take its label and description if the GeoJSON did not have them already.  
         */
        
        //We resolve the targets live time to look for metadata that was not in GeoJSON.properties.
        //Note that we are doing this every time to support the isIIIF flag.  If we remove that, we can put this fetch behind conditionals. 
        //Maybe only do this if you don't already have a label and/or description from the GeoJSON properties.
        let targetObj = await fetch(targetURI.replace(/^https?:/,location.protocol))
        .then(resp => resp.json())
        .catch(err => {
            console.error(err)
            return geoJSON
        })
        if(targetObj){
            //Note that these target object properties will not overwrite GeoJSON.properties, but they could.
            isIIIF = GEOLOCATOR.checkForIIIF(targetObj)
            formattedProps.isIIIF = isIIIF
            //v3 summary
            if(targetObj.hasOwnProperty("summary")){
                if(typeof targetObj.summary === "string"){
                    targetObjDescription = targetObj.summary
                }
                else{
                    if(targetObj.summary.hasOwnProperty("en")){
                        targetObjDescription = targetObj.summary.en[0] ? targetObj.summary.en[0] : "No English description provided.  See targeted resource for more details."
                    }
                    else{
                        targetObjDescription = "No English description provided.  See targeted resource for more details."
                    }
                }
            }
            //v2 description
            if(targetObjDescription === "No English description provided.  See targeted resource for more details."){
                if(targetObj.hasOwnProperty("description") && typeof targetObj.description === "string"){
                    targetObjDescription = targetObj.description ? targetObj.description : "No English description provided.  See targeted resource for more details."
                }
            }
            //v2 or v3 label
            if(targetObj.hasOwnProperty("label")){
                if(typeof targetObj.label === "string"){
                    targetObjLabel = targetObj.label
                }
                else{
                    if(targetObj.label.hasOwnProperty("en")){
                        targetObjLabel = targetObj.label.en[0] ? targetObj.label.en[0] : "No English label provided.  See targeted resource for more details."
                    }
                    else{
                        targetObjLabel = "No English label provided.  See targeted resource for more details."
                    }
                }
            }
            //Check for 'name' as an alternative to 'label'
            if(targetObjLabel === "No English label provided.  See targeted resource for more details." || targetObjLabel === ""){
                if(targetObj.hasOwnProperty("name") && typeof targetObj.name === "string"){
                    targetObjLabel = targetObj.name ? targetObj.name : "No English label provided.  See targeted resource for more details."
                }
            }
            //defaulting behavior, avoid NULLs and BLANKs for UIs sake. targetObjLabel and targetObjDescription are strings.
            if(formattedProps.label === "No English label provided.  See targeted resource for more details." || formattedProps.label === ""){
                //Then we don't have a label in the GeoJSON.properties.  Use the formatted label from the target, which may also just be this string.
                formattedProps.label = targetObjLabel
            }
            if(formattedProps.description === "No English description provided.  See targeted resource for more details." || formattedProps.description === ""){
                //Then we don't have a description in the GeoJSON.properties.  Use the formatted description from the target, which may also just be this string.
                formattedProps.description = targetObjDescription
            }
            geoJSON.properties = formattedProps
        }
        else{
            //This geo assertion is not well defined because its target is not well defined or unresolvable.
        } 
        return geoJSON
    })
    //After we have all the Annotations from RERUM and all the targets in those Annotations have been resolved for information...
    let geoAssertions = await Promise.all(allGeos).then(assertions => {return assertions}).catch(err => {return []})    
    switch(view){
        case "leaflet":
            //Put GeoJSON into a Leaflet instance
            GEOLOCATOR.initializeLeaflet(latlong, geoAssertions)
        break
        case "mapML":
            //Put GeoJSON into a MapML instance
            GEOLOCATOR.initializeMapML(latlong, geoAssertions)
        break
        default:
            alert("The only supported open source mapping UIs are Leaflet and MapML.")
    }
}

/**
 * Generate a MapML instance dynamically.  We don't know any coordinates until the application or user gives them to us.
 * @param {type} coords
 * @param {type} geoMarkers
 * @return {undefined}
 */
GEOLOCATOR.initializeMapML = async function(coords, geoMarkers){
    GEOLOCATOR.mymap = document.getElementById('mapml-view')
    GEOLOCATOR.mymap.setAttribute("lat", coords[0])
    GEOLOCATOR.mymap.setAttribute("long", coords[1])
    let feature_layer = `<layer- label="RERUM Geolocation Assertions" checked="checked">`
    feature_layer += `<map-meta name="projection" content="OSMTILE"></map-meta>`
    feature_layer += `<map-meta name="cs" content="gcrs"></map-meta>`
    feature_layer += `<map-meta name="extent" content="top-left-longitude=-180,top-left-latitude=84,bottom-right-longitude=180,bottom-right-latitude=-84"></map-meta>`
    let mapML_features = geoMarkers.map(geojson_feature => {
        //We need each of these to be a <feature>.  Right now, they are GeoJSON-LD
        let feature_creator = geojson_feature.properties.creator
        let feature_web_URI = geojson_feature.properties.annoID
        let feature_label = geojson_feature.properties.label
        let feature_caption = `<map-featurecaption>${feature_label}</map-featurecaption>`
        let feature_description = geojson_feature.properties.description
        let feature_describes = geojson_feature.properties.targetID
        let feature_lat = geojson_feature.geometry.coordinates[0]
        let feature_long = geojson_feature.geometry.coordinates[1]
        let geometry = `<map-geometry><map-point><map-coordinates>${feature_lat} ${feature_long}</map-coordinates></map-point></map-geometry>`
        let properties = 
        `<map-properties>
            <p>Label: ${feature_label}</p>
            <p>Description: ${feature_description}</p>
            <p><a target="_blank" href="${feature_describes}">Web Resource</a></p>
            <p><a target="_blank" href="${feature_web_URI}">Web Annotation</a></p>
        </map-properties>`
        let feature = `<map-feature class="generic_point">${feature_caption} ${properties} ${geometry}</map-feature>`
        return feature
    })
    mapML_features = mapML_features.join(" ")
    feature_layer += `${mapML_features}</layer->` 
    document.getElementById('mapml-container').style.backgroundImage = "none"
    loadingMessage.classList.add("is-hidden")
    //Add the features to the mapml-viewer dynamically
    GEOLOCATOR.mymap.innerHTML += feature_layer
}
    
GEOLOCATOR.initializeLeaflet = async function(coords, geoMarkers){
    GEOLOCATOR.mymap = L.map('leafletInstanceContainer')   
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 19,
        id: 'mapbox.satellite', //mapbox.streets
        accessToken: 'pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ'
    }).addTo(GEOLOCATOR.mymap);
    GEOLOCATOR.mymap.setView(coords,2);

    L.geoJSON(geoMarkers, {
        pointToLayer: function (feature, latlng) {
            let appColor = "#08c49c"
            return L.circleMarker(latlng, {
                radius: 8,
                fillColor: appColor,
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: GEOLOCATOR.pointEachFeature
    }).addTo(GEOLOCATOR.mymap)
    leafletInstanceContainer.style.backgroundImage = "none"
    loadingMessage.classList.add("is-hidden")
}

GEOLOCATOR.pointEachFeature = function (feature, layer) {
    //@id, label, description
    layer.hasMyPoints = true
    layer.isHiding = false
    let popupContent = ""
    if (feature.properties) {
        if(feature.properties.isIIIF){
            popupContent += `<p class="color6 featureCompliance">IIIF Compliant Target</p>`
        }
        if(feature.properties.label) {
            popupContent += `<div class="featureInfo"><label>Target Label:</label>${feature.properties.label}</div>`
        }
        if(feature.properties.targetID || feature.properties.annoID){
            let targetURI = feature.properties.targetID ? feature.properties.targetID : feature.properties.targetID ? feature.properties.targetID : ""
            popupContent += `<div class="featureInfo"><label> Target URI:</label><a target='_blank' href='${targetURI}'>See Target Data</a></div>`
        }
        if(feature.properties.description) {
            popupContent += `<div class="featureInfo"><label> Target Description:</label>${feature.properties.description}</div>`
        }
        if(feature.properties.creator) {
            popupContent += `<div class="featureInfo"><label>Annotation Generated By</label>${feature.properties.creator}</div>`
        }
        if(feature.properties.annoID) {
            popupContent += `<div class="featureInfo"><label>Annotation URI:</label><a target='_blank' href='${feature.properties.annoID}'>See Annotation Data</a></div>`
        }
    }
    layer.bindPopup(popupContent);
}

GEOLOCATOR.goToCoords = function(event, view  ){
    if(leafLat.value && leafLong.value){
        let coords = [leafLat.value, leafLong.value]
        switch(view){
            case "leaflet":
                GEOLOCATOR.mymap.flyTo(coords,8)
            break
            case "mapML":
//               the following should work
                GEOLOCATOR.mymap.zoomTo(coords[0], coords[1], 8)
            break
            default:
        }
        document.getElementById("currentCoords").innerHTML = "["+coords.toString()+"]"
        window.scrollTo(0, leafletInstanceContainer.offsetTop - 5)
    }
}

GEOLOCATOR.filterMarkers = async function(event, view){
    let app = event.target.getAttribute("app")
    switch(view){
        case "leaflet":
            GEOLOCATOR.mymap.eachLayer(function(layer) {
                if ( layer.hasMyPoints ) {
                    if(app === "isIIIF"){
                        if(layer.feature.properties.isIIIF){
                            //Then it is for sure showing and we want it to stay showing
                        }
                        else{
                            //It is a node we want to toggle
                            if(layer.isHiding){
                                tog.setAttribute("title","Remove all assertions that do not target IIIF resources.")
                                tog.value="IIIF Assertions Only"
                                layer.isHiding = false
                                layer.setRadius(8)
                                layer.getPopup().addEventListener("click")
                                let appColor = "#08c49c"
                                layer.setStyle({
                                    color: "#000",
                                    fillColor : appColor
                                })
                            }
                            else{
                                tog.setAttribute("title","See ALL assertions, even those that do not target IIIF resouces.")
                                tog.value="All Assertions"
                                layer.isHiding = true 
                                layer.setRadius(0)
                                layer.getPopup().removeEventListener("click")
                                layer.setStyle({
                                    color: 'rgba(0,0,0,0)',
                                    fillColor : 'rgba(0,0,0,0)'
                                })
                            }
                        }
                    }
                }
            })
        break
        case "mapML":

        break
        default:
    }

}
                      

/**
 * Connect with the RERUm API to create the Annotation Linked Open Data object.
 * @param {type} event
 * @param {type} app
 * @return {Boolean}
 */
GEOLOCATOR.submitAnno = async function(event, app){
    let geo = {}
    let lat = parseInt(leafLat.value * 1000000) / 1000000
    let long = parseInt(leafLong.value * 1000000) / 1000000
    if (lat && long) {
        geo = {
            type: "Point",
            coordinates: [long, lat]
        }
    }
    else{
        alert("Supply both a latitude and a longitude")
        return false
    }
    let geoJSON = {
        "properties":{},
        "geometry": geo,
        "type": "Feature"
    }
    let targetURL = document.getElementById('objURI').value
    if(targetURL){
        let demoAnno = 
            {
                "type":"Annotation",
                "@context":["http://geojson.org/geojson-ld/geojson-context.jsonld", "http://iiif.io/api/presentation/3/context.json"],
                "motivation":"tagging",
                "target":targetURL,   
                "body":geoJSON,
                "creator": GEOLOCATOR.APPAGENT
            }

        let createdObj = await fetch(GEOLOCATOR.URLS.CREATE, {
            method: "POST",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(demoAnno)
        })
        .then(response => response.json())
        .then(newObj => {return newObj.new_obj_state})
        .catch(err => {return null})
        if(null !== createdObj){
            GEOLOCATOR.annoSaveCompletedEvent(createdObj)
        }
        else{
            GEOLOCATOR.annoSaveFailedEvent()
        }
    }
    else{
        alert("The annotation was not created.  You must supply a URI for this annotation to target.")
        return false
    }

}

GEOLOCATOR.annoSaveCompletedEvent =function(createdObj){
    createAnnoBtn.setAttribute("onclick", "document.location.href='leaflet-view.html'")
    createAnnoBtn.value="See It In Leaflet."
    
}

GEOLOCATOR.annoSaveFailedEvent=function(){
    alert("The annotation could not be saved.  Check the Network panel in web console to learn more.");
}

/**
 * Check if the given object has a valid IIIF context associated with it
 * @param {type} obj
 * @return {Boolean}
 */
GEOLOCATOR.checkForIIIF = function(targetObj){
    if(targetObj["@context"]){
        if(Array.isArray(targetObj["@context"])){
            return targetObj["@context"].includes("http://iiif.io/api/presentation/3/context.json") || targetObj["@context"].includes("http://iiif.io/api/presentation/2/context.json")
        }
        else if(typeof targetObj["@context"] === "string"){
           return targetObj["@context"] === "http://iiif.io/api/presentation/3/context.json" || targetObj["@context"] === "http://iiif.io/api/presentation/2/context.json" 
        }
    }
    return false
}

GEOLOCATOR.getURLVariable = function(variable)
    {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                if(pair[0] == variable){return pair[1];}
        }
        return(false);
    }





