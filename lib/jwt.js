const jwt = require('jsonwebtoken')
const events = require('events')

module.exports = function(opts) {
  const jwtSecret = opts.jwtSecret
  let emitter = new events.EventEmitter()

  function sign(accessToken, options = { exp: null }) {
    return jwt.sign(
      {
        exp: options.exp ? options.exp : Math.floor(Date.now() / 1000) + (60 * 60),
        accessToken,
      },
      jwtSecret
    )
  }

  function verify(jwtToken) {
    try {
      if (!jwtToken) return false
      return !!jwt.verify(jwtToken, jwtSecret)
    } catch(error) {
      if (error.name !== 'TokenExpiredError') console.error(error)
      return false
    }
  }

  function getJwtToken(req) {
    try {
      return req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null
    } catch(error) {
      console.error(error)
      return null
    }
  }

  function decodeJwtToken(jwtToken) {
    try {
      return verify(jwtToken) ? jwt.verify(jwtToken, jwtSecret).accessToken : null
    } catch(error) {
      console.error(error)
      return null
    }
  }

  emitter.sign = sign
  emitter.verify = verify
  emitter.getJwtToken = getJwtToken
  emitter.decodeJwtToken = decodeJwtToken

  return emitter
}
