const express = require('express')
const cookieParser = require('cookie-parser')

const app = express()

// public static site
app.use('/public', express.static('public'))

// login handler
app.get('/public/login', (req, res) => {
  res.cookie('sid', '123')
  res.redirect('/private')
})

// I know we're implementing everything to learn how, but cookie parsing... come on.
app.use('/private', cookieParser())

// Our session middleware
app.use('/private', (req, res, next) => {
  console.log('cookies', req.cookies)
  if (!req.cookies.sid) {
    res.status(401).redirect('/public')
  } else {
    next()
  }
})

// The walled garden
app.use('/private', express.static('private'))

// Have to choose some port, right
app.listen(1337)
