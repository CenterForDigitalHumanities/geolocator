#!/usr/bin/env node
/**
 * POST a create to the thing.
 * @author cubap@slu.edu
 */

const express = require('express')
const router = express.Router()
const got = require('got')

router.post('/', async (req, res, next) => {

  try {
    // check body for JSON
    JSON.stringify(req.body)
    const createBody = req.body
    const createOptions = {
      json: createBody,
      headers: {
        'user-agent': 'Tiny-Node',
        'Content-Type' : "application/json; charset=utf-8",
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}` // not required for query
      }
    }
    const createURL = `${process.env.RERUM_API_ADDR}create`
    const result = await got.post(createURL, createOptions).json()
    const locationURI = result["@id"] ?? result.id ?? ""
    res.setHeader("Location", locationURI)
    res.status(201)
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.status(500).send("Caught Error:" + err)
  }
})

module.exports = router
