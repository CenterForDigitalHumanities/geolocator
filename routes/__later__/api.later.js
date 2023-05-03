const request = require("supertest")
const app = require("../../app")

describe("Test /create", () => {
  // TODO: This needs to be not creating new objects all the time.
  test("New Object saved", async () => {
    const response = await request(app)
    .post("/create")
    .send({test:"item"})
    
    expect(response.header).toHaveProperty('location')
    expect(response.header).toHaveProperty('etag')
    expect(response.header).toHaveProperty('keep-alive')
    expect(response.statusCode).toBe(201)
  })
})
