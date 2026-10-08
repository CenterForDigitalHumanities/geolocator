#!/usr/bin/env node
/**
 * App routes
 * @author cubap@slu.edu
 */
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var dotenv = require('dotenv')
var dotenvExpand = require('dotenv-expand')
var storedEnv = dotenv.config()
dotenvExpand.expand(storedEnv)

require('./tokens.js')

var indexRouter = require('./routes/index')
var queryRouter = require('./routes/query')
var createRouter = require('./routes/create')
var updateRouter = require('./routes/update')
var deleteRouter = require('./routes/delete')
var overwriteRouter = require('./routes/overwrite')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
if(process.env.OPEN_API_CORS !== "false") { 
  // This enables CORS for all requests. We may want to update this in the future and only apply to some routes.
  const cors = require('cors')
  app.use(
    cors({
      "methods" : "GET,OPTIONS,HEAD,PUT,PATCH,DELETE,POST",
      "allowedHeaders" : [
        'Content-Type',
        'Content-Length',
        'Allow',
        'Authorization',
        'Location',
        'ETag',
        'Connection',
        'Keep-Alive',
        'Date',
        'Cache-Control',
        'Last-Modified',
        'Link',
        'X-HTTP-Method-Override'
      ],
      "exposedHeaders" : "*",
      "origin" : "*",
      "maxAge" : "600"
    })
  )
}

// Only the Geolocator's own pages and Oh My RERUM's copy of them may send anything but a read.
// Browsers always send Origin on a cross-origin request and on a same-origin POST, PUT, PATCH, or DELETE.
// A request with no Origin is not from a page, and this check cannot stop it.
const ALLOWED_ORIGINS = ["https://geo.rerum.io", "https://oh-my.rerum.io"]
app.use(function(req, res, next) {
  const origin = req.get("Origin")
  if (!origin || ["GET", "HEAD", "OPTIONS"].includes(req.method)) return next()
  if (ALLOWED_ORIGINS.includes(origin)) return next()
  // The same host, such as http://localhost:3005 while developing.
  try {
    if (new URL(origin).host === req.get("Host")) return next()
  }
  catch (err) {
    // An opaque origin such as "null" is not a URL.  It is not allowed.
  }
  res.status(403).send("This origin may not send requests to the Geolocator.")
})

app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

//New available usage without /app
app.use('/query', queryRouter)
app.use('/create', createRouter)
app.use('/update', updateRouter)
app.use('/delete', deleteRouter)
app.use('/overwrite', overwriteRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
