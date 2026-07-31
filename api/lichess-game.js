const GAME_ID_PATTERN = /^[A-Za-z0-9]{8}$/

export default async function handler(req, res) {
  const gameId = typeof req.query.gameId === 'string' ? req.query.gameId.trim() : ''
  if (!GAME_ID_PATTERN.test(gameId)) return res.status(400).json({ error: 'Use an 8-character public Lichess game ID.' })

  try {
    const response = await fetch(`https://lichess.org/game/export/${encodeURIComponent(gameId)}`, {
      headers: { Accept: 'application/x-chess-pgn', 'User-Agent': 'First-Rank/1.0' },
    })
    if (response.status === 404) return res.status(404).json({ error: 'That public Lichess game was not found.' })
    if (!response.ok) throw new Error(`Lichess returned ${response.status}`)
    const pgn = await response.text()
    if (!pgn.trim()) throw new Error('Empty game export')
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')
    return res.status(200).json({ gameId, pgn })
  } catch {
    return res.status(502).json({ error: 'Lichess game export is temporarily unavailable.' })
  }
}
