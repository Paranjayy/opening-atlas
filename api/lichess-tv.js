const channels = ['best', 'rapid', 'blitz', 'bullet', 'classical', 'chess960']

export default async function handler(req, res) {
  try {
    const response = await fetch('https://lichess.org/api/tv/channels', {
      headers: { Accept: 'application/json', 'User-Agent': 'First-Rank/1.0' },
    })
    if (!response.ok) throw new Error(`Lichess returned ${response.status}`)
    const data = await response.json()
    const games = channels.flatMap((channel) => {
      const game = data[channel]
      return game ? [{
        channel,
        gameId: game.gameId,
        rating: game.rating,
        color: game.color,
        username: game.user?.name || 'Anonymous',
        title: game.user?.title || null,
      }] : []
    })
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120')
    return res.status(200).json({ source: 'Lichess TV', games, fetchedAt: new Date().toISOString() })
  } catch {
    return res.status(502).json({ error: 'Lichess TV is temporarily unavailable.' })
  }
}
