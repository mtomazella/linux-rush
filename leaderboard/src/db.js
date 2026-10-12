const { JSONFilePreset } = require('lowdb/node')

const client = JSONFilePreset('db.json', {
  requests: [],
})

let writeQueue = Promise.resolve()

exports.addRequest = async ({ ip, path, timestamp }) => {
  const write = writeQueue.then(async () => {
    const db = await client
    await db.read()
    await db.update(data => {
      data.requests.push({ ip, path, timestamp })
    })
  })

  writeQueue = write.catch(() => {})
  await write
}

exports.getRequests = async () => {
  const db = await client
  await db.read()
  return db.data.requests
}
