const createError = require('http-errors')
const express = require('express')
const logger = require('morgan')

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/ping', require('./routes/ping'))

app.use(function(req, res, next) {
	next(createError(404))
})

app.use(function(err, req, res, next) {
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}
	res.status(err.status || 500)
	res.render('error')
})

module.exports = app
