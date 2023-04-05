import express from 'express'

const router = express.Router()

router.get('/', function(req, res, next) {
  const pong = { time: new Date() }
	res.status(200).send(pong)
})

export default router
