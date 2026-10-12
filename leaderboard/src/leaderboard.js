const { getRequests } = require('./db')

exports.leaderboardRoute = async (req, res) => {
  try {
    const teams = require('./../teams.json')

    const requests = (await getRequests()).map(request => {
      const { ip, path } = request
      return {
        ...request,
        team: 1,
        isFlag: path === process.env.FLAG,
      }
    })

    const wins = requests.filter(request => request.isFlag)

    const winsByTeam = wins.reduce((acc, request) => {
      const team = request.team
      acc[team] = (acc[team] || 0) + 1
      return acc
    }, {})

    const teamWinsRank = Object.entries(winsByTeam)
      .sort((a, b) => b[1] - a[1])
      .map(([team, wins]) => ({ team, wins }))

    const timeToFirstWinByTeam = Object.entries(
      wins.reduce((acc, request) => {
        const team = request.team
        if (!acc[team]) {
          acc[team] = request.timestamp
        }
        return acc
      }, {}),
    ).map(([team, timestamp]) => ({ team, timestamp }))

    const teamSpeedRank = timeToFirstWinByTeam
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(({ team, timestamp }) => ({ team, timestamp }))

    const completionByTeam = teams.map(team => {
      const wins = winsByTeam[team.name] || 0
      const total = requests.filter(
        request => request.team === team.name,
      ).length
      const completion = total > 0 ? (wins / total) * 100 : 0
      return { team: team.name, completion }
    })

    const completionRank = completionByTeam
      .sort((a, b) => b.completion - a.completion)
      .map(({ team, completion }) => ({ team, completion }))

    const metrics = {
      totalWins: wins.length,
      winsByTeam,
      teamWinsRank,
      timeToFirstWinByTeam,
      teamSpeedRank,
      completionByTeam,
      completionRank,
    }

    res.status(200).json(metrics)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
