import express from 'express'
import pingRouter from './routes/ping'
import worldRouter from './routes/world'
import characterRouter from './routes/character'
import startRouter from './routes/start'
import actionRouter from './routes/action'

const port = (process.env.PORT || 9000) as number

const app = express()

app.use(express.json())
app.use('/api/ping', pingRouter)
app.use('/api/world', worldRouter)
app.use('/api/character', characterRouter)
app.use('/api/start', startRouter)
app.use('/api/action', actionRouter)

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${port}`)
})

export default app
