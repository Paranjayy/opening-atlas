export default async function handler(_req, res) {
  try {
    const response = await fetch('https://lichess.org/api/puzzle/daily', {
      headers: { Accept: 'application/json', 'User-Agent': 'Opening-Atlas/1.0' },
    })
    if (!response.ok) throw new Error(`Lichess returned ${response.status}`)
    const data = await response.json()
    const { puzzle, game } = data
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600')
    return res.status(200).json({
      puzzle: { id: puzzle.id, rating: puzzle.rating, plays: puzzle.plays, themes: puzzle.themes, fen: puzzle.fen, solution: puzzle.solution },
      game: { id: game.id, perf: game.perf?.name || 'Game' },
      source: 'Lichess Daily Puzzle',
    })
  } catch {
    return res.status(502).json({ error: 'The daily puzzle is temporarily unavailable.' })
  }
}
