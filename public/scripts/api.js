/**
 * Main API module for using RERUM. This needs to be fed the appropriate URIs
 * but is the only file that is needed to spin up a sandbox proxy.
 * @author cubap 
 */

//These are the internal application endpoints, they call out to the RERUM actions.
const CREATE_URL = "create"
const UPDATE_URL = "update"
const QUERY_URL = "query"
const DELETE_URL = "delete"
const OVERWRITE_URL = "overwrite"

function _customEvent(type, message, object, cause) {
    const sendUp = new CustomEvent(type, { detail: { message, object, cause } })
    document.dispatchEvent(sendUp)
}

/**
 * Send a query into RERUM and show the resulting response.
 * @param {HTMLElement} form 
 */
async function query(form) {
    let entries = form.getElementsByTagName("input")
    let queryObj = {}
    queryObj[entries[0].value] = entries[1].value
    fetch(QUERY_URL, {
        method: "POST",
        mode: "cors",
        headers: new Headers({
            'Content-Type': 'application/json; charset=utf-8'
        }),
        body: JSON.stringify(queryObj)
    })
    .then(response => {
        if (!response.ok) { throw response }
        return response.json()
    })
    .then(queryResult => {
        _customEvent("rerum-result", "See all matching results for the query below.", queryResult)
    })
    .catch(err => {
        _customEvent("rerum-error", "There was an error trying to query", {}, err)
    })
}

/**
 * Import an object that exists outside of RERUM into RERUM, attributed to this application's RERUM registration agent.
 * @see /src/rerm/tokens/tiny.properties ACCESS_TOKEN entry for attribution
 * @param {type} form
 */
async function importObj(form) {
    let url = form.getElementsByTagName("input")[0].value
    let origObj = await fetch(url)
        .then(response => response.json())
        .then(objForImport => {
            Object.assign(objForImport, { '@id': url })
            fetch(UPDATE_URL, {
                method: 'PUT',
                body: JSON.stringify(objForImport),
                headers: new Headers({
                    'Content-Type': 'application/json; charset=utf-8'
                })
            })
                .then(response => {
                    if (!response.ok) { throw response }
                    return response.json()
                })
                .then(resultObj => {
                    _customEvent("rerum-result", "Imported URI " + url + ". See resulting object below.", resultObj.new_obj_state)
                })
                .catch(err => {
                    _customEvent("rerum-error", "There was an error trying to import object with identifier " + url, {}, err)
                })
        })
        .catch(err => {
            _customEvent("rerum-error", "Could not resolve object with identifier '" + url + "'", {}, err)
        })
}

/**
 * Do a PUT update on an existing RERUM object.  The resulting object is attributed to this application's RERUM registration agent.
 * @see /src/rerm/tokens/tiny.properties ACCESS_TOKEN entry for attribution
 * @param {type} form
 * @param {object} objIn An optional way to pass the new JSON representation as a parameter
 */
async function update(form, objIn) {
    let uri = form.getElementsByTagName("input")[0].value
    let obj
    if (objIn !== undefined && typeof objIn === "object") {
        obj = objIn
    }
    else {
        obj = form.getElementsByTagName("textarea")[0].value
        try {
            obj = JSON.parse(obj)
        }
        catch (err) {
            _customEvent("rerum-error", "You did not provide valid JSON", err)
            return false
        }
    }
    obj["@id"] = uri
    fetch(UPDATE_URL, {
        method: 'PUT',
        body: JSON.stringify(obj),
        headers: new Headers({
            'Content-Type': 'application/json; charset=utf-8'
        })
    })
        .then(response => {
            if (response.ok) { return response.json() }
            throw response
        })
        .then(resultObj => {
            _customEvent("rerum-result", "Updated URI " + uri + ".  See resulting object below.", resultObj)
        })
        .catch(err => {
            _customEvent("rerum-error", "There was an error trying to update object at " + url, {}, err)
        })
}

/**
 * Provide a JSON object to create in RERUM.  The resulting object is attributed to this application's RERUM registration agent.
 * @see /src/rerm/tokens/tiny.properties ACCESS_TOKEN entry for attribution
 * @param {type} form
 */
async function create(form) {
    let obj = form.getElementsByTagName("textarea")[0].value
    try {
        obj = JSON.parse(obj)
    } catch (error) {
        console.error("You did not provide valid JSON")
        setMessage("You did not provide valid JSON")
        document.getElementById("obj-viewer").style.display = "none"
        return false
    }
    fetch(CREATE_URL, {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: new Headers({
            'Content-Type': 'application/json; charset=utf-8'
        })
    })
    .then(response => {
        if (!response.ok) { throw response }
        const locationHeader = response.headers.get("Location") ?? response.headers.get("location")
        _customEvent("rerum-result", `Created new object at ${locationHeader ?? MISSING}.  See result below.`, Object.assign({ '@id': locationHeader }, obj))
        return response.json()
    })
    .catch(err => {
        _customEvent("rerum-error", "There was an error trying to create object", {}, err)
    })
}

/**
  * Provide the URL of a RERUM object to delete.  Only those objects attributed to this application's RERUM registration agent can be deleted.
  * @see /src/rerm/tokens/tiny.properties ACCESS_TOKEN entry for attribution
  * @param {type} form
  */
async function deleteObj(form) {
    let url = form.getElementsByTagName("input")[0].value
    fetch(`${DELETE_URL}/${url.split('id/').pop()}`, {
        method: 'DELETE',
        headers: new Headers({
            'Content-Type': 'text/plain; charset=utf-8'
        })
    })
        .then(response => {
            if (response.status === 204) {                
                return fetch(url).then(resp => resp.json()).then(deletedObj => _customEvent("rerum-result", "Object Deleted.  See result below.", deletedObj))
            }
            throw response
        })
        .catch(err => {
            _customEvent("rerum-error", "There was an error trying to delete object", {}, err)
        })
}

/**
 * Overwrite the representation of a JSON object at a given URL. Note this will not create a new node in history, it will overwrite the existing node.
 * TOnly those objects attributed to this application's RERUM registration agent can be overwritten.
 * @see /src/rerm/tokens/tiny.properties ACCESS_TOKEN entry for attribution
 * @param {type} form
 * @param {object} objIn An optional way to pass the new JSON representation as a parameter
 */
async function overwrite(form, objIn) {
    let uri = form.getElementsByTagName("input")[0].value
    let obj
    if (objIn !== undefined && typeof objIn === "object") {
        obj = objIn
    }
    else {
        obj = form.getElementsByTagName("textarea")[0].value
        try {
            obj = JSON.parse(obj)
        }
        catch (err) {
            _customEvent("rerum-error", "You did not provide valid JSON", {}, err)
            return false
        }
    }
    obj["@id"] = uri
    fetch(OVERWRITE_URL, {
        method: 'PUT',
        body: JSON.stringify(obj),
        headers: new Headers({
            'Content-Type': 'application/json; charset=utf-8'
        })
    })
    .then(response => {
            if(!response.ok){
                throw response
            }
            _customEvent("rerum-result", `URI ${uri} overwritten at ${response.headers.get("Location") ?? response.headers.get("location")}. See resulting object below:`, obj)
        })
        .catch(err => {
            _customEvent("rerum-error", "There was an error trying to overwrite object at " + uri, {}, err)
        })
}

const API = { query, import: importObj, update, create, delete: deleteObj, overwrite }

export { API }
