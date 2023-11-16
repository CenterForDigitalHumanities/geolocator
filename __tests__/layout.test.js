/**
 * @jest-environment jsdom
 */

const GeolocatorPreview = require('../public/components/layout')

const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

//Assign the mock to the global object
global.localStorage = localStorageMock;

describe('NavPlace attributeChangedCallback', () => {
    let instance;

    beforeAll(() => {
        instance = new GeolocatorPreview()
        const geo = {"geoKey": "someStringSoNotNull" }
        localStorage.setItem('geoJSON', JSON.stringify(geo))
        const newResource = {"@id": "somStringSoNotNull"}
        localStorage.setItem('newResource', JSON.stringify(newResource))
    })

    test("context with navPlace and presentation/3 - in order", () => {
        const userObj = {"@context": [
            "http://iiif.io/api/extension/navplace/context.json",
            "http://iiif.io/api/presentation/3/context.json"
        ]}
        localStorage.setItem('userResource', JSON.stringify(userObj));
        instance.attributeChangedCallback(null, null, 'navPlace');
        const actualOutput = JSON.parse(localStorage.getItem('newResource'))['@context'];
        expect(actualOutput).toEqual(userObj["@context"]);
    })

    test("context with navPlace and presentation/3 - out of order", () => {
        const userObj = {"@context": [
            "http://iiif.io/api/presentation/3/context.json",
            "http://iiif.io/api/extension/navplace/context.json"
        ]}
        localStorage.setItem('userResource', JSON.stringify(userObj));
        instance.attributeChangedCallback(null, null, 'navPlace');
        const actualOutput = JSON.parse(localStorage.getItem('newResource'))['@context'];
        const expectedOutput = [
            "http://iiif.io/api/extension/navplace/context.json",
            "http://iiif.io/api/presentation/3/context.json"
        ]
        expect(actualOutput).toEqual(expectedOutput);
    })

    test("context with outdated IIIF format", () => {
        const userObj = {"@context": [
            "http://iiif.io/api/presentation/2/context.json"
        ]}
        localStorage.setItem('userResource', JSON.stringify(userObj));
        instance.attributeChangedCallback(null, null, 'navPlace');
        const actualOutput = JSON.parse(localStorage.getItem('newResource'))['@context'];
        const expectedOutput = [
            "http://iiif.io/api/extension/navplace/context.json",
            "http://iiif.io/api/presentation/3/context.json"
        ]
        expect(actualOutput).toEqual(expectedOutput);
    })

    test("non-Array context", () => {
        const userObj = {"@context": "http://iiif.io/api/presentation/3/context.json"}
        localStorage.setItem('userResource', JSON.stringify(userObj));
        instance.attributeChangedCallback(null, null, 'navPlace');
        const actualOutput = JSON.parse(localStorage.getItem('newResource'))['@context'];
        const expectedOutput = [
            "http://iiif.io/api/extension/navplace/context.json",
            "http://iiif.io/api/presentation/3/context.json"
        ]
        expect(actualOutput).toEqual(expectedOutput);
    })

    test("random context", ()=> {
        const userObj = {"@context": "http://someAddress.json"}
        localStorage.setItem('userResource', JSON.stringify(userObj));
        instance.attributeChangedCallback(null, null, 'navPlace');
        const actualOutput = JSON.parse(localStorage.getItem('newResource'))['@context'];
        const expectedOutput = [
            "http://someAddress.json",
            "http://iiif.io/api/extension/navplace/context.json",
            "http://iiif.io/api/presentation/3/context.json"
        ]
        expect(actualOutput).toEqual(expectedOutput);
    })
})

describe('Annotation attributeChangedCallback', () => {
    let instance;

    beforeAll(() => {
        instance = new GeolocatorPreview()
        const geo = {"geoKey": "someStringSoNotNull" }
        localStorage.setItem('geoJSON', JSON.stringify(geo))
        const newResource = {"@id": "somStringSoNotNull"}
        localStorage.setItem('newResource', JSON.stringify(newResource))
    })

    test("non-Array context", () => {
        const userObj = {"@context": "http://lived-religion.rerum.io/deer-lr/vocab/context.json"}
        localStorage.setItem('userResource', JSON.stringify(userObj));
        instance.attributeChangedCallback(null, null, 'Annotation');
        const actualOutput = JSON.parse(localStorage.getItem('newResource'))['@context'];
        const expectedOutput = [
            "http://lived-religion.rerum.io/deer-lr/vocab/context.json",
            "http://www.w3.org/ns/anno.jsonld",
            "http://geojson.org/geojson-ld/geojson-context.jsonld"
        ]        
        expect(actualOutput).toEqual(expectedOutput);
    })

    test("no context", () => {
        const userObj = {
            "access": "checker without authentication",
            "@id": "https://store.rerum.io/v1/id/11111",
            "theres": "no restriction on these edits!"
        }
        localStorage.setItem('userResource', JSON.stringify(userObj));
        instance.attributeChangedCallback(null, null, 'Annotation');
        const actualOutput = JSON.parse(localStorage.getItem('newResource'))['@context'];
        const expectedOutput = [
            "http://www.w3.org/ns/anno.jsonld",
            "http://geojson.org/geojson-ld/geojson-context.jsonld"
        ]        
        expect(actualOutput).toEqual(expectedOutput);
    })

    test("random context", ()=> {
        const userObj = {"@context": "http://someAddress.json"}
        localStorage.setItem('userResource', JSON.stringify(userObj));
        instance.attributeChangedCallback(null, null, 'Annotation');
        const actualOutput = JSON.parse(localStorage.getItem('newResource'))['@context'];
        const expectedOutput = [
            "http://someAddress.json",
            "http://www.w3.org/ns/anno.jsonld",
            "http://geojson.org/geojson-ld/geojson-context.jsonld"
        ]        
        expect(actualOutput).toEqual(expectedOutput);
    })

    test("context with URIs out of order", () => {
        const userObj = {"@context": [
            "http://geojson.org/geojson-ld/geojson-context.jsonld",
            "http://www.w3.org/ns/anno.jsonld"
        ]}
        localStorage.setItem('userResource', JSON.stringify(userObj));
        instance.attributeChangedCallback(null, null, 'Annotation');
        const actualOutput = JSON.parse(localStorage.getItem('newResource'))['@context'];
        const expectedOutput = [
            "http://www.w3.org/ns/anno.jsonld",
            "http://geojson.org/geojson-ld/geojson-context.jsonld"
        ]
        expect(actualOutput).toEqual(expectedOutput);
    })
})