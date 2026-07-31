const FEN_PATTERN = /^[prnbqkPRNBQK1-8/]+\s+[wb]\s+(?:-|[KQkq]+)\s+(?:-|[a-h][36])\s+\d+\s+\d+$/

export default async function handler(req, res) {
  const fen = typeof req.query.fen === 'string' ? req.query.fen : ''
  const pieces = fen.split(' ')[0]?.replace(/[1-8/]/g, '').length || 0
  if (!FEN_PATTERN.test(fen) || pieces > 7) return res.status(400).json({ error: 'Tablebases support valid positions with seven pieces or fewer.' })
  try {
    const response = await fetch(`https://tablebase.lichess.ovh/standard?fen=${encodeURIComponent(fen)}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'First-Rank/1.0' },
    })
    if (!response.ok) throw new Error(`Tablebase returned ${response.status}`)
    const data = await response.json()
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')
    return res.status(200).json({ category: data.category, dtz: data.dtz, moves: (data.moves || []).slice(0, 5).map(({ san, uci, category, dtz }) => ({ san, uci, category, dtz })) })
  } catch {
    return res.status(502).json({ error: 'Tablebase data is temporarily unavailable.' })
  }
}
