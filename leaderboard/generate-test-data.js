const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const root = __dirname
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => line.split('=')),
)
const teams = JSON.parse(fs.readFileSync(path.join(root, 'teams.json'), 'utf8'))

const requestCounts = [48, 67, 83, 102]
const wrongFlag = 'çlfkajopç2qwwjçlmaf'
const normalPaths = ['leaderboard', 'favicon.ico']
const requests = []
const start = Date.parse('2026-10-12T17:00:00.000Z')
let sequence = 0

const randomInt = max => crypto.randomInt(max)

const getIpRange = (team, teamIndex) => {
  const lower = teamIndex === 3 ? team.lowerIpRange + 1 : team.lowerIpRange
  return Array.from(
    { length: team.upperIpRange - lower + 1 },
    (_, index) => lower + index,
  )
}

const chooseIpPool = (team, teamIndex) => {
  const availableIps = getIpRange(team, teamIndex)
  const poolSize = 1 + randomInt(Math.max(1, team.size - 1))

  for (let index = availableIps.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1)
    ;[availableIps[index], availableIps[swapIndex]] = [
      availableIps[swapIndex],
      availableIps[index],
    ]
  }

  return availableIps.slice(0, poolSize)
}

teams.forEach((team, teamIndex) => {
  const ipPool = chooseIpPool(team, teamIndex)
  console.log(`${team.name}: ${ipPool.length} unique IPs`)

  for (let index = 0; index < requestCounts[teamIndex]; index += 1) {
    const pathIndex = sequence % 10
    const requestPath =
      pathIndex < 4
        ? env.FLAG
        : pathIndex < 6
          ? wrongFlag
          : normalPaths[sequence % normalPaths.length]

    requests.push({
      ip: `10.42.0.${ipPool[randomInt(ipPool.length)]}`,
      path: requestPath,
      timestamp: new Date(start + sequence * 11900).toISOString(),
    })
    sequence += 1
  }
})

fs.writeFileSync(
  path.join(root, 'db.json'),
  `${JSON.stringify({ requests }, null, 2)}\n`,
)

console.log(`Generated ${requests.length} requests`)
