const express = require('express')
const router = express.Router()
const got = require('got')

/* POST a create to the thing. */
router.post('/', async (req, res, next) => {

  try {
    // check body for JSON
    JSON.stringify(req.body)
    const createBody = req.body
    const createOptions = {
      json: createBody,
      headers: {
        'user-agent': 'Tiny-Node',
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}` // not required for query
      }
    }
    const createURL = `${process.env.RERUM_API_ADDR}create`
    const result = await got.post(createURL, createOptions).json()
    res.setHeader("Location", result["@id"])
    res.status(201)
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.status(500).send("Caught Error:" + err)
  }
})

module.exports = router
