
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./workerapp.cjs.production.min.js')
} else {
  module.exports = require('./workerapp.cjs.development.js')
}
