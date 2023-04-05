const express = require('express')
const router = express.Router()

router.get('/', function(req, res, next) {
  const pong = { time: new Date() }
	res.status(200).send(pong)
})

module.exports = router
