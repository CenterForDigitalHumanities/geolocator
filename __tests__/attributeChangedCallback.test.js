const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

// Assign the mock to the global object
global.localStorage = localStorageMock;

function attributeChangedCallback(name, oldValue, newValue) {
    if(oldValue === newValue) return;

    const userObj = JSON.parse(localStorage.getItem("userResource"))

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
            let a_context = userObj["@context"]
            let w3URI = "://www.w3.org/ns/anno.jsonld"
            let geoURI = "://geojson.org/geojson-ld/geojson-context.jsonld"
            let [a_contextUpdated, w3URIupdated] = createNewContext(a_context, w3URI) 
            a_context = a_contextUpdated
            let [a_contextUpdate, geoURIupdated] = createNewContext(a_context, geoURI)
            a_context = a_contextUpdate
            a_context = switchPositions(a_context, w3URIupdated, geoURIupdated) //switch position of w3 and geo if w3 comes after geo - for consistency   
            return a_context
        case "navPlace":
            let n_context = userObj["@context"]
            let navPlaceURI = "://iiif.io/api/extension/navplace/context.json"
            let APIuri = "://iiif.io/api/presentation/3/context.json"
            let [n_contextUpdated, navPlaceURIupdated] = createNewContext(n_context, navPlaceURI)
            n_context = n_contextUpdated
            let [n_contextUpdate, APIuriUpdated] = createNewContext(n_context, APIuri)
            n_context = n_contextUpdate
            n_context = switchPositions(n_context, navPlaceURIupdated, APIuriUpdated) //switch position of nav and api if nav comes after api - for consistency
            n_context = n_context.filter(url => url !== "http://iiif.io/api/presentation/2/context.json") //remove api/2 URI if present
            return n_context
        default: 
            wrapper = JSON.parse(JSON.stringify(userObj))
            return wrapper
    }
}

describe('NavPlace attributeChangedCallback', () => {

    afterEach(() => { localStorage.clear() })

    test("context with navPlace and presentation/3 - in order", () => {
        const userObj = {"@context": [
            "http://iiif.io/api/extension/navplace/context.json",
            "http://iiif.io/api/presentation/3/context.json"
        ]}
        localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
        const myVar = attributeChangedCallback(null, null, 'navPlace');
        expect(myVar).toEqual(userObj["@context"]);
    })

    test("context with navPlace and presentation/3 - out of order", () => {
        const userObj = {"@context": [
            "http://iiif.io/api/presentation/3/context.json",
            "http://iiif.io/api/extension/navplace/context.json"
        ]}
        const expectedOutput = [
            "http://iiif.io/api/extension/navplace/context.json",
            "http://iiif.io/api/presentation/3/context.json"
        ]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
        const myVar = attributeChangedCallback(null, null, 'navPlace');
        expect(myVar).toEqual(expectedOutput);
    })

    test("context with outdated IIIF format", () => {
        const userObj = {"@context": [
            "http://iiif.io/api/presentation/2/context.json"
        ]}
        const expectedOutput = [
            "http://iiif.io/api/extension/navplace/context.json",
            "http://iiif.io/api/presentation/3/context.json"
        ]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
        const myVar = attributeChangedCallback(null, null, 'navPlace');
        expect(myVar).toEqual(expectedOutput);
    })

    test("non-Array context", () => {
        const userObj = {"@context": "http://iiif.io/api/presentation/3/context.json"}
        const expectedOutput = [
            "http://iiif.io/api/extension/navplace/context.json",
            "http://iiif.io/api/presentation/3/context.json"
        ]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
        const myVar = attributeChangedCallback(null, null, 'navPlace');
        expect(myVar).toEqual(expectedOutput);
    })
    test("random context", ()=> {
        const userObj = {"@context": "http://someAddress.json"}
        const expectedOutput = [
            "http://someAddress.json",
            "http://iiif.io/api/extension/navplace/context.json",
            "http://iiif.io/api/presentation/3/context.json"
        ]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
        const myVar = attributeChangedCallback(null, null, 'navPlace');
        expect(myVar).toEqual(expectedOutput);
    })
})

describe('Annotation attributeChangedCallback', () => {

    afterEach(() => { localStorage.clear() })

    test("non-Array context", () => {
        const userObj = {"@context": "http://lived-religion.rerum.io/deer-lr/vocab/context.json"}
        const expectedOutput = [
            "http://lived-religion.rerum.io/deer-lr/vocab/context.json",
            "http://www.w3.org/ns/anno.jsonld",
            "http://geojson.org/geojson-ld/geojson-context.jsonld"
        ]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
        const myVar = attributeChangedCallback(null, null, 'Annotation');
        expect(myVar).toEqual(expectedOutput);
    })

    test("no context", () => {
        const userObj = {
            "access": "checker without authentication",
            "@id": "https://store.rerum.io/v1/id/11111",
            "theres": "no restriction on these edits!"
        }
        const expectedOutput = [
            "http://www.w3.org/ns/anno.jsonld",
            "http://geojson.org/geojson-ld/geojson-context.jsonld"
        ]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
        const myVar = attributeChangedCallback(null, null, 'Annotation');
        expect(myVar).toEqual(expectedOutput);
    })

    test("random context", ()=> {
        const userObj = {"@context": "http://someAddress.json"}
        const expectedOutput = [
            "http://someAddress.json",
            "http://www.w3.org/ns/anno.jsonld",
            "http://geojson.org/geojson-ld/geojson-context.jsonld"
        ]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
        const myVar = attributeChangedCallback(null, null, 'Annotation');
        expect(myVar).toEqual(expectedOutput);
    })

    test("context with URIs out of order", () => {
        const userObj = {"@context": [
            "http://geojson.org/geojson-ld/geojson-context.jsonld",
            "http://www.w3.org/ns/anno.jsonld"
        ]}
        const expectedOutput = [
            "http://www.w3.org/ns/anno.jsonld",
            "http://geojson.org/geojson-ld/geojson-context.jsonld"
        ]
        localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
        const myVar = attributeChangedCallback(null, null, 'Annotation');
        expect(myVar).toEqual(expectedOutput);
    })
})