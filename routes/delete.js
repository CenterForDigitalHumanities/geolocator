const express = require('express')
const router = express.Router()
const got = require('got')

/* Legacy delete pattern w/body */

/* DELETE a delete to the thing. */
router.delete('/', async (req, res, next) => {
  try {
    const deleteBody = req.body ?? {}

    const deleteOptions = {
      json: deleteBody,
      headers: {
        'user-agent': 'Tiny-Node',
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        'Content-Type' : "application/json"
      }
    }
    console.log(deleteBody)
    const deleteURL = `${process.env.RERUM_API_ADDR}delete`
    const result = await got.delete(deleteURL, deleteOptions).text()
    res.status(204)
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.status(500).send("Caught Error:" + err)
  }
})

/* DELETE a delete to the thing. */
router.delete('/:id', async (req, res, next) => {
  try {
  
    const deleteURL = `${process.env.RERUM_API_ADDR}delete/${req.params.id}`
    const deleteOptions = {
      headers: {
        'user-agent': 'Tiny-Node',
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
      }
    }
    const result = await got.delete(deleteURL, deleteOptions).text()
    res.status(204)
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.status(500).send("Caught Error:" + err)
  }
})

module.exports = router
