require('dotenv').config()

const request = require('request')
const jwt = require('../lib/jwt.js')({ jwtSecret: process.env['JWT_SECRET'] })
const md = require('../lib/merge-deep.js')
const url = require('../constants.js').url
const assert = require('assert')

const baseUrl = process.env.BASE_URL + (process.env.NODE_ENV === 'local' ? `:${process.env.PORT}` : '')
const jwtToken = jwt.sign(process.env.ACCESS_TOKEN)
const headers = { Authorization: `token ${jwtToken}` }

describe(url.AUTH, () => {
  let options = {
    url: `${baseUrl}${url.AUTH}`,
  }

  it('return 200', (done) => {
    request(options, (error, res) => {
      assert.equal(error, null)
      assert.equal(res.statusCode, 200)
      done()
    })
  })
})

describe(url.CALLBACK, () => {
  let options = {
    url: `${baseUrl}${url.CALLBACK}`,
  }

  it('return 400', (done) => {
    request(options, (error, res) => {
      assert.equal(error, null)
      assert.equal(res.statusCode, 400)
      done()
    })
  })
})

describe(url.VERIFY, () => {
  let options = {
    url: `${baseUrl}${url.VERIFY}`,
  }

  it('respond the token is invalid : no token', (done) => {
    request(options, (error, res, body) => {
      let json = JSON.parse(body)
      assert.equal(error, null)
      assert.equal(res.statusCode, 200)
      assert.equal(json.valid, false)
      done()
    })
  })

  it('respond the token is invalid : invalid token', (done) => {
    request(md.mergeDeep({}, options, { headers: { Authorization: 'token invalid_token' } }), (error, res, body) => {
      let json = JSON.parse(body)
      assert.equal(error, null)
      assert.equal(res.statusCode, 200)
      assert.equal(json.valid, false)
      done()
    })
  })

  it('respond the token is invalid : expired token', (done) => {
    const expiredToken = jwt.sign(process.env.ACCESS_TOKEN, { exp: Math.floor(Date.now() / 1000) - (60 * 60) })
    request(md.mergeDeep({}, options, { headers: { Authorization: `token ${expiredToken}` } }), (error, res, body) => {
      let json = JSON.parse(body)
      assert.equal(error, null)
      assert.equal(res.statusCode, 200)
      assert.equal(json.valid, false)
      done()
    })
  })

  it('respond the token is valid', (done) => {
    request(md.mergeDeep({}, options, { headers }), (error, res, body) => {
      let json = JSON.parse(body)
      assert.equal(error, null)
      assert.equal(res.statusCode, 200)
      assert.equal(json.valid, true)
      done()
    })
  })
})

describe(url.SEARCH_USERS, () => {
  let options = {
    url: `${baseUrl}${url.SEARCH_USERS}`,
    qs: { q: 're-fort' },
  }

  it('fetch users list without token', (done) => {
    request(options, (error, res, body) => {
      let json = JSON.parse(body)
      assert.equal(error, null)
      assert.equal(res.statusCode, 200)
      assert.equal(Array.isArray(json.items), true)
      done()
    })
  })

  it('fetch users list with token', (done) => {
    request(md.mergeDeep({}, options, { headers }), (error, res, body) => {
      let json = JSON.parse(body)
      assert.equal(error, null)
      assert.equal(res.statusCode, 200)
      assert.equal(Array.isArray(json.items), true)
      done()
    })
  })
})

describe(url.SEARCH_REPOS, () => {
  let options = {
    url: `${baseUrl}${url.SEARCH_REPOS}`,
    qs: { q: 'vue-weback-boilerplate in:name' },
  }

  it('fetch repos list without token', (done) => {
    request(options, (error, res, body) => {
      let json = JSON.parse(body)
      assert.equal(error, null)
      assert.equal(res.statusCode, 200)
      assert.equal(Array.isArray(json.items), true)
      done()
    })
  })

  it('fetch repos list with token', (done) => {
    request(md.mergeDeep({}, options, { headers }), (error, res, body) => {
      let json = JSON.parse(body)
      assert.equal(error, null)
      assert.equal(res.statusCode, 200)
      assert.equal(Array.isArray(json.items), true)
      done()
    })
  })
})

describe(url.USER_FOLLOWERS, () => {
  let options = {
    url: `${baseUrl}${url.USER_FOLLOWERS}`,
  }

  it('fetch followers list without token', (done) => {
    request(options, (error, res) => {
      assert.equal(error, null)
      assert.equal(res.statusCode, 401)
      done()
    })
  })

  it('fetch followers list with token', (done) => {
    request(md.mergeDeep({}, options, { headers }), (error, res, body) => {
      let json = JSON.parse(body)
      assert.equal(error, null)
      assert.equal(res.statusCode, 200)
      assert.equal(Array.isArray(json), true)
      done()
    })
  })
})

describe(url.USER_FOLLOWING, () => {
  let options = {
    url: `${baseUrl}${url.USER_FOLLOWING}`,
  }

  it('fetch followings list without token', (done) => {
    request(options, (error, res) => {
      assert.equal(error, null)
      assert.equal(res.statusCode, 401)
      done()
    })
  })

  it('fetch followings list with token', (done) => {
    request(md.mergeDeep({}, options, { headers }), (error, res, body) => {
      let json = JSON.parse(body)
      assert.equal(error, null)
      assert.equal(res.statusCode, 200)
      assert.equal(Array.isArray(json), true)
      done()
    })
  })
})
