
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./worker.cjs.production.min.js')
} else {
  module.exports = require('./worker.cjs.development.js')
}
