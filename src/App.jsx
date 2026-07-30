import { useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import './App.css'

const openings = [
  {
    id: 'sicilian', tag: 'BLACK REPERTOIRE', name: 'Sicilian Defence', eco: 'B20', tempo: 'Sharp',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    promise: 'Fight for the center from the flank. Unequal positions, real winning chances.',
    plans: ['Hit d4 before White builds', 'Develop with ...e6 or ...g6', 'Use the c-file and queenside'],
    trap: 'Do not rush ...Nxe4. Check whether the knight is tactically defended first.',
    defense: 'Against the Open Sicilian: accept the central tension, then counter on the queenside—not by passively protecting everything.',
  },
  {
    id: 'ruy', tag: 'WHITE REPERTOIRE', name: 'Ruy López', eco: 'C60', tempo: 'Classical',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7'],
    promise: 'A pressure system disguised as a quiet opening. Improve, squeeze, then strike.',
    plans: ['Pressure e5 and keep the bishop', 'Castle early, prepare Re1', 'Build c3 + d4 at the right moment'],
    trap: 'The bishop is not “hanging” on b5—capturing it often hands White the center.',
    defense: 'As Black, do not defend e5 forever. Develop, castle, and challenge the center with ...b5 or ...d5 when prepared.',
  },
  {
    id: 'queens', tag: 'POSITIONAL', name: "Queen's Gambit", eco: 'D06', tempo: 'Stable',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O'],
    promise: 'Claim space, develop naturally, and turn a tiny edge into a long game.',
    plans: ['Pressure d5 with Qc2 or Rc1', 'Develop without blocking the c-pawn', 'Use e4 only after preparation'],
    trap: 'The c-pawn is a lever, not a sacrifice you must recover immediately.',
    defense: 'As Black, use ...c5 or ...e5 to challenge the center; passive piece placement is the actual danger.',
  },
  {
    id: 'caro', tag: 'BLACK REPERTOIRE', name: 'Caro–Kann', eco: 'B10', tempo: 'Solid',
    moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6'],
    promise: 'A durable center with a “good” light-square bishop before the pawn chain closes.',
    plans: ['Develop Bf5 before ...e6', 'Pressure d4 after ...Nf6', 'Castle queenside only with purpose'],
    trap: 'After e4 c6 d4 d5, taking on e4 is sound—trying to hold the center too long is not.',
    defense: 'White wants space and a kingside initiative. Trade a key attacker when it costs you no central control.',
  },
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
  const opening = openings.find((item) => item.id === openingId)
  const game = useMemo(() => { const g = new Chess(); opening.moves.slice(0, ply).forEach((move) => g.move(move)); return g }, [opening, ply])
  const previous = useMemo(() => {
    if (!ply) return null
    const g = new Chess(); opening.moves.slice(0, ply - 1).forEach((move) => g.move(move)); const result = g.move(opening.moves[ply - 1]); return [result.from, result.to]
  }, [opening, ply])
  const nextMove = opening.moves[ply]

  function selectOpening(id) { setOpeningId(id); setPly(0); setMode('study'); setSelected(null); setFeedback('New line loaded. Walk through the opening or start a drill.'); }
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

  return <main className="app">
    <nav><a className="brand" href="#top"><span>♞</span> opening<span>atlas</span></a><div className="nav-links"><a href="#study">Study</a><a href="#field-notes">Field notes</a><button className="streak">⚡ 7 day streak</button></div></nav>
    <section className="hero" id="top"><div><p className="eyebrow">THE FIRST 12 MOVES, REIMAGINED</p><h1>Learn the <em>why</em><br />behind your moves.</h1><p className="hero-copy">A living opening repertoire for people who want to understand the position—not memorize an endless tree.</p><a className="hero-cta" href="#study">Enter the study hall <span>↓</span></a></div><div className="hero-note"><p>Today’s rule</p><strong>“Every opening move should buy you a plan.”</strong><div><span>01 / 04</span><span>WHITE TO MOVE</span></div></div></section>
    <section className="opening-strip" aria-label="Opening selector">{openings.map((item, index) => <button key={item.id} onClick={() => selectOpening(item.id)} className={item.id === openingId ? 'active' : ''}><span>0{index + 1}</span><b>{item.name}</b><small>{item.eco} · {item.tempo}</small></button>)}</section>
    <section className="study" id="study"><aside className="repertoire"><p className="eyebrow">REPERTOIRE / {opening.tag}</p><h2>{opening.name}</h2><p>{opening.promise}</p><div className="line"><span>MAIN LINE</span>{opening.moves.map((move, i) => <button key={`${move}-${i}`} onClick={() => { setPly(i + 1); setMode('study') }} className={i === ply - 1 ? 'current' : ''}>{i % 2 === 0 ? `${Math.floor(i / 2) + 1}.` : ''} {move}</button>)}</div><button className="drill-button" onClick={startDrill}>Start move drill <span>→</span></button></aside>
      <div className="board-area"><div className="board-header"><span>{mode === 'drill' ? 'DRILL MODE' : 'EXPLORE THE LINE'}</span><div><button disabled={!ply} onClick={() => setPly((p) => p - 1)}>←</button><span>{ply} / {opening.moves.length}</span><button disabled={ply === opening.moves.length} onClick={() => setPly((p) => p + 1)}>→</button></div></div><Board game={game} selected={selected} onSquare={handleSquare} lastMove={previous} /><p className="feedback">{feedback}</p></div>
      <aside className="coach"><div className="coach-mark">♜</div><p className="eyebrow">POSITION COACH</p><h3>{nextMove ? `The next idea: ${nextMove}` : 'Main line complete'}</h3><p>{nextMove ? `${game.turn() === 'w' ? 'White' : 'Black'} to move. Find the move that carries the opening’s central idea forward.` : 'You have reached the first reference position. Now choose your plan.'}</p><div className="score"><span>DRILL SCORE</span><strong>{String(score).padStart(2, '0')}</strong></div><button onClick={startDrill}>Reset drill</button></aside></section>
    <section className="notes" id="field-notes"><div className="notes-title"><p className="eyebrow">FIELD NOTES</p><h2>The ideas that survive<br />when the book ends.</h2></div><article><span>01</span><h3>Plan of attack</h3><ul>{opening.plans.map((plan) => <li key={plan}>{plan}</li>)}</ul></article><article><span>02</span><h3>Common mistake</h3><p>{opening.trap}</p></article><article><span>03</span><h3>How to defend it</h3><p>{opening.defense}</p></article></section>
    <section className="roadmap"><p className="eyebrow">YOUR COMPLETE GAME, ONE LAYER AT A TIME</p><h2>The opening is the invitation.<br /><em>The rest is the game.</em></h2><div><span>01 / OPENINGS <b>IN SESSION</b></span><span>02 / MIDDLEGAME <i>COMING SOON</i></span><span>03 / ENDGAMES <i>COMING SOON</i></span></div></section>
    <footer><span>OPENING ATLAS — PLAY WITH INTENTION</span><span>Pieces: Cburnett set via Lichess · CC BY-SA</span></footer>
  </main>
}

export default App
