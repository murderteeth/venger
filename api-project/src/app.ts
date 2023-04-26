import express from 'express'
import pingAgent from './agents/ping'
import hailingAgent from './agents/hail'
import worldAgent from './agents/world'
import characterAgent from './agents/character'
import startAgent from './agents/start'
import actionAgent from './agents/action'
import syncAgent from './agents/sync'

const port = (process.env.PORT || 9000) as number

const app = express()

app.use(express.json())
app.use('/api/ping', pingAgent)
app.use('/api/hail', hailingAgent)
app.use('/api/world', worldAgent)
app.use('/api/character', characterAgent)
app.use('/api/start', startAgent)
app.use('/api/action', actionAgent)
app.use('/api/sync', syncAgent)

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${port}`)
})

export default app
