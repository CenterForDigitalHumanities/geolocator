#!/usr/bin/env node
/**
 * PUT an update to the thing.
 * @author cubap@slu.edu
 */

const express = require('express')
const router = express.Router()
const got = require('got')

router.put('/', async (req, res, next) => {

  try {
    // check body for JSON
    JSON.stringify(req.body)
    const updateBody = req.body

    // check for @id; any value is valid
    if (!(updateBody['@id'] ?? updateBody.id)) {
      throw Error("No record id to update! (https://centerfordigitalhumanities.github.io/rerum_server/API.html#update)")
    }

    const updateOptions = {
      json: updateBody,
      headers: {
        'user-agent': 'Tiny-Node',
        'Content-Type' : "application/json; charset=utf-8",
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}` // not required for query
      }
    }
    const updateURL = `${process.env.RERUM_API_ADDR}update`
    const result = await got.put(updateURL, updateOptions).json()
    res.status(200)
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.status(500).send("Caught Error:" + err)
  }
})

module.exports = router
