
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./react-three-game-engine.cjs.production.min.js')
} else {
  module.exports = require('./react-three-game-engine.cjs.development.js')
}
