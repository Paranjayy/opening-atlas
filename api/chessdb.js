const FEN_PATTERN = /^[prnbqkPRNBQK1-8/]+\s+[wb]\s+(?:-|[KQkq]+)\s+(?:-|[a-h][36])\s+\d+\s+\d+$/

function parseMove(record) {
  return record.split(',').reduce((move, field) => {
    const [key, ...value] = field.split(':')
    move[key] = value.join(':')
    return move
  }, {})
}

export default async function handler(req, res) {
  const fen = typeof req.query.fen === 'string' ? req.query.fen : ''
  if (!FEN_PATTERN.test(fen) || fen.length > 120) {
    return res.status(400).json({ error: 'A valid FEN position is required.' })
  }

  try {
    const response = await fetch(`https://www.chessdb.cn/cdb.php?action=queryall&board=${encodeURIComponent(fen)}`, {
      headers: { 'User-Agent': 'Opening-Atlas/1.0' },
    })
    if (!response.ok) throw new Error(`ChessDB returned ${response.status}`)
    const text = await response.text()
    const moves = text.split('|').filter(Boolean).map(parseMove).filter((move) => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move.move))
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400')
    return res.status(200).json({ moves, source: 'ChessDB', fetchedAt: new Date().toISOString() })
  } catch {
    return res.status(502).json({ error: 'Live opening intelligence is temporarily unavailable.' })
  }
}
