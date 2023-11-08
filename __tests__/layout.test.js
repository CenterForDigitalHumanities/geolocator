/**
 * @jest-environment jsdom
 */

function attributeChangedCallback(name, oldValue, newValue) { require('../public/components/layout') }

localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

//Assign the mock to the global object
global.localStorage = localStorageMock;

describe('NavPlace attributeChangedCallback', () => {

    beforeEach(() => { 
        const geo = {"geoKey": "someStringSoNotNull" }
        localStorage.setItem('geoJSON', JSON.stringify(geo));
    })
    afterEach(() => { localStorage.clear() })

    test("context with navPlace and presentation/3 - in order", () => {
        const userObj = {"@context": [
            "http://iiif.io/api/extension/navplace/context.json",
            "http://iiif.io/api/presentation/3/context.json"
        ]}
        localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
        attributeChangedCallback(null, null, 'navPlace');
        const actualOutput = JSON.parse(localStorageMock.getItem('newResource'))['@context'];
        expect(actualOutput).toEqual(userObj["@context"]);
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
        attributeChangedCallback(null, null, 'navPlace');
        const actualOutput = JSON.parse(localStorageMock.getItem('newResource'))['@context'];
        expect(actualOutput).toEqual(expectedOutput);
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
        attributeChangedCallback(null, null, 'navPlace');
        const actualOutput = JSON.parse(localStorageMock.getItem('newResource'))['@context'];
        expect(actualOutput).toEqual(expectedOutput);
    })

    // test("non-Array context", () => {
    //     const userObj = {"@context": "http://iiif.io/api/presentation/3/context.json"}
    //     const expectedOutput = [
    //         "http://iiif.io/api/extension/navplace/context.json",
    //         "http://iiif.io/api/presentation/3/context.json"
    //     ]
    //     localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
    //     attributeChangedCallback(null, null, 'navPlace');
    //     const actualOutput = localStorageMock.getItem('newResource');
    //     expect(actualOutput).toEqual(expectedOutput);
    // })
    // test("random context", ()=> {
    //     const userObj = {"@context": "http://someAddress.json"}
    //     const expectedOutput = [
    //         "http://someAddress.json",
    //         "http://iiif.io/api/extension/navplace/context.json",
    //         "http://iiif.io/api/presentation/3/context.json"
    //     ]
    //     localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
    //     attributeChangedCallback(null, null, 'navPlace');
    //     const actualOutput = localStorageMock.getItem('newResource');
    //     expect(actualOutput).toEqual(expectedOutput);
    // })
})

// describe('Annotation attributeChangedCallback', () => {

//     afterEach(() => { localStorage.clear() })

//     test("non-Array context", () => {
//         const userObj = {"@context": "http://lived-religion.rerum.io/deer-lr/vocab/context.json"}
//         const expectedOutput = [
//             "http://lived-religion.rerum.io/deer-lr/vocab/context.json",
//             "http://www.w3.org/ns/anno.jsonld",
//             "http://geojson.org/geojson-ld/geojson-context.jsonld"
//         ]
//         localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
//         const actualOutput = attributeChangedCallback(null, null, 'Annotation');
//         expect(actualOutput).toEqual(expectedOutput);
//     })

//     test("no context", () => {
//         const userObj = {
//             "access": "checker without authentication",
//             "@id": "https://store.rerum.io/v1/id/11111",
//             "theres": "no restriction on these edits!"
//         }
//         const expectedOutput = [
//             "http://www.w3.org/ns/anno.jsonld",
//             "http://geojson.org/geojson-ld/geojson-context.jsonld"
//         ]
//         localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
//         const actualOutput = attributeChangedCallback(null, null, 'Annotation');
//         expect(actualOutput).toEqual(expectedOutput);
//     })

//     test("random context", ()=> {
//         const userObj = {"@context": "http://someAddress.json"}
//         const expectedOutput = [
//             "http://someAddress.json",
//             "http://www.w3.org/ns/anno.jsonld",
//             "http://geojson.org/geojson-ld/geojson-context.jsonld"
//         ]
//         localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
//         const actualOutput = attributeChangedCallback(null, null, 'Annotation');
//         expect(actualOutput).toEqual(expectedOutput);
//     })

//     test("context with URIs out of order", () => {
//         const userObj = {"@context": [
//             "http://geojson.org/geojson-ld/geojson-context.jsonld",
//             "http://www.w3.org/ns/anno.jsonld"
//         ]}
//         const expectedOutput = [
//             "http://www.w3.org/ns/anno.jsonld",
//             "http://geojson.org/geojson-ld/geojson-context.jsonld"
//         ]
//         localStorageMock.getItem.mockReturnValue(JSON.stringify(userObj));
//         const actualOutput = attributeChangedCallback(null, null, 'Annotation');
//         expect(actualOutput).toEqual(expectedOutput);
//     })
// })