const request = require('request')
const md = require('./merge-deep.js')

class GitHubApi {
  constructor() {
    this.baseUrl = 'https://api.github.com'
    this.requestOptions = {
      headers: {
        'User-Agent': 'vue-webpack-boilerplate-api',
      },
    }
  }

  setTokenToHeader(options, token) {
    if (!options.headers) options.headers = {}
    options.headers['Authorization'] = `token ${token}`
    return options
  }

  searchUser(req, res, token = null) {
    let options = md.mergeDeep({},
      {
        url: `${this.baseUrl}/search/users`,
        qs: { q: req.query.q ? req.query.q : 're-fort'},
      }, this.requestOptions)

    this.fetch(options, res, token)
  }

  searchRepo(req, res, token = null) {
    let options = md.mergeDeep({},
      {
        url: `${this.baseUrl}/search/repositories`,
        qs: { q: req.query.q ? `${req.query.q} in:name` : 'vue-weback-boilerplate in:name'},
      }, this.requestOptions)

    this.fetch(options, res, token)
  }

  fetchUserFollowers(req, res, token = null) {
    let options = md.mergeDeep({},
      {
        url: `${this.baseUrl}/user/followers`,
      }, this.requestOptions)

    this.fetch(options, res, token, { requiresAuth: true })
  }

  fetchUserFollowing(req, res, token = null) {
    let options = md.mergeDeep({},
      {
        url: `${this.baseUrl}/user/following`,
      }, this.requestOptions)

    this.fetch(options, res, token, { requiresAuth: true })
  }

  fetch(req, res, token, options = { requiresAuth: false }) {
    if (options.requiresAuth && !token) {
      res.statusCode = 401
      res.end(JSON.stringify({ error: 'Required Authentication'}))
      return
    }

    if (token) this.setTokenToHeader(req, token)
    request(req, (error, response, body) => {
      if (error) res.end(error)
      res.statusCode = response.statusCode
      res.end(body)
    })
  }

}

module.exports = GitHubApi
