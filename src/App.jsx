import { useMemo, useState } from 'react'
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
  const opening = openings.find((item) => item.id === openingId)
  const game = useMemo(() => { const g = new Chess(); opening.moves.slice(0, ply).forEach((move) => g.move(move)); return g }, [opening, ply])
  const previous = useMemo(() => {
    if (!ply) return null
    const g = new Chess(); opening.moves.slice(0, ply - 1).forEach((move) => g.move(move)); const result = g.move(opening.moves[ply - 1]); return [result.from, result.to]
  }, [opening, ply])
  const nextMove = opening.moves[ply]

  const categories = ['All', ...new Set(openings.map((item) => item.category))]
  const visibleOpenings = openings.filter((item) => (filter === 'All' || item.category === filter) && item.name.toLowerCase().includes(query.toLowerCase()))
  function selectOpening(id) { setOpeningId(id); setPly(0); setMode('study'); setSelected(null); setFeedback('New line loaded. Walk through the opening or start a drill.'); document.querySelector('#study')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  function toggleTheme() { const next = theme === 'light' ? 'dark' : 'light'; setTheme(next); localStorage.setItem('atlas-theme', next) }
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

  return <main className={`app ${theme === 'dark' ? 'dark' : ''}`}>
    <nav><a className="brand" href="#top"><span>♞</span> opening<span>atlas</span></a><div className="nav-links"><a href="#library">Library</a><a href="#study">Study</a><a href="#field-notes">Field notes</a><button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme">{theme === 'light' ? '◐ Dark' : '◑ Light'}</button><button className="streak">⚡ 7 day streak</button></div></nav>
    <section className="hero" id="top"><div><p className="eyebrow">THE FIRST 12 MOVES, REIMAGINED</p><h1>Learn the <em>why</em><br />behind your moves.</h1><p className="hero-copy">A living opening repertoire for people who want to understand the position—not memorize an endless tree.</p><a className="hero-cta" href="#study">Enter the study hall <span>↓</span></a></div><div className="hero-note"><p>Today’s rule</p><strong>“Every opening move should buy you a plan.”</strong><div><span>01 / 04</span><span>WHITE TO MOVE</span></div></div></section>
    <section className="opening-strip" aria-label="Opening selector">{openings.slice(0, 4).map((item, index) => <button key={item.id} onClick={() => selectOpening(item.id)} className={item.id === openingId ? 'active' : ''}><span>0{index + 1}</span><b>{item.name}</b><small>{item.eco} · {item.tempo}</small></button>)}</section>
    <section className="study" id="study"><aside className="repertoire"><p className="eyebrow">REPERTOIRE / {opening.tag}</p><h2>{opening.name}</h2><p>{opening.promise}</p><div className="line"><span>MAIN LINE</span>{opening.moves.map((move, i) => <button key={`${move}-${i}`} onClick={() => { setPly(i + 1); setMode('study') }} className={i === ply - 1 ? 'current' : ''}>{i % 2 === 0 ? `${Math.floor(i / 2) + 1}.` : ''} {move}</button>)}</div><button className="drill-button" onClick={startDrill}>Start move drill <span>→</span></button></aside>
      <div className="board-area"><div className="board-header"><span>{mode === 'drill' ? 'DRILL MODE' : 'EXPLORE THE LINE'}</span><div><button disabled={!ply} onClick={() => setPly((p) => p - 1)}>←</button><span>{ply} / {opening.moves.length}</span><button disabled={ply === opening.moves.length} onClick={() => setPly((p) => p + 1)}>→</button></div></div><Board game={game} selected={selected} onSquare={handleSquare} lastMove={previous} /><p className="feedback">{feedback}</p></div>
      <aside className="coach"><div className="coach-mark">♜</div><p className="eyebrow">POSITION COACH</p><h3>{nextMove ? `The next idea: ${nextMove}` : 'Main line complete'}</h3><p>{nextMove ? `${game.turn() === 'w' ? 'White' : 'Black'} to move. Find the move that carries the opening’s central idea forward.` : 'You have reached the first reference position. Now choose your plan.'}</p><div className="score"><span>DRILL SCORE</span><strong>{String(score).padStart(2, '0')}</strong></div><button onClick={startDrill}>Reset drill</button></aside></section>
    <section className="notes" id="field-notes"><div className="notes-title"><p className="eyebrow">FIELD NOTES</p><h2>The ideas that survive<br />when the book ends.</h2></div><article><span>01</span><h3>Plan of attack</h3><ul>{opening.plans.map((plan) => <li key={plan}>{plan}</li>)}</ul></article><article><span>02</span><h3>Common mistake</h3><p>{opening.trap}</p></article><article><span>03</span><h3>How to defend it</h3><p>{opening.defense}</p></article></section>
    <section className="library" id="library"><div className="library-heading"><div><p className="eyebrow">THE REPERTOIRE ROOM</p><h2>{openings.length} foundational<br /><em>opening systems.</em></h2></div><p>Choose a family, find your line, and take it straight to the board. This is a practical first library—not an intimidating encyclopedia.</p></div><div className="library-controls"><div className="filters">{categories.map((category) => <button key={category} className={filter === category ? 'chosen' : ''} onClick={() => setFilter(category)}>{category}</button>)}</div><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an opening" aria-label="Find an opening" /></label></div><div className="opening-library">{visibleOpenings.map((item) => <button className={`library-opening ${item.id === openingId ? 'selected-opening' : ''}`} onClick={() => selectOpening(item.id)} key={item.id}><span>{item.eco}</span><b>{item.name}</b><small>{item.category} · {item.tempo}</small><i>Study line →</i></button>)}{!visibleOpenings.length && <p className="empty">No opening found. Try another name or family.</p>}</div></section>
    <section className="roadmap"><p className="eyebrow">YOUR COMPLETE GAME, ONE LAYER AT A TIME</p><h2>The opening is the invitation.<br /><em>The rest is the game.</em></h2><div><span>01 / OPENINGS <b>IN SESSION</b></span><span>02 / MIDDLEGAME <i>COMING SOON</i></span><span>03 / ENDGAMES <i>COMING SOON</i></span></div></section>
    <footer><span>OPENING ATLAS — PLAY WITH INTENTION</span><span>Pieces: Cburnett set via Lichess · CC BY-SA</span></footer>
  </main>
}

export default App
