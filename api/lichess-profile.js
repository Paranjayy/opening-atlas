const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{2,30}$/

export default async function handler(req, res) {
  const username = typeof req.query.username === 'string' ? req.query.username.trim() : ''
  if (!USERNAME_PATTERN.test(username)) return res.status(400).json({ error: 'Use a valid public Lichess username.' })
  try {
    const response = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'Opening-Atlas/1.0' },
    })
    if (response.status === 404) return res.status(404).json({ error: 'That public Lichess profile was not found.' })
    if (!response.ok) throw new Error(`Lichess returned ${response.status}`)
    const data = await response.json()
    const perfs = Object.fromEntries(['bullet', 'blitz', 'rapid', 'classical', 'puzzle'].flatMap((key) => data.perfs?.[key]?.games || data.perfs?.[key]?.rating ? [[key, data.perfs[key]]] : []))
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')
    return res.status(200).json({
      username: data.username,
      title: data.title || null,
      perfs,
      count: data.count || {},
      online: Boolean(data.online),
      seenAt: data.seenAt || null,
    })
  } catch {
    return res.status(502).json({ error: 'Lichess profile data is temporarily unavailable.' })
  }
}
