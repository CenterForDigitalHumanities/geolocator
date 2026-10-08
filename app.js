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
// Only the Geolocator's own pages and Oh My RERUM's copy of them may use this API from a browser.
const ALLOWED_ORIGINS = ["https://geo.rerum.io", "https://oh-my.rerum.io"]
if(process.env.OPEN_API_CORS !== "false") {
  // This enables CORS for ALLOWED_ORIGINS.  The browser does not let a page on any other origin read a response or send a write.
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
      "origin" : ALLOWED_ORIGINS,
      "maxAge" : "600"
    })
  )
}

// CORS only stops a browser from reading a response.  A POST that skips the preflight, such as an HTML form, still runs.
// Requiring JSON makes the browser ask first, and cors() above turns away other origins.
// A request that does not come from a browser is not stopped by either.
app.use(function(req, res, next) {
  if (req.method === "POST" && !req.is("application/json")) return res.status(415).send("The Geolocator only accepts JSON.")
  next()
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
