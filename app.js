// https://github.com/naugtur/node-example-websec

const express = require('express')
const cookieParser = require('cookie-parser')
const crypto = require('crypto');
const bodyParser = require('body-parser')
const uuidV4 = require('uuid/v4')
const db = require('./db') //fake database

const app = express()

const sessionStorage = {}

// public static site
app.use('/public', express.static('public'))

// login handler
app.get('/public/login', (req, res) => {
  const uuid = uuidV4()
const hash = crypto.createHash('sha256').update(req.query.password).digest('base64');

  if(req.query.login === 'root' && hash === 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI='){
    res.cookie('sid', uuid, { maxAge: 900000, httpOnly: true /*, secure: true*/})
    sessionStorage[uuid]={
      user: 'root'
    }
    setTimeout(()=>{
      delete sessionStorage[uuid]
    },20000)
    res.redirect('/private')
  } else {
    res.status(403).redirect('/public')
  }
})

// I know we're implementing everything to learn how, but cookie parsing... come on.
app.use('/private', cookieParser())

// Our session middleware
app.use('/private', (req, res, next) => {
  console.log('cookies', req.cookies)
  if (req.cookies.sid && sessionStorage[req.cookies.sid]) {
    req.session = sessionStorage[req.cookies.sid]
    next()
  } else {
    res.status(401).redirect('/public')
  }

})

app.post('/private/add', bodyParser.urlencoded(), (req, res) => {
  db.get('posts')
    .push({ id: uuidV4(), title: req.body.title})
    .write()
  res.redirect('/private/form.html')
})
app.get('/private/posts', (req, res) => {
  res.json(db.get('posts')
    .value())
})

// The walled garden
app.use('/private', express.static('private'))

// Have to choose some port, right
app.listen(1337)
