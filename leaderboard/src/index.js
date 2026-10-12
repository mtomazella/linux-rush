require('dotenv').config()
const express = require('express')
const cors = require('cors')

const server = express()

server.use(cors())
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

const router = express.Router()

router.get('/leaderboard', require('./leaderboard').leaderboardRoute)

server.use(require('./flagMiddleware').flagMiddleware)
server.use(router)
server.use(async (req, res, next) => {
  res.status(503).send('Não :)')
})

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
