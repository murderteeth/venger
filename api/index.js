const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/ping', require('./routes/ping'))

const port = process.env.PORT || 9000
app.listen(port, () => console.log(`Server running on ${port}, http://localhost:${port}`))
