import { useCallback, useEffect, useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import './App.css'

const openings = [
  {
    id: 'sicilian', tag: 'BLACK REPERTOIRE', category: 'Open Game', name: 'Sicilian Defence', eco: 'B20', tempo: 'Sharp',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    promise: 'Fight for the center from the flank. Unequal positions, real winning chances.',
    plans: ['Hit d4 before White builds', 'Develop with ...e6 or ...g6', 'Use the c-file and queenside'],
    trap: 'Do not rush ...Nxe4. Check whether the knight is tactically defended first.',
    defense: 'Against the Open Sicilian: accept the central tension, then counter on the queenside—not by passively protecting everything.',
  },
  {
    id: 'ruy', tag: 'WHITE REPERTOIRE', category: 'Open Game', name: 'Ruy López', eco: 'C60', tempo: 'Classical',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7'],
    promise: 'A pressure system disguised as a quiet opening. Improve, squeeze, then strike.',
    plans: ['Pressure e5 and keep the bishop', 'Castle early, prepare Re1', 'Build c3 + d4 at the right moment'],
    trap: 'The bishop is not “hanging” on b5—capturing it often hands White the center.',
    defense: 'As Black, do not defend e5 forever. Develop, castle, and challenge the center with ...b5 or ...d5 when prepared.',
  },
  {
    id: 'queens', tag: 'POSITIONAL', category: 'Queen pawn', name: "Queen's Gambit", eco: 'D06', tempo: 'Stable',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O'],
    promise: 'Claim space, develop naturally, and turn a tiny edge into a long game.',
    plans: ['Pressure d5 with Qc2 or Rc1', 'Develop without blocking the c-pawn', 'Use e4 only after preparation'],
    trap: 'The c-pawn is a lever, not a sacrifice you must recover immediately.',
    defense: 'As Black, use ...c5 or ...e5 to challenge the center; passive piece placement is the actual danger.',
  },
  {
    id: 'caro', tag: 'BLACK REPERTOIRE', category: 'Open Game', name: 'Caro–Kann', eco: 'B10', tempo: 'Solid',
    moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6'],
    promise: 'A durable center with a “good” light-square bishop before the pawn chain closes.',
    plans: ['Develop Bf5 before ...e6', 'Pressure d4 after ...Nf6', 'Castle queenside only with purpose'],
    trap: 'After e4 c6 d4 d5, taking on e4 is sound—trying to hold the center too long is not.',
    defense: 'White wants space and a kingside initiative. Trade a key attacker when it costs you no central control.',
  },
  { id: 'italian', tag: 'WHITE REPERTOIRE', category: 'Open Game', name: 'Italian Game', eco: 'C50', tempo: 'Direct', moves: ['e4','e5','Nf3','Nc6','Bc4','Bc5','c3','Nf6','d3','O-O'], promise: 'Fast development, central control, and a clear kingside attacking map.', plans: ['Build c3 and d4', 'Aim pieces at f7', 'Keep the center flexible'], trap: 'Do not launch an attack before your king is safe.', defense: 'Black should contest d4 early and avoid letting White build a free center.' },
  { id: 'scotch', tag: 'WHITE REPERTOIRE', category: 'Open Game', name: 'Scotch Game', eco: 'C45', tempo: 'Forcing', moves: ['e4','e5','Nf3','Nc6','d4','exd4','Nxd4','Nf6','Nc3','Bb4'], promise: 'Open the center while Black’s king is still in the middle.', plans: ['Develop with tempo', 'Use the open d-file', 'Castle before hunting pawns'], trap: 'The exposed knight on d4 is often tactically protected.', defense: 'Black needs active development, not pawn-grabbing.' },
  { id: 'french', tag: 'BLACK REPERTOIRE', category: 'Open Game', name: 'French Defence', eco: 'C00', tempo: 'Resilient', moves: ['e4','e6','d4','d5','Nc3','Nf6','e5','Nfd7'], promise: 'Lock the center, then attack its base with patient counterplay.', plans: ['Strike with ...c5', 'Challenge d4', 'Activate the bad bishop'], trap: 'Do not take on e4 automatically; tension creates targets.', defense: 'White should use space before Black undermines the chain.' },
  { id: 'pirc', tag: 'BLACK REPERTOIRE', category: 'Open Game', name: 'Pirc Defence', eco: 'B07', tempo: 'Elastic', moves: ['e4','d6','d4','Nf6','Nc3','g6','f4','Bg7'], promise: 'Invite the center, then attack it from a flexible setup.', plans: ['Fianchetto quickly', 'Strike with ...c5 or ...e5', 'Pressure the center, not its edges'], trap: 'Do not allow a free e5–e6 pawn storm.', defense: 'White’s large center is strength and target—keep it mobile.' },
  { id: 'kingsindian', tag: 'BLACK REPERTOIRE', category: 'Queen pawn', name: "King's Indian", eco: 'E60', tempo: 'Dynamic', moves: ['d4','Nf6','c4','g6','Nc3','Bg7','e4','d6','Nf3','O-O'], promise: 'Let White build space, then launch a prepared kingside storm.', plans: ['Prepare ...e5', 'Use the dark bishop', 'Choose a flank before attacking'], trap: 'A kingside attack without a closed center is usually fantasy.', defense: 'White should use queenside space before Black’s pieces organize.' },
  { id: 'grunfeld', tag: 'BLACK REPERTOIRE', category: 'Queen pawn', name: 'Grünfeld Defence', eco: 'D70', tempo: 'Tactical', moves: ['d4','Nf6','c4','g6','Nc3','d5'], promise: 'Attack the center immediately with piece pressure and precision.', plans: ['Pressure d4', 'Use ...c5 to break', 'Make White prove the center'], trap: 'The d5 pawn is a lever, not a pawn to protect forever.', defense: 'White needs accurate development; the center only matters if it holds.' },
  { id: 'nimzo', tag: 'BLACK REPERTOIRE', category: 'Queen pawn', name: 'Nimzo-Indian', eco: 'E20', tempo: 'Strategic', moves: ['d4','Nf6','c4','e6','Nc3','Bb4'], promise: 'A principled pin that trades a small concession for rich structure play.', plans: ['Pressure c3', 'Control e4', 'Choose when to surrender the bishop pair'], trap: 'The pin is useful only if it creates a concrete follow-up.', defense: 'White can accept doubled pawns if it gains the center or bishop pair.' },
  { id: 'slav', tag: 'BLACK REPERTOIRE', category: 'Queen pawn', name: 'Slav Defence', eco: 'D10', tempo: 'Sound', moves: ['d4','d5','c4','c6','Nf3','Nf6','Nc3','dxc4'], promise: 'Support d5 cleanly and develop the light bishop outside the chain.', plans: ['Develop Bf5 or ...g6', 'Return c4 only on your terms', 'Break with ...c5 or ...e5'], trap: 'Holding c4 for too long strands Black’s queenside.', defense: 'White gets a lead in development—use it before Black consolidates.' },
  { id: 'dutch', tag: 'BLACK REPERTOIRE', category: 'Queen pawn', name: 'Dutch Defence', eco: 'A80', tempo: 'Combative', moves: ['d4','f5','g3','Nf6','Bg2','g6'], promise: 'Claim e4 and create an imbalanced game from move one.', plans: ['Control e4', 'Develop the dark bishop', 'Know when ...d6 or ...d5 fits'], trap: 'Weakening e8–h5 requires active kingside defense.', defense: 'White should pressure the dark squares and open the center.' },
  { id: 'english', tag: 'WHITE REPERTOIRE', category: 'Flank', name: 'English Opening', eco: 'A20', tempo: 'Flexible', moves: ['c4','e5','Nc3','Nf6','g3','d5'], promise: 'Control key central squares without declaring your pawn structure early.', plans: ['Fianchetto the bishop', 'Pressure d5', 'Transpose only when it helps'], trap: 'Flexibility is not passivity—fight for d5.', defense: 'Black’s direct center is fine, but it needs protection from flank pressure.' },
  { id: 'london', tag: 'WHITE REPERTOIRE', category: 'Queen pawn', name: 'London System', eco: 'D02', tempo: 'Practical', moves: ['d4','d5','Bf4','Nf6','e3','e6'], promise: 'A repeatable structure with a clear development scheme and few surprises.', plans: ['Develop Nf3 and Bd3', 'Prepare c3 and Nbd2', 'Attack only after castling'], trap: 'The London is a system, not an excuse to ignore Black’s threats.', defense: 'Black should challenge the center with ...c5 and develop actively.' },
  { id: 'catalan', tag: 'WHITE REPERTOIRE', category: 'Queen pawn', name: 'Catalan Opening', eco: 'E01', tempo: 'Pressuring', moves: ['d4','Nf6','c4','e6','g3','d5','Bg2','Be7'], promise: 'Long-term pressure on the queenside backed by a beautiful fianchetto bishop.', plans: ['Castle early', 'Pressure c4/d5', 'Use the g2 bishop as a long-range asset'], trap: 'Do not rush to regain a pawn if it gives Black activity.', defense: 'Black can hold the center, but every tempo must help development.' },
  { id: 'kingsgambit', tag: 'WHITE REPERTOIRE', category: 'Open Game', name: "King's Gambit", eco: 'C30', tempo: 'Wild', moves: ['e4','e5','f4','exf4','Nf3'], promise: 'A historical lightning bolt: trade material for initiative and open lines.', plans: ['Develop at speed', 'Attack f7', 'Keep the black king in the center'], trap: 'Sacrifice only while your development advantage exists.', defense: 'Black should return material if needed to extinguish White’s initiative.' },
  { id: 'benoni', tag: 'BLACK REPERTOIRE', category: 'Queen pawn', name: 'Modern Benoni', eco: 'A61', tempo: 'Unbalanced', moves: ['d4','Nf6','c4','c5','d5','e6','Nc3','exd5'], promise: 'Create asymmetry early and play for dark-square counterplay.', plans: ['Challenge with ...b5', 'Use the fianchetto bishop', 'Pressure e4'], trap: 'Black’s space deficit requires active piece play.', defense: 'White should use the space advantage before ...b5 breaks free.' },
  { id: 'vienna', tag: 'WHITE REPERTOIRE', category: 'Open Game', name: 'Vienna Game', eco: 'C25', tempo: 'Creative', moves: ['e4','e5','Nc3','Nf6','f4'], promise: 'A flexible attacking choice that sidesteps the main-line Ruy and Italian.', plans: ['Build a kingside initiative', 'Keep the center fluid', 'Develop Bc4 and Nf3'], trap: 'Do not confuse an early f-pawn with an automatic attack.', defense: 'Black should counter in the center before White’s pieces coordinate.' },
]

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const pieceName = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' }
const pieceSrc = (piece) => `https://lichess1.org/assets/piece/cburnett/${piece.color === 'w' ? 'w' : 'b'}${piece.type.toUpperCase()}.svg`

const gameLabs = [
  { id: 'middle', label: '02 / MIDDLEGAME', title: 'Central tension', eyebrow: 'MIDDLEGAME LAB', fen: 'r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N1PN2/PPQNBPPP/R3K2R w KQ - 0 8', mission: 'Before calculating, name the pawn break that changes the position.', focus: ['Identify the tension', 'Find the worst-placed piece', 'Calculate forcing replies first'], prompt: 'White has more space. Is e4 or cxd5 the break that actually improves the pieces?' },
  { id: 'end', label: '03 / ENDGAMES', title: 'King & pawn geometry', eyebrow: 'ENDGAME LAB', fen: '8/4k3/8/3K4/3P4/8/8/8 w - - 0 1', mission: 'Use opposition and the square rule to turn a pawn into a queen.', focus: ['Activate the king', 'Count the pawn’s square', 'Keep the opposition'], prompt: 'White to move. Can the king escort d4 safely, or must it gain opposition first?' },
]

const curriculum = [
  { id: 'opening', number: '01', title: 'Opening fluency', level: 'Foundation', detail: 'Know your first plans, not just your first moves.', tasks: ['Play 3 move drills', 'Explain one pawn break', 'Review one loss'] },
  { id: 'tactics', number: '02', title: 'Tactical vision', level: 'Every day', detail: 'Calculate forcing moves before you calculate pretty moves.', tasks: ['Checks first', 'Captures second', 'Threats third'] },
  { id: 'middle', number: '03', title: 'Middlegame plans', level: 'Pattern work', detail: 'Turn structure, space, and weak squares into a practical plan.', tasks: ['Name the imbalance', 'Improve worst piece', 'Choose the break'] },
  { id: 'end', number: '04', title: 'Endgame technique', level: 'Essential', detail: 'Convert the positions that decide long games.', tasks: ['King activity', 'Pawn races', 'Basic opposition'] },
]

const resourceDock = [
  { label: 'Study builder', name: 'Lichess Studies', detail: 'Build annotated chapters and variations around your own repertoire.', href: 'https://lichess.org/study' },
  { label: 'Analysis board', name: 'Lichess Analysis', detail: 'Explore a position, add branches, and inspect your own games.', href: 'https://lichess.org/analysis' },
  { label: 'Endgame truth', name: 'Lichess Tablebase', detail: 'Probe perfect-play positions with seven pieces or fewer.', href: 'https://tablebase.lichess.ovh/' },
  { label: 'Open database', name: 'Lichess Database', detail: 'Download public games for deeper, offline research.', href: 'https://database.lichess.org/' },
]

function Board({ game, orientation = 'w', onSquare, selected, lastMove }) {
  const squares = useMemo(() => {
    const rankOrder = orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8]
    const fileOrder = orientation === 'w' ? files : [...files].reverse()
    return rankOrder.flatMap((rank) => fileOrder.map((file) => `${file}${rank}`))
  }, [orientation])
  return <div className="board-shell"><div className="board" role="grid" aria-label="Chessboard">
    {squares.map((square, index) => {
      const piece = game.get(square)
      const isLast = lastMove?.includes(square)
      return <button key={square} className={`square ${(Math.floor(index / 8) + index) % 2 ? 'dark' : 'light'} ${selected === square ? 'selected' : ''} ${isLast ? 'last' : ''}`} onClick={() => onSquare(square)} aria-label={square}>
        {index % 8 === 0 && <span className="rank-label">{square[1]}</span>}
        {index >= 56 && <span className="file-label">{square[0]}</span>}
        {piece && <img draggable="false" src={pieceSrc(piece)} alt={`${piece.color === 'w' ? 'White' : 'Black'} ${pieceName[piece.type]}`} />}
      </button>
    })}
  </div></div>
}

function App() {
  const [openingId, setOpeningId] = useState('sicilian')
  const [ply, setPly] = useState(8)
  const [mode, setMode] = useState('study')
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState('Pick a square, then make the next book move.')
  const [score, setScore] = useState(0)
  const [theme, setTheme] = useState(() => localStorage.getItem('atlas-theme') || 'light')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [orientation, setOrientation] = useState('w')
  const [activeLab, setActiveLab] = useState('middle')
  const [intelligence, setIntelligence] = useState({ status: 'loading', moves: [] })
  const [puzzle, setPuzzle] = useState({ status: 'loading' })
  const [puzzleFen, setPuzzleFen] = useState(null)
  const [puzzleSide, setPuzzleSide] = useState(null)
  const [puzzleStep, setPuzzleStep] = useState(0)
  const [puzzleSelected, setPuzzleSelected] = useState(null)
  const [puzzleFeedback, setPuzzleFeedback] = useState('Load the position and find the forcing move.')
  const [engine, setEngine] = useState({ status: 'loading', pvs: [] })
  const [pgnInput, setPgnInput] = useState('')
  const [review, setReview] = useState(null)
  const [reviewFeedback, setReviewFeedback] = useState('Paste a PGN to make its final position your next study position.')
  const [completedTracks, setCompletedTracks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('atlas-tracks') || '[]')
      return Array.isArray(saved) ? saved : []
    } catch { return [] }
  })
  const opening = openings.find((item) => item.id === openingId)
  const game = useMemo(() => { const g = new Chess(); opening.moves.slice(0, ply).forEach((move) => g.move(move)); return g }, [opening, ply])
  const previous = useMemo(() => {
    if (!ply) return null
    const g = new Chess(); opening.moves.slice(0, ply - 1).forEach((move) => g.move(move)); const result = g.move(opening.moves[ply - 1]); return [result.from, result.to]
  }, [opening, ply])
  const nextMove = opening.moves[ply]
  const currentFen = game.fen()
  const lab = gameLabs.find((item) => item.id === activeLab)
  const labGame = useMemo(() => new Chess(lab.fen), [lab])
  const puzzleGame = useMemo(() => puzzleFen ? new Chess(puzzleFen) : null, [puzzleFen])
  const reviewGame = useMemo(() => review ? new Chess(review.fen) : null, [review])
  const explorerMoves = useMemo(() => intelligence.moves.slice(0, 5).map((move) => {
    const test = new Chess(currentFen)
    try { return { ...move, san: test.move({ from: move.move.slice(0, 2), to: move.move.slice(2, 4), promotion: move.move[4] })?.san } } catch { return { ...move, san: move.move } }
  }), [intelligence.moves, currentFen])
  const engineLines = useMemo(() => engine.pvs.map((pv) => {
    const test = new Chess(currentFen)
    const moves = pv.moves.split(' ').slice(0, 7).map((uci) => {
      try { return test.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })?.san } catch { return null }
    }).filter(Boolean)
    const evaluation = Number.isInteger(pv.mate) ? `M${pv.mate > 0 ? '+' : ''}${pv.mate}` : `${pv.cp >= 0 ? '+' : ''}${(pv.cp / 100).toFixed(2)}`
    return { ...pv, moves, evaluation }
  }), [engine.pvs, currentFen])

  const categories = ['All', ...new Set(openings.map((item) => item.category))]
  const visibleOpenings = openings.filter((item) => (filter === 'All' || item.category === filter) && item.name.toLowerCase().includes(query.toLowerCase()))
  function selectOpening(id) { setOpeningId(id); setPly(0); setMode('study'); setSelected(null); setFeedback('New line loaded. Walk through the opening or start a drill.'); document.querySelector('#study')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  function toggleTheme() { const next = theme === 'light' ? 'dark' : 'light'; setTheme(next); localStorage.setItem('atlas-theme', next) }
  function toggleTrack(id) {
    setCompletedTracks((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      localStorage.setItem('atlas-tracks', JSON.stringify(next))
      return next
    })
  }
  const previousMove = useCallback(() => { setPly((current) => Math.max(0, current - 1)); setMode('study') }, [])
  const nextLineMove = useCallback(() => { setPly((current) => Math.min(opening.moves.length, current + 1)); setMode('study') }, [opening.moves.length])
  const flipBoard = useCallback(() => { setOrientation((side) => side === 'w' ? 'b' : 'w') }, [])
  useEffect(() => {
    function handleKeyboard(event) {
      const tag = event.target.tagName
      if (event.metaKey || event.ctrlKey || event.altKey || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable) return
      const key = event.key.toLowerCase()
      const actions = {
        arrowleft: previousMove, h: previousMove, a: previousMove,
        arrowright: nextLineMove, l: nextLineMove, d: nextLineMove,
        arrowup: () => { setPly(0); setMode('study') }, k: () => { setPly(0); setMode('study') }, w: () => { setPly(0); setMode('study') },
        arrowdown: () => { setPly(opening.moves.length); setMode('study') }, j: () => { setPly(opening.moves.length); setMode('study') }, s: () => { setPly(opening.moves.length); setMode('study') },
        f: flipBoard,
      }
      if (actions[key]) { event.preventDefault(); actions[key]() }
    }
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [opening.moves.length, previousMove, nextLineMove, flipBoard])
  useEffect(() => {
    const controller = new AbortController()
    setIntelligence({ status: 'loading', moves: [] })
    fetch(`/api/chessdb?fen=${encodeURIComponent(currentFen)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Data unavailable')))
      .then((data) => setIntelligence({ status: 'ready', moves: data.moves || [], fetchedAt: data.fetchedAt }))
      .catch((error) => { if (error.name !== 'AbortError') setIntelligence({ status: 'error', moves: [] }) })
    return () => controller.abort()
  }, [currentFen])
  useEffect(() => {
    const controller = new AbortController()
    setEngine({ status: 'loading', pvs: [] })
    fetch(`/api/cloud-eval?fen=${encodeURIComponent(currentFen)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Engine unavailable')))
      .then((data) => setEngine({ status: data.available ? 'ready' : 'empty', ...data }))
      .catch((error) => { if (error.name !== 'AbortError') setEngine({ status: 'error', pvs: [] }) })
    return () => controller.abort()
  }, [currentFen])
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/daily-puzzle', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Puzzle unavailable')))
      .then((data) => {
        const position = new Chess(data.puzzle.fen)
        setPuzzle({ status: 'ready', ...data })
        setPuzzleFen(data.puzzle.fen)
        setPuzzleSide(position.turn())
        setPuzzleFeedback(`${position.turn() === 'w' ? 'White' : 'Black'} to move. Find the forcing continuation.`)
      })
      .catch((error) => { if (error.name !== 'AbortError') setPuzzle({ status: 'error' }) })
    return () => controller.abort()
  }, [])
  function handleSquare(square) {
    if (mode !== 'drill') return
    if (!selected) { if (game.get(square)?.color === game.turn()) setSelected(square); return }
    const test = new Chess(game.fen())
    try {
      const made = test.move({ from: selected, to: square, promotion: 'q' })
      if (made.san === nextMove) { setPly((p) => p + 1); setScore((s) => s + 1); setFeedback(`Exactly. ${made.san} is the book move.`) }
      else setFeedback(`${made.san} is playable, but this drill is looking for ${nextMove}. Try again.`)
    } catch { setFeedback('That piece cannot go there. Follow its legal movement.') }
    setSelected(null)
  }
  function startDrill() { setPly(0); setSelected(null); setMode('drill'); setFeedback(`Your mission: play ${opening.moves[0]}.`); }
  function resetPuzzle() {
    if (!puzzle.puzzle) return
    const position = new Chess(puzzle.puzzle.fen)
    setPuzzleFen(puzzle.puzzle.fen)
    setPuzzleSide(position.turn())
    setPuzzleStep(0)
    setPuzzleSelected(null)
    setPuzzleFeedback(`${position.turn() === 'w' ? 'White' : 'Black'} to move. Find the forcing continuation.`)
  }
  function handlePuzzleSquare(square) {
    if (!puzzleGame || puzzle.status !== 'ready' || puzzleStep >= puzzle.puzzle.solution.length) return
    if (!puzzleSelected) { if (puzzleGame.get(square)?.color === puzzleSide) setPuzzleSelected(square); return }
    const move = `${puzzleSelected}${square}`
    const expected = puzzle.puzzle.solution[puzzleStep]
    if (move !== expected) { setPuzzleSelected(null); setPuzzleFeedback('Not this one. Scan checks, captures, then threats.'); return }
    const test = new Chess(puzzleFen)
    test.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] })
    let nextStep = puzzleStep + 1
    while (nextStep < puzzle.puzzle.solution.length && test.turn() !== puzzleSide) {
      const reply = puzzle.puzzle.solution[nextStep]
      test.move({ from: reply.slice(0, 2), to: reply.slice(2, 4), promotion: reply[4] })
      nextStep += 1
    }
    setPuzzleFen(test.fen())
    setPuzzleStep(nextStep)
    setPuzzleSelected(null)
    setPuzzleFeedback(nextStep >= puzzle.puzzle.solution.length ? 'Solved. You found the whole forcing sequence.' : 'Correct. The defender replies—keep calculating.')
  }
  function reviewPgn() {
    if (!pgnInput.trim()) { setReviewFeedback('Paste a PGN first—moves alone are fine.'); return }
    if (pgnInput.length > 30000) { setReviewFeedback('Keep the PGN under 30,000 characters for this first-pass review.'); return }
    try {
      const parsed = new Chess()
      parsed.loadPgn(pgnInput.trim())
      const moves = parsed.history()
      if (!moves.length) throw new Error('No moves found')
      const headers = parsed.getHeaders()
      setReview({ fen: parsed.fen(), moves, headers })
      setReviewFeedback(`Loaded ${moves.length} plies. Start by naming the last irreversible decision before asking the engine.`)
    } catch { setReview(null); setReviewFeedback('That PGN could not be read. Export it from your chess site, then paste the full move text here.') }
  }

  return <main className={`app ${theme === 'dark' ? 'dark' : ''}`}>
    <nav><a className="brand" href="#top"><span>♞</span> opening<span>atlas</span></a><div className="nav-links"><a href="#library">Library</a><a href="#study">Study</a><a href="#puzzle-zone">Puzzles</a><a href="#game-lab">Game lab</a><a href="#field-notes">Field notes</a><button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme">{theme === 'light' ? '◐ Dark' : '◑ Light'}</button><button className="streak">⚡ 7 day streak</button></div></nav>
    <section className="hero" id="top"><div><p className="eyebrow">THE FIRST 12 MOVES, REIMAGINED</p><h1>Learn the <em>why</em><br />behind your moves.</h1><p className="hero-copy">A living opening repertoire for people who want to understand the position—not memorize an endless tree.</p><a className="hero-cta" href="#study">Enter the study hall <span>↓</span></a></div><div className="hero-note"><p>Today’s rule</p><strong>“Every opening move should buy you a plan.”</strong><div><span>01 / 04</span><span>WHITE TO MOVE</span></div></div></section>
    <section className="opening-strip" aria-label="Opening selector">{openings.slice(0, 4).map((item, index) => <button key={item.id} onClick={() => selectOpening(item.id)} className={item.id === openingId ? 'active' : ''}><span>0{index + 1}</span><b>{item.name}</b><small>{item.eco} · {item.tempo}</small></button>)}</section>
    <section className="study" id="study"><div className="study-intro"><div><p className="eyebrow">LESSON 01 / OPENING ATLAS</p><h2>Build the position.<br /><em>Understand the plan.</em></h2></div><div className="lesson-status"><span>YOUR PROGRESS</span><strong>{Math.round((ply / opening.moves.length) * 100)}%</strong><small>{mode === 'drill' ? 'Drill active' : 'Line exploration'}</small></div></div><aside className="repertoire"><p className="eyebrow">REPERTOIRE / {opening.tag}</p><h2>{opening.name}</h2><p>{opening.promise}</p><div className="line"><span>MAIN LINE</span>{opening.moves.map((move, i) => <button key={`${move}-${i}`} onClick={() => { setPly(i + 1); setMode('study') }} className={i === ply - 1 ? 'current' : ''}>{i % 2 === 0 ? `${Math.floor(i / 2) + 1}.` : ''} {move}</button>)}</div><button className="drill-button" onClick={startDrill}>Start move drill <span>→</span></button></aside>
      <div className="board-area"><div className="board-header"><span>{mode === 'drill' ? 'DRILL MODE' : 'EXPLORE THE LINE'}</span><div><button className="flip-button" onClick={flipBoard} aria-label="Flip board">↻</button><button disabled={!ply} onClick={previousMove}>←</button><span>{ply} / {opening.moves.length}</span><button disabled={ply === opening.moves.length} onClick={nextLineMove}>→</button></div></div><Board game={game} orientation={orientation} selected={selected} onSquare={handleSquare} lastMove={previous} /><p className="feedback">{feedback}</p><p className="key-hints"><kbd>←</kbd><kbd>H</kbd><kbd>A</kbd> previous · <kbd>→</kbd><kbd>L</kbd><kbd>D</kbd> next · <kbd>W</kbd>/<kbd>K</kbd> start · <kbd>S</kbd>/<kbd>J</kbd> end · <kbd>F</kbd> flip</p></div>
      <aside className="coach"><div><div className="coach-mark">♜</div><p className="eyebrow">POSITION COACH</p></div><div><h3>{nextMove ? `The next idea: ${nextMove}` : 'Main line complete'}</h3><p>{nextMove ? `${game.turn() === 'w' ? 'White' : 'Black'} to move. Find the move that carries the opening’s central idea forward.` : 'You have reached the first reference position. Now choose your plan.'}</p></div><div className="coach-actions"><div className="score"><span>DRILL SCORE</span><strong>{String(score).padStart(2, '0')}</strong></div><button onClick={startDrill}>Reset drill</button></div></aside></section>
    <section className="notes" id="field-notes"><div className="notes-title"><p className="eyebrow">FIELD NOTES</p><h2>The ideas that survive<br />when the book ends.</h2></div><article><span>01</span><h3>Plan of attack</h3><ul>{opening.plans.map((plan) => <li key={plan}>{plan}</li>)}</ul></article><article><span>02</span><h3>Common mistake</h3><p>{opening.trap}</p></article><article><span>03</span><h3>How to defend it</h3><p>{opening.defense}</p></article></section>
    <section className="intelligence" aria-label="Live opening intelligence"><div className="intel-heading"><div><p className="eyebrow">LIVE POSITION DESK</p><h2>What the database<br /><em>likes from here.</em></h2></div><p>Current-position move quality, queried from ChessDB’s public analysis database. Use it as a second opinion—not a substitute for understanding the plan.</p></div><div className="intel-body"><div className="intel-status"><span className={`status-dot ${intelligence.status}`}></span><span>{intelligence.status === 'loading' ? 'Reading the position…' : intelligence.status === 'ready' ? `Live at move ${Math.ceil(ply / 2)}` : 'Connection paused'}</span><small>Source: <a href="https://www.chessdb.cn/" target="_blank" rel="noreferrer">ChessDB ↗</a></small></div><div className="intel-moves">{intelligence.status === 'ready' && explorerMoves.length ? explorerMoves.map((move) => <div className="intel-move" key={move.move}><strong>{move.san}</strong><span className="move-bar"><i style={{ width: `${Math.min(100, Math.max(8, Number(move.winrate) || 0))}%` }}></i></span><b>{move.winrate ? `${Number(move.winrate).toFixed(1)}%` : '—'}</b><small>{move.note || 'book'}</small></div>) : <p className="intel-empty">{intelligence.status === 'loading' ? 'Finding the strongest continuations…' : 'No live data for this exact position yet. Explore another point in the line.'}</p>}</div></div></section>
    <section className="engine-lens"><div className="engine-heading"><div><p className="eyebrow">CLOUD ENGINE LENS</p><h2>Ask the engine.<br /><em>Keep your judgment.</em></h2></div><p>Cloud evaluation gives you candidate lines after you have tried to explain the position yourself. Scores are from White’s perspective.</p></div><div className="engine-body"><div className="engine-state"><span className={`status-dot ${engine.status}`}></span><strong>{engine.status === 'ready' ? `Depth ${engine.depth}` : engine.status === 'loading' ? 'Scanning cloud eval…' : 'No cloud entry yet'}</strong>{engine.status === 'ready' && <small>{Math.round((engine.knodes || 0) / 1000).toLocaleString()}k nodes · 3 principal variations</small>}<a href="https://lichess.org/analysis" target="_blank" rel="noreferrer">Open full analysis ↗</a></div><div className="engine-lines">{engine.status === 'ready' && engineLines.length ? engineLines.map((line, index) => <div className="engine-line" key={`${line.moves}-${index}`}><b>{line.evaluation}</b><span>{line.moves.map((move, moveIndex) => <i key={`${move}-${moveIndex}`}>{moveIndex % 2 === 0 ? `${Math.floor(moveIndex / 2) + 1}. ` : ''}{move} </i>)}</span></div>) : <p className="engine-empty">{engine.status === 'loading' ? 'Looking for a deep evaluation of this exact position…' : 'This position is not in the cloud cache yet. That is normal for uncommon branches.'}</p>}</div></div></section>
    <section className="puzzle-zone" id="puzzle-zone"><div className="puzzle-heading"><div><p className="eyebrow">LIVE FROM LICHESS</p><h2>Daily tactical<br /><em>pulse.</em></h2></div><div className="puzzle-meta">{puzzle.status === 'ready' ? <><span>{puzzle.puzzle.rating} RATING</span><span>{puzzle.puzzle.plays.toLocaleString()} SOLVES</span></> : <span>LOADING PUZZLE</span>}</div></div><div className="puzzle-workspace"><div className="puzzle-board">{puzzleGame ? <Board game={puzzleGame} orientation={puzzleSide || 'w'} selected={puzzleSelected} onSquare={handlePuzzleSquare} /> : <div className="puzzle-loading">Finding today’s position…</div>}<p className="puzzle-feedback">{puzzleFeedback}</p></div><div className="puzzle-brief"><p className="eyebrow">CALCULATE, DON’T GUESS</p><h3>{puzzleStep >= (puzzle.puzzle?.solution.length || Infinity) ? 'Line complete.' : 'Your move.'}</h3><p>Start by asking what is forcing. The best tactical decisions are usually checks, captures, or threats.</p>{puzzle.status === 'ready' && <div className="puzzle-tags">{puzzle.puzzle.themes.slice(0, 4).map((theme) => <span key={theme}>{theme.replace(/([A-Z])/g, ' $1')}</span>)}</div>}<button onClick={resetPuzzle}>Reset position <span>↺</span></button><a href="https://lichess.org/training" target="_blank" rel="noreferrer">More Lichess puzzles ↗</a></div></div></section>
    <section className="library" id="library"><div className="library-heading"><div><p className="eyebrow">THE REPERTOIRE ROOM</p><h2>{openings.length} foundational<br /><em>opening systems.</em></h2></div><p>Choose a family, find your line, and take it straight to the board. This is a practical first library—not an intimidating encyclopedia.</p></div><div className="library-controls"><div className="filters">{categories.map((category) => <button key={category} className={filter === category ? 'chosen' : ''} onClick={() => setFilter(category)}>{category}</button>)}</div><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an opening" aria-label="Find an opening" /></label></div><div className="opening-library">{visibleOpenings.map((item) => <button className={`library-opening ${item.id === openingId ? 'selected-opening' : ''}`} onClick={() => selectOpening(item.id)} key={item.id}><span>{item.eco}</span><b>{item.name}</b><small>{item.category} · {item.tempo}</small><i>Study line →</i></button>)}{!visibleOpenings.length && <p className="empty">No opening found. Try another name or family.</p>}</div></section>
    <section className="game-lab" id="game-lab"><div className="lab-heading"><div><p className="eyebrow">YOUR COMPLETE GAME, ONE LAYER AT A TIME</p><h2>The opening is the invitation.<br /><em>The rest is the game.</em></h2></div><p>Opening Atlas now carries you beyond the first moves: train the decisions that convert a familiar position into points.</p></div><div className="lab-tabs">{gameLabs.map((item) => <button onClick={() => setActiveLab(item.id)} className={activeLab === item.id ? 'active' : ''} key={item.id}>{item.label}<strong>{item.title}</strong></button>)}</div><div className="lab-workspace"><div className="lab-board"><p className="eyebrow">{lab.eyebrow}</p><Board game={labGame} orientation="w" onSquare={() => {}} /><p>{lab.mission}</p></div><div className="lab-brief"><p className="eyebrow">THINK BEFORE YOU MOVE</p><h3>{lab.title}</h3><p>{lab.prompt}</p><ol>{lab.focus.map((item) => <li key={item}>{item}</li>)}</ol><button onClick={() => document.querySelector('#study')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Return to opening study <span>↑</span></button></div></div></section>
    <section className="game-review" id="game-review"><div className="review-heading"><div><p className="eyebrow">BRING YOUR OWN GAME</p><h2>Turn a loss into<br /><em>a training plan.</em></h2></div><p>Paste any standard PGN. Atlas reads it locally in your browser and gives you a clean final position to investigate—nothing is uploaded.</p></div><div className="review-workspace"><div className="review-input"><label htmlFor="pgn">PGN / MOVETEXT</label><textarea id="pgn" value={pgnInput} onChange={(event) => setPgnInput(event.target.value)} placeholder={'1. e4 e5 2. Nf3 Nc6 3. Bb5 a6\n\nOr paste a complete PGN export…'} /><button onClick={reviewPgn}>Read my game <span>→</span></button><p>{reviewFeedback}</p></div><div className="review-result">{reviewGame ? <><div className="review-meta"><span>{review.headers.White} vs {review.headers.Black}</span><b>{review.headers.Result}</b></div><Board game={reviewGame} orientation="w" onSquare={() => {}} /><p><strong>{review.moves.length} plies read.</strong> Last moves: {review.moves.slice(-6).join(' · ')}</p></> : <div className="review-placeholder"><span>♞</span><strong>Your final position will land here.</strong><p>Then compare the critical moment with the cloud engine and database above.</p></div>}</div></div></section>
    <section className="curriculum" id="curriculum"><div className="curriculum-top"><div><p className="eyebrow">THE PATH TO STRONG CHESS</p><h2>Train what actually<br /><em>makes you dangerous.</em></h2></div><div className="completion"><span>TRACKS COMPLETE</span><strong>{completedTracks.length}<i>/</i>{curriculum.length}</strong><p>Build a balanced game. Mark a track when you’ve trained it this week.</p></div></div><div className="curriculum-grid">{curriculum.map((track) => <article key={track.id} className={completedTracks.includes(track.id) ? 'done' : ''}><div><span>{track.number}</span><small>{track.level}</small></div><h3>{track.title}</h3><p>{track.detail}</p><ul>{track.tasks.map((task) => <li key={task}>{task}</li>)}</ul><button onClick={() => toggleTrack(track.id)} aria-pressed={completedTracks.includes(track.id)}>{completedTracks.includes(track.id) ? 'Completed this week ✓' : 'Mark as trained'}</button></article>)}</div></section>
    <section className="resource-dock"><div><p className="eyebrow">THE DEEPER TOOLKIT</p><h2>Resources worth<br /><em>having open.</em></h2></div><div className="resource-list">{resourceDock.map((resource) => <a href={resource.href} target="_blank" rel="noreferrer" key={resource.name}><span>{resource.label}</span><strong>{resource.name}</strong><p>{resource.detail}</p><i>Open resource ↗</i></a>)}</div></section>
    <footer><span>OPENING ATLAS — PLAY WITH INTENTION</span><span>Pieces: Cburnett set via Lichess · CC BY-SA</span></footer>
  </main>
}

export default App
