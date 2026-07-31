const formats = ['bullet', 'blitz', 'rapid', 'classical']

export default async function handler(req, res) {
  try {
    const response = await fetch('https://lichess.org/api/player', {
      headers: { Accept: 'application/json', 'User-Agent': 'First-Rank/1.0' },
    })
    if (!response.ok) throw new Error(`Lichess returned ${response.status}`)
    const leaders = await response.json()
    const pulse = formats.map((format) => {
      const leader = leaders[format]?.[0]
      const perf = leader?.perfs?.[format]
      return leader && perf ? {
        format,
        username: leader.username,
        title: leader.title || null,
        rating: perf.rating,
        progress: perf.progress ?? null,
      } : null
    }).filter(Boolean)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900')
    return res.status(200).json({ source: 'Lichess public leaderboards', pulse, fetchedAt: new Date().toISOString() })
  } catch {
    return res.status(502).json({ error: 'Lichess leaderboard data is temporarily unavailable.' })
  }
}
