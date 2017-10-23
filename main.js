require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('./lib/jwt.js')({ jwtSecret: process.env['JWT_SECRET'] })
const GitHubAPI = require('./lib/github-api.js')
const api = new GitHubAPI()

const url = require('./constants.js').url
const port = process.env['PORT']
const redirectURL = process.env['REDIRECT_URL']

const githubOAuth = require('github-oauth')(
  {
    githubClient: process.env['GITHUB_CLIENT'],
    githubSecret: process.env['GITHUB_SECRET'],
    scope: 'read:user',
    baseURL: process.env.BASE_URL + (process.env.NODE_ENV === 'local' ? `:${process.env.PORT}` : ''),
    loginURI: url.AUTH,
    callbackURI: url.CALLBACK,
})

// CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})

app.get(url.AUTH, function (req, res) {
  return githubOAuth.login(req, res)
})

app.get(url.CALLBACK, function (req, res) {
  return githubOAuth.callback(req, res)
})

app.get(url.VERIFY, function (req, res) {
  const jwtToken = jwt.getJwtToken(req)
  const isValid = jwt.verify(jwtToken)
  res.end(JSON.stringify({ valid: isValid }))
})

app.get(url.SEARCH_USERS, function (req, res) {
  const jwtToken = jwt.getJwtToken(req)
  const token = jwt.decodeJwtToken(jwtToken)
  return api.searchUser(req, res, token)
})

app.get(url.SEARCH_REPOS, function (req, res) {
  const jwtToken = jwt.getJwtToken(req)
  const token = jwt.decodeJwtToken(jwtToken)
  return api.searchRepo(req, res, token)
})

app.get(url.USER_FOLLOWERS, function (req, res) {
  const jwtToken = jwt.getJwtToken(req)
  const token = jwt.decodeJwtToken(jwtToken)
  return api.fetchUserFollowers(req, res, token)
})

app.get(url.USER_FOLLOWING, function (req, res) {
  const jwtToken = jwt.getJwtToken(req)
  const token = jwt.decodeJwtToken(jwtToken)
  return api.fetchUserFollowing(req, res, token)
})

app.get(url.PING, function (req, res) {
  res.end(JSON.stringify({ message: 'pong' }))
})

githubOAuth.on('error', function (err, res) {
  console.error('there was an auth error', err)
  res.statusCode = 400
  res.end()
})

githubOAuth.on('token', function (token, res) {
  const jwtToken = jwt.sign(token.access_token)
  res.statusCode = 302
  res.setHeader('location', `${redirectURL}#${jwtToken}`)
  res.end()
})

const server = app.listen(port, function () {
  console.log(`Listening on port ${server.address().port}`)
})
