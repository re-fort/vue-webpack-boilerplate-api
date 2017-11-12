require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('./lib/jwt.js')({ jwtSecret: process.env['JWT_SECRET'] })

const url = require('./constants.js').url
const port = process.env['PORT']
const redirectURL = process.env['REDIRECT_URL']

const mockedData = {
  users: [
    {
      avatar_url: 'https://avatars2.githubusercontent.com/u/3705391?v=4',
      login: 're-fort',
      html_url: 'https://github.com/re-fort',
    },
  ],
  repos: [
    {
      full_name: 're-fort/vue-webpack-boilerplate',
      description: 'A webpack boilerplate with vue-loader,axios, vue-router and vuex',
      owner: { avatar_url: 'https://avatars2.githubusercontent.com/u/3705391?v=4' },
      html_url: 'https://github.com/re-fort/vue-webpack-boilerplate',
    },
  ],
}

// CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})

app.get(url.AUTH, function (req, res) {
  res.statusCode = 302
  res.setHeader('location', `${redirectURL}#testToken`)
  res.end()
})

app.get(url.VERIFY, function (req, res) {
  const token = jwt.getJwtToken(req)
  const isValid = token === 'testToken' ? true : false
  res.end(JSON.stringify({ valid: isValid }))
})

app.get(url.SEARCH_USERS, function (req, res) {
  res.end(JSON.stringify({ items: mockedData.users }))
})

app.get(url.SEARCH_REPOS, function (req, res) {
  res.end(JSON.stringify({ items: mockedData.repos }))
})

app.get(url.USER_FOLLOWERS, function (req, res) {
  res.end(JSON.stringify(mockedData.users))
})

app.get(url.USER_FOLLOWING, function (req, res) {
  res.end(JSON.stringify(mockedData.users))
})

app.get(url.PING, function (req, res) {
  res.end(JSON.stringify({ message: 'pong' }))
})

const server = app.listen(port, function () {
  console.log(`Listening on port ${server.address().port}`)
})
