const FEN_PATTERN = /^[prnbqkPRNBQK1-8/]+\s+[wb]\s+(?:-|[KQkq]+)\s+(?:-|[a-h][36])\s+\d+\s+\d+$/

export default async function handler(req, res) {
  const fen = typeof req.query.fen === 'string' ? req.query.fen : ''
  if (!FEN_PATTERN.test(fen) || fen.length > 120) return res.status(400).json({ error: 'A valid FEN position is required.' })

  try {
    const response = await fetch(`https://lichess.org/api/cloud-eval?multiPv=3&fen=${encodeURIComponent(fen)}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'Opening-Atlas/1.0' },
    })
    if (response.status === 404) return res.status(200).json({ available: false })
    if (!response.ok) throw new Error(`Lichess returned ${response.status}`)
    const data = await response.json()
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400')
    return res.status(200).json({ available: true, depth: data.depth, knodes: data.knodes, pvs: data.pvs || [] })
  } catch {
    return res.status(502).json({ error: 'Cloud evaluation is temporarily unavailable.' })
  }
}
