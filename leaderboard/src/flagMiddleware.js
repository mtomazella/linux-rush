const { addRequest } = require('./db')

exports.flagMiddleware = async (req, res, next) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const path = (req.path ?? '').split('/').filter(Boolean)[0] ?? ''
  const ip = req.ip

  await addRequest({ ip, path, timestamp })

  if (method === 'GET' && path === process.env.FLAG) {
    res.status(200).send('Yay')
  } else {
    next()
  }
}
