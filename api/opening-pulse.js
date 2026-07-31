const positions = [
  { id: 'e4', label: '1. e4', name: 'King pawn', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1' },
  { id: 'd4', label: '1. d4', name: 'Queen pawn', fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1' },
  { id: 'c4', label: '1. c4', name: 'English', fen: 'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1' },
  { id: 'nf3', label: '1. Nf3', name: 'Réti', fen: 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1' },
]

function parseMove(record) {
  return record.split(',').reduce((move, field) => {
    const [key, ...value] = field.split(':')
    move[key] = value.join(':')
    return move
  }, {})
}

async function query(position) {
  const response = await fetch(`https://www.chessdb.cn/cdb.php?action=queryall&board=${encodeURIComponent(position.fen)}`, { headers: { 'User-Agent': 'First-Rank/1.0' } })
  if (!response.ok) throw new Error('ChessDB unavailable')
  const moves = (await response.text()).split('|').filter(Boolean).map(parseMove).filter((move) => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move.move))
  const topTier = moves.filter((move) => move.note?.startsWith('!'))
  return { ...position, move: moves[0] || null, replyCount: moves.length, topTierCount: topTier.length }
}

export default async function handler(req, res) {
  try {
    const pulse = await Promise.all(positions.map(query))
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400')
    return res.status(200).json({ source: 'ChessDB', pulse, fetchedAt: new Date().toISOString() })
  } catch {
    return res.status(502).json({ error: 'Opening pulse is temporarily unavailable.' })
  }
}
