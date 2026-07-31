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
  { id: 'scandinavian', tag: 'BLACK REPERTOIRE', category: 'Open Game', name: 'Scandinavian Defence', eco: 'B01', tempo: 'Direct', moves: ['e4','d5','exd5','Qxd5','Nc3','Qa5','d4','Nf6','Nf3','c6'], promise: 'Challenge e4 immediately and make White prove that development lead.', plans: ['Develop with ...c6 and ...Bf5', 'Pressure d4', 'Keep the queen safe without losing tempi'], trap: 'Do not leave the queen in the centre just to recover a pawn.', defense: 'White should develop with tempo and use the lead in development before Black completes the setup.' },
  { id: 'alekhine', tag: 'BLACK REPERTOIRE', category: 'Open Game', name: 'Alekhine Defence', eco: 'B02', tempo: 'Provocative', moves: ['e4','Nf6','e5','Nd5','d4','d6','Nf3','Bg4','Be2','e6'], promise: 'Invite the centre forward, then attack the pawns it creates.', plans: ['Target the advanced e5 pawn', 'Strike with ...d6 and ...c5', 'Use piece pressure before trading'], trap: 'Do not retreat the knight forever without challenging the centre.', defense: 'White should build space but avoid turning every pawn advance into a permanent target.' },
  { id: 'modern', tag: 'BLACK REPERTOIRE', category: 'Open Game', name: 'Modern Defence', eco: 'B06', tempo: 'Flexible', moves: ['e4','g6','d4','Bg7','Nc3','d6','Nf3','a6'], promise: 'Delay central commitments while the fianchetto bishop eyes the centre.', plans: ['Finish the fianchetto', 'Choose ...c5 or ...e5 based on White’s setup', 'Counter the centre with pieces'], trap: 'Flexibility is not permission to fall behind in development.', defense: 'White should use the space advantage to develop naturally and open the centre at the right time.' },
  { id: 'qga', tag: 'BLACK REPERTOIRE', category: 'Queen pawn', name: "Queen's Gambit Accepted", eco: 'D20', tempo: 'Classical', moves: ['d4','d5','c4','dxc4','Nf3','Nf6','e3','e6','Bxc4','c5'], promise: 'Temporarily accept the c-pawn to challenge White’s centre on your terms.', plans: ['Return the pawn when development demands it', 'Challenge d4 with ...c5', 'Develop quickly'], trap: 'Trying to keep c4 indefinitely leaves Black far behind in development.', defense: 'White should regain the pawn while using the open lines and lead in development.' },
  { id: 'semislav', tag: 'BLACK REPERTOIRE', category: 'Queen pawn', name: 'Semi-Slav Defence', eco: 'D43', tempo: 'Rich', moves: ['d4','d5','c4','e6','Nc3','Nf6','Nf3','c6','e3','Nbd7'], promise: 'Build a compact centre with many strategic and tactical plans available.', plans: ['Develop the dark bishop deliberately', 'Challenge the centre with ...dxc4 or ...c5', 'Coordinate before breaking'], trap: 'A solid pawn chain can still suffocate your own bishop if you never solve its route.', defense: 'White should use the space and development lead before Black’s structure becomes a fortress.' },
  { id: 'benko', tag: 'BLACK REPERTOIRE', category: 'Queen pawn', name: 'Benko Gambit', eco: 'A57', tempo: 'Sacrificial', moves: ['d4','Nf6','c4','c5','d5','b5','cxb5','a6','bxa6','Bxa6'], promise: 'Trade a pawn for lasting queenside files, active bishops, and practical pressure.', plans: ['Use the a- and b-files', 'Fianchetto the dark bishop', 'Keep queenside activity alive'], trap: 'The gambit is compensation, not a pawn you must win back immediately.', defense: 'White should consolidate the extra pawn while preventing Black’s rooks and bishops from becoming active.' },
  { id: 'trompowsky', tag: 'WHITE REPERTOIRE', category: 'Queen pawn', name: 'Trompowsky Attack', eco: 'A45', tempo: 'Irritating', moves: ['d4','Nf6','Bg5','e6','e4','Be7','Nc3','d5'], promise: 'Ask Black an immediate structural question and sidestep heavy Indian theory.', plans: ['Decide whether to trade on f6', 'Build e4 with purpose', 'Develop before committing the centre'], trap: 'Giving up the bishop only helps if the doubled pawns or lost knight matter.', defense: 'Black should meet the pin with calm development and challenge White’s centre.' },
  { id: 'colle', tag: 'WHITE REPERTOIRE', category: 'Queen pawn', name: 'Colle System', eco: 'D05', tempo: 'Systematic', moves: ['d4','d5','Nf3','Nf6','e3','e6','Bd3','c5','c3'], promise: 'A compact development scheme that prepares the central e4 break.', plans: ['Complete Nbd2 and O-O', 'Prepare e4', 'Keep the light bishop’s route clear'], trap: 'A system is a setup, not an excuse to ignore Black’s active counterplay.', defense: 'Black should use ...c5 and piece pressure to make e4 harder to achieve.' },
  { id: 'fourknights', tag: 'WHITE REPERTOIRE', category: 'Open Game', name: 'Four Knights Game', eco: 'C47', tempo: 'Natural', moves: ['e4','e5','Nf3','Nc6','Nc3','Nf6','Bb5','Bb4'], promise: 'Develop quickly into a classical position with less memorisation than the Ruy.', plans: ['Castle and challenge the centre', 'Use d4 at the right moment', 'Avoid unnecessary exchanges'], trap: 'Natural development still needs a central plan after the knights are out.', defense: 'Black can equalise through active central pressure and timely ...d5.' },
  { id: 'ponziani', tag: 'WHITE REPERTOIRE', category: 'Open Game', name: 'Ponziani Opening', eco: 'C44', tempo: 'Ambitious', moves: ['e4','e5','Nf3','Nc6','c3','Nf6','d4'], promise: 'Support d4 immediately and challenge Black before the position becomes symmetrical.', plans: ['Build the centre with d4', 'Develop the queen bishop efficiently', 'Watch the e4 pawn'], trap: 'The c3 move costs a tempo if White never follows through with d4.', defense: 'Black should hit the centre before White’s pieces get ideal squares.' },
]

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const randomCoordinate = () => `${files[Math.floor(Math.random() * files.length)]}${Math.floor(Math.random() * 8) + 1}`
const pieceName = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' }
const pieceSrc = (piece) => `https://lichess1.org/assets/piece/cburnett/${piece.color === 'w' ? 'w' : 'b'}${piece.type.toUpperCase()}.svg`
const workspacePages = ['home', 'openings', 'practice', 'analysis', 'review', 'scout', 'learn']
const practiceRouteTargets = { tactics: 'puzzle-zone', middlegame: 'game-lab', structures: 'structure-atlas', endgames: 'endgame-route' }
const revisionIntervals = [1, 3, 7, 14, 30]
const pageFromLocation = () => {
  const page = window.location.pathname.split('/').filter(Boolean)[0] || 'home'
  return workspacePages.includes(page) ? page : 'home'
}
const openingFromLocation = () => {
  const [, openingId] = window.location.pathname.split('/').filter(Boolean)
  return openings.some((opening) => opening.id === openingId) ? openingId : 'sicilian'
}
const practiceTargetFromLocation = () => {
  const [page, route] = window.location.pathname.split('/').filter(Boolean)
  return page === 'practice' ? practiceRouteTargets[route] || null : null
}
const learnPathFromLocation = () => {
  const [page, route] = window.location.pathname.split('/').filter(Boolean)
  return page === 'learn' && capabilityPaths.some((item) => item.id === route) ? route : 'foundation'
}
const sharedAnalysisFromLocation = () => {
  if (pageFromLocation() !== 'analysis') return null
  const fen = new URLSearchParams(window.location.search).get('fen')
  if (!fen) return null
  try { return { fen: new Chess(fen).fen(), label: 'Shared position' } } catch { return null }
}

const gameLabs = [
  { id: 'middle', label: '02 / MIDDLEGAME', title: 'Central tension', eyebrow: 'MIDDLEGAME LAB', fen: 'r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N1PN2/PPQNBPPP/R3K2R w KQ - 0 8', answer: 'e4', mission: 'Before calculating, name the pawn break that changes the position.', focus: ['Identify the tension', 'Find the worst-placed piece', 'Calculate forcing replies first'], prompt: 'White has more space. Is e4 or cxd5 the break that actually improves the pieces?', insight: 'Exactly. e4 claims the centre while opening lines for White’s pieces. The point is not to trade tension automatically—it is to make Black react to your space.' },
  { id: 'end', label: '03 / ENDGAMES', title: 'King & pawn geometry', eyebrow: 'ENDGAME LAB', fen: '8/4k3/8/3K4/3P4/8/8/8 w - - 0 1', answer: 'Kc6', mission: 'Use opposition and the square rule to turn a pawn into a queen.', focus: ['Activate the king', 'Count the pawn’s square', 'Keep the opposition'], prompt: 'White to move. Can the king escort d4 safely, or must it gain opposition first?', insight: 'Correct. Kc6 takes the opposition. Now Black’s king must yield a route, and the d-pawn has an escort instead of racing alone.' },
]

const modelStudies = [
  { id: 'opera', phase: 'OPENING MODEL', title: 'The Opera Game', byline: 'Paul Morphy · Paris, 1858', moves: ['e4','e5','Nf3','d6','d4','Bg4','dxe5','Bxf3','Qxf3','dxe5','Bc4','Nf6','Qb3','Qe7','Nc3','c6','Bg5','b5','Nxb5','cxb5','Bxb5+','Nbd7','O-O-O','Rd8','Rxd7','Rxd7','Rd1','Qe6','Bxd7+','Nxd7','Qb8+','Nxb8','Rd8#'], annotations: [{ ply: 0, title: 'Development is a race', text: 'Before calculating an attack, compare development and king safety. Morphy’s moves keep bringing pieces into the game with tempo.' }, { ply: 10, title: 'Do not collect the pawn', text: 'Black’s position has gained material only on paper. White has opened lines while the black king is still waiting for shelter.' }, { ply: 23, title: 'The open file is the invitation', text: 'Castling long connects the rook to d1. From here, every forcing move attacks the defender’s undeveloped pieces.' }] },
  { id: 'tension', phase: 'MIDDLEGAME MODEL', title: 'Release the right tension', byline: 'Queen’s Gambit structure · instructional sequence', moves: ['d4','d5','c4','e6','Nc3','Nf6','Bg5','Be7','e3','O-O','Nf3','h6','Bh4','b6','cxd5','Nxd5','Bxe7','Qxe7','Nxd5','exd5'], annotations: [{ ply: 0, title: 'Name the imbalance first', text: 'The position begins balanced. The useful question is not “what move looks active?” but which exchange makes your pieces better.' }, { ply: 14, title: 'Pressure is a choice', text: 'Black has spent tempi on the queenside while White has finished development. This is the moment to compare activity before releasing central tension.' }, { ply: 20, title: 'Structure writes the next plan', text: 'After the exchange, Black owns an isolated central pawn. That does not win by itself—it tells White what to pressure, and Black what to activate.' }] },
  { id: 'opposition', phase: 'ENDGAME MODEL', title: 'Take the opposition', byline: 'King-and-pawn conversion · instructional sequence', fen: '8/4k3/8/3K4/3P4/8/8/8 w - - 0 1', moves: ['Kc6','Kd8','Kd6','Kc8','Kc6','Kd8','d5'], annotations: [{ ply: 0, title: 'The king is the piece that wins', text: 'Do not push the pawn because it is available. First put the king where it makes the defender yield a square.' }, { ply: 3, title: 'Keep the defender boxed out', text: 'Kc6 claims the opposition. Notice that the pawn has not moved: the position changes because the king has improved.' }, { ply: 7, title: 'Only now does the pawn run', text: 'Once the king has made the route safe, d5 is no longer a hopeful push—it is a supported conversion plan.' }] },
]

const endgameRoute = [
  { id: 'opposition', number: '01', title: 'Opposition', level: 'King & pawn', fen: '8/4k3/8/3K4/3P4/8/8/8 w - - 0 1', rule: 'If kings face each other with one square between them, the side not to move owns the opposition.', mission: 'Use the king—not the pawn—to make the defender give ground.' },
  { id: 'square', number: '02', title: 'The square rule', level: 'Pawn races', fen: '7k/8/8/P7/8/8/8/7K w - - 0 1', rule: 'Draw an imaginary square from the pawn to promotion. If the king can enter it, the pawn cannot run alone.', mission: 'Count before you calculate. Pawn races are geometry first.' },
  { id: 'lucena', number: '03', title: 'Lucena bridge', level: 'Rook endings', fen: '8/8/2k5/3p4/3PK3/8/8/3R4 w - - 0 1', rule: 'With a rook pawn on the seventh and your king in front, build a bridge to cut checks.', mission: 'Learn the construction; do not push the pawn until the king has shelter.' },
  { id: 'philidor', number: '04', title: 'Philidor defence', level: 'Rook endings', fen: '8/8/3k4/3p4/3PK3/8/8/3r4 w - - 0 1', rule: 'Keep the enemy king from the sixth rank; once it reaches it, check from behind.', mission: 'Defence is active: use the rook’s range, not passive waiting.' },
  { id: 'wrong-bishop', number: '05', title: 'Wrong bishop', level: 'Draw knowledge', fen: 'k7/8/P1K5/8/8/8/8/2B5 w - - 0 1', rule: 'A rook pawn with a bishop of the wrong colour is drawn if the defending king reaches the corner.', mission: 'Know this before trading into it. Material advantage is not always a win.' },
  { id: 'queen-pawn', number: '06', title: 'Queen vs pawn', level: 'Precision', fen: '8/1k6/8/7P/8/6K1/8/3Q4 w - - 0 1', rule: 'Against an advanced pawn, checks and king placement matter more than grabbing it immediately.', mission: 'Keep the pawn under control while driving the king away.' },
]

const planningFramework = [
  { id: 'king', number: '01', title: 'King safety', question: 'Whose king has fewer safe squares if the centre opens right now?', action: 'If your king is less safe, reduce tension or create luft before starting an attack.' },
  { id: 'material', number: '02', title: 'Material', question: 'Who is ahead, and what kind of exchange makes that advantage easier to use?', action: 'When ahead, simplify without releasing activity; when behind, preserve imbalance and pieces.' },
  { id: 'activity', number: '03', title: 'Piece activity', question: 'Which piece is doing the least, and what is its best improving square?', action: 'Improve the worst piece before launching a plan unless there is a forcing tactical reason not to.' },
  { id: 'structure', number: '04', title: 'Pawn structure', question: 'Which pawn break changes the board in your favour, and which one must you prevent?', action: 'A break is a commitment: calculate the opened files and weak squares it leaves behind.' },
  { id: 'space', number: '05', title: 'Space & squares', question: 'Which side controls more useful territory, and where can the cramped side challenge it?', action: 'Use space to manoeuvre; use counterplay to stop the opponent from turning space into a squeeze.' },
  { id: 'targets', number: '06', title: 'Targets', question: 'What is the least-defended pawn, square, or piece after both sides finish developing?', action: 'Create a second weakness. One target can usually be defended; two force a decision.' },
]

const curriculum = [
  { id: 'opening', number: '01', title: 'Opening fluency', level: 'Foundation', detail: 'Know your first plans, not just your first moves.', tasks: ['Play 3 move drills', 'Explain one pawn break', 'Review one loss'] },
  { id: 'tactics', number: '02', title: 'Tactical vision', level: 'Every day', detail: 'Calculate forcing moves before you calculate pretty moves.', tasks: ['Checks first', 'Captures second', 'Threats third'] },
  { id: 'middle', number: '03', title: 'Middlegame plans', level: 'Pattern work', detail: 'Turn structure, space, and weak squares into a practical plan.', tasks: ['Name the imbalance', 'Improve worst piece', 'Choose the break'] },
  { id: 'end', number: '04', title: 'Endgame technique', level: 'Essential', detail: 'Convert the positions that decide long games.', tasks: ['King activity', 'Pawn races', 'Basic opposition'] },
]

const pawnStructures = [
  { id: 'carlsbad', title: 'Carlsbad', label: 'Queen’s Gambit', signal: 'White has a pawn on d4 and Black has one on d5; the c-pawns have traded.', plan: 'White often expands with the minority attack: b4–b5 to create a queenside weakness. Black looks for kingside space or the freeing ...c5 break.', breaks: 'White: b4–b5 or e4 · Black: ...c5 or ...e5', warning: 'Do not launch b4–b5 until your pieces can use the c-file and the queenside weaknesses it creates.' },
  { id: 'isolani', title: 'Isolated queen pawn', label: 'Dynamic weakness', signal: 'One side has a lone d-pawn with no c- or e-pawn to protect it.', plan: 'With the IQP: use space, open lines, and activity before the endgame. Against it: blockade d4/d5 and trade active pieces.', breaks: 'With IQP: d5 · Against IQP: pressure the blockading square', warning: 'An isolated pawn is not automatically bad. It buys active squares and open files while pieces remain.' },
  { id: 'hanging', title: 'Hanging pawns', label: 'c- and d-pawns', signal: 'Connected central pawns sit on c4/d4 or c5/d5 with no neighboring pawn support.', plan: 'The side with the pawns wants activity and a timely advance; the defender wants blockades and targets.', breaks: 'Advance one pawn at the moment it gains space or opens a line', warning: 'If both pawns are merely defended, they can become two fixed targets. Play actively before that happens.' },
  { id: 'french', title: 'French chain', label: 'Closed centre', signal: 'White’s e5–d4 chain points kingside; Black’s d5–e6 chain points queenside.', plan: 'Attack the base of the opponent’s chain. White often uses f4–f5; Black often uses ...c5 to challenge d4.', breaks: 'White: f4–f5 · Black: ...c5 or ...f6', warning: 'Flank attacks work because the centre is closed. If it opens, king safety must be reassessed first.' },
  { id: 'sicilian', title: 'Open Sicilian', label: 'Asymmetry', signal: 'White has a central e-pawn and Black has a half-open c-file after ...cxd4.', plan: 'White normally uses development and kingside pressure. Black uses the c-file, queenside expansion, and pressure on d4.', breaks: 'White: e5 or f4 · Black: ...d5 or ...b5', warning: 'Do not copy plans blindly: the exact pawn structure decides whether a kingside attack is real or fantasy.' },
]

const resourceDock = [
  { label: 'Study builder', name: 'Lichess Studies', detail: 'Build annotated chapters and variations around your own repertoire.', href: 'https://lichess.org/study' },
  { label: 'Analysis board', name: 'Lichess Analysis', detail: 'Explore a position, add branches, and inspect your own games.', href: 'https://lichess.org/analysis' },
  { label: 'Endgame truth', name: 'Lichess Tablebase', detail: 'Probe perfect-play positions with seven pieces or fewer.', href: 'https://tablebase.lichess.ovh/' },
  { label: 'Open database', name: 'Lichess Database', detail: 'Download public games for deeper, offline research.', href: 'https://database.lichess.org/' },
]

const tacticPatterns = [
  { id: 'fork', title: 'Fork', level: 'Foundation', cue: 'One piece attacks two targets. Which target cannot be saved?', check: 'Scan for knight jumps, pawn forks, and queen forks before calculating a long line.' },
  { id: 'pin', title: 'Pin', level: 'Foundation', cue: 'A defender is overloaded because moving exposes something more valuable.', check: 'Ask whether the pin is absolute, relative, or only a visual distraction.' },
  { id: 'skewer', title: 'Skewer', level: 'Foundation', cue: 'Force the valuable piece away, then collect what stood behind it.', check: 'Line up queens, kings, and rooks on open files, ranks, and diagonals.' },
  { id: 'discoveredAttack', title: 'Discovery', level: 'Foundation', cue: 'Move one piece and reveal the attack that was already waiting.', check: 'Find blockers in front of bishops, rooks, and queens; the best move may attack twice.' },
  { id: 'deflection', title: 'Deflection', level: 'Advanced', cue: 'Drag a defender off the one square it must guard.', check: 'Name the defender’s job before sacrificing against it.' },
  { id: 'attraction', title: 'Attraction', level: 'Advanced', cue: 'Lure a king or piece onto a tactically poisoned square.', check: 'Check whether the destination becomes vulnerable to a fork, pin, or mating net.' },
  { id: 'clearance', title: 'Clearance', level: 'Advanced', cue: 'Vacate a square, file, or diagonal for the decisive follow-up.', check: 'Look for a piece that is accidentally blocking your strongest line.' },
  { id: 'xRayAttack', title: 'X-ray', level: 'Advanced', cue: 'A long-range piece attacks through a target toward something behind it.', check: 'Notice batteries even when the first target appears adequately defended.' },
  { id: 'backRankMate', title: 'Back-rank mate', level: 'Mate patterns', cue: 'The king’s own pawns remove its flight squares.', check: 'Before every rook or queen check, count escape squares and defensive interpositions.' },
  { id: 'sacrifice', title: 'Sacrifice', level: 'Calculation', cue: 'Material is given up for forcing moves, activity, or a concrete payoff.', check: 'Calculate checks, captures, and threats to a stable finish—not merely to the first flashy move.' },
]

const journalAreas = [
  { id: 'opening', label: 'Openings', cue: 'Line recall + plan' },
  { id: 'tactics', label: 'Tactics', cue: 'Calculate forcing moves' },
  { id: 'middle', label: 'Middlegame', cue: 'Structure + plan' },
  { id: 'end', label: 'Endgames', cue: 'Technique + conversion' },
]
const capabilityPaths = [
  { id: 'foundation', number: '01', title: 'Foundation', signal: 'You want a stable game and fewer one-move losses.', focus: ['Choose one White opening', 'Solve forcing tactics daily', 'Learn opposition + square rule'], target: '#repertoire-rail', action: 'Build your base' },
  { id: 'improver', number: '02', title: 'Improver', signal: 'You know the rules, but plans disappear after the opening.', focus: ['Use the Position Compass', 'Name one pawn break', 'Review a game each week'], target: '#planning-compass', action: 'Build your plans' },
  { id: 'competitive', number: '03', title: 'Competitive', signal: 'You play regularly and need focused feedback from your own games.', focus: ['Import PGNs', 'Save repeat mistakes', 'Balance your weekly work'], target: '#game-review', action: 'Review your games' },
  { id: 'advanced', number: '04', title: 'Advanced study', signal: 'You can explain a plan and now need to test its concrete limits.', focus: ['Use cloud candidate lines', 'Probe tablebase positions', 'Study your repertoire branches'], target: '#position-desk', action: 'Interrogate positions' },
]
const weekStamp = () => {
  const date = new Date()
  const monday = new Date(date)
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return monday.toISOString().slice(0, 10)
}
const dayStamp = () => new Date().toISOString().slice(0, 10)

function Board({ game, orientation = 'w', onSquare, selected, lastMove }) {
  const squares = useMemo(() => {
    const rankOrder = orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8]
    const fileOrder = orientation === 'w' ? files : [...files].reverse()
    return rankOrder.flatMap((rank) => fileOrder.map((file) => `${file}${rank}`))
  }, [orientation])
  const legalTargets = useMemo(() => {
    if (!selected) return new Set()
    try { return new Set(game.moves({ square: selected, verbose: true }).map((move) => move.to)) } catch { return new Set() }
  }, [game, selected])
  return <div className="board-shell"><div className="board" role="grid" aria-label="Chessboard">
    {squares.map((square, index) => {
      const piece = game.get(square)
      const isLast = lastMove?.includes(square)
      return <button key={square} className={`square ${(Math.floor(index / 8) + index) % 2 ? 'dark' : 'light'} ${selected === square ? 'selected' : ''} ${legalTargets.has(square) ? 'legal' : ''} ${isLast ? 'last' : ''}`} onClick={() => onSquare(square)} aria-label={`${square}${legalTargets.has(square) ? ', legal destination' : ''}`}>
        {index % 8 === 0 && <span className="rank-label">{square[1]}</span>}
        {index >= 56 && <span className="file-label">{square[0]}</span>}
        {piece && <img draggable="false" src={pieceSrc(piece)} alt={`${piece.color === 'w' ? 'White' : 'Black'} ${pieceName[piece.type]}`} />}
      </button>
    })}
  </div></div>
}

function App() {
  const [page, setPage] = useState(pageFromLocation)
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [commandIndex, setCommandIndex] = useState(0)
  const [openingId, setOpeningId] = useState(openingFromLocation)
  const [ply, setPly] = useState(8)
  const [mode, setMode] = useState('study')
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState('Pick a square, then make the next book move.')
  const [score, setScore] = useState(0)
  const [theme, setTheme] = useState(() => localStorage.getItem('atlas-theme') || 'light')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [railFilter, setRailFilter] = useState('All')
  const [orientation, setOrientation] = useState('w')
  const [coordinateTarget, setCoordinateTarget] = useState(randomCoordinate)
  const [coordinateScore, setCoordinateScore] = useState(0)
  const [coordinateStreak, setCoordinateStreak] = useState(0)
  const [coordinateFeedback, setCoordinateFeedback] = useState('Find the named square without counting from the edge.')
  const [activeLab, setActiveLab] = useState('middle')
  const [activeModel, setActiveModel] = useState('opera')
  const [modelPly, setModelPly] = useState(0)
  const [activeEndgame, setActiveEndgame] = useState('opposition')
  const [activePlanningLens, setActivePlanningLens] = useState('king')
  const [activeStructure, setActiveStructure] = useState('carlsbad')
  const [activeCapability, setActiveCapability] = useState(learnPathFromLocation)
  const [labSelected, setLabSelected] = useState(null)
  const [labFeedback, setLabFeedback] = useState('Choose a piece, then make the move that proves the idea.')
  const [labSolved, setLabSolved] = useState(false)
  const [labLastMove, setLabLastMove] = useState(null)
  const [labFen, setLabFen] = useState(gameLabs[0].fen)
  const [labReflection, setLabReflection] = useState('')
  const [labReflections, setLabReflections] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('atlas-lab-reflections') || '[]'); return Array.isArray(saved) ? saved : [] } catch { return [] }
  })
  const [intelligence, setIntelligence] = useState({ status: 'loading', moves: [] })
  const [openingIntelligence, setOpeningIntelligence] = useState({ status: 'loading', moves: [] })
  const [openingPulse, setOpeningPulse] = useState({ status: 'loading', pulse: [] })
  const [puzzle, setPuzzle] = useState({ status: 'loading' })
  const [puzzleFen, setPuzzleFen] = useState(null)
  const [puzzleSide, setPuzzleSide] = useState(null)
  const [puzzleStep, setPuzzleStep] = useState(0)
  const [puzzleSelected, setPuzzleSelected] = useState(null)
  const [puzzleFeedback, setPuzzleFeedback] = useState('Load the position and find the forcing move.')
  const [engine, setEngine] = useState({ status: 'loading', pvs: [] })
  const [analysisPosition, setAnalysisPosition] = useState(sharedAnalysisFromLocation)
  const [shareFeedback, setShareFeedback] = useState('')
  const [analysisSelected, setAnalysisSelected] = useState(null)
  const [analysisFeedback, setAnalysisFeedback] = useState('Choose a piece, then test the candidate move you would actually play.')
  const [fenDraft, setFenDraft] = useState('')
  const [fenFeedback, setFenFeedback] = useState('Paste a FEN or choose a phase preset to open a live analysis desk.')
  const [tablebase, setTablebase] = useState({ status: 'idle', moves: [] })
  const [profileName, setProfileName] = useState('')
  const [profile, setProfile] = useState({ status: 'idle' })
  const [lichessTv, setLichessTv] = useState({ status: 'loading', games: [] })
  const [activePattern, setActivePattern] = useState('fork')
  const [reviewedPatterns, setReviewedPatterns] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('atlas-patterns') || '[]'); return Array.isArray(saved) ? saved : [] } catch { return [] }
  })
  const [savedOpenings, setSavedOpenings] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('atlas-repertoire') || '[]'); return Array.isArray(saved) ? saved : [] } catch { return [] }
  })
  const [revisionItems, setRevisionItems] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('atlas-revision-items') || '[]'); return Array.isArray(saved) ? saved : [] } catch { return [] }
  })
  const [journal, setJournal] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('atlas-journal') || '{}')
      return saved.week === weekStamp() && saved.minutes ? saved : { week: weekStamp(), minutes: {} }
    } catch { return { week: weekStamp(), minutes: {} } }
  })
  const [pgnInput, setPgnInput] = useState('')
  const [review, setReview] = useState(null)
  const [reviewPly, setReviewPly] = useState(0)
  const [reviewFeedback, setReviewFeedback] = useState('Paste a PGN to make its final position your next study position.')
  const [focusArea, setFocusArea] = useState('middle')
  const [focusDraft, setFocusDraft] = useState('')
  const [focusItems, setFocusItems] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('atlas-focus-items') || '[]'); return Array.isArray(saved) ? saved : [] } catch { return [] }
  })
  const [mistakeBook, setMistakeBook] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('atlas-mistake-book') || '[]'); return Array.isArray(saved) ? saved : [] } catch { return [] }
  })
  const [completedTracks, setCompletedTracks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('atlas-tracks') || '[]')
      return Array.isArray(saved) ? saved : []
    } catch { return [] }
  })
  const [sessionChecks, setSessionChecks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('atlas-session-checks') || '{}')
      return saved.date === dayStamp() && Array.isArray(saved.items) ? saved.items : []
    } catch { return [] }
  })
  const [lifetimeStats, setLifetimeStats] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('atlas-lifetime-stats') || '{}')
      return saved && typeof saved === 'object' ? saved : {}
    } catch { return {} }
  })
  const [openingNotes, setOpeningNotes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('atlas-opening-notes') || '{}')
      return saved && typeof saved === 'object' ? saved : {}
    } catch { return {} }
  })
  const opening = openings.find((item) => item.id === openingId)
  const game = useMemo(() => { const g = new Chess(); opening.moves.slice(0, ply).forEach((move) => g.move(move)); return g }, [opening, ply])
  const previous = useMemo(() => {
    if (!ply) return null
    const g = new Chess(); opening.moves.slice(0, ply - 1).forEach((move) => g.move(move)); const result = g.move(opening.moves[ply - 1]); return [result.from, result.to]
  }, [opening, ply])
  const nextMove = opening.moves[ply]
  const currentFen = game.fen()
  const activeFen = analysisPosition?.fen || currentFen
  const activePieceCount = activeFen.split(' ')[0].replace(/[1-8/]/g, '').length
  const materialLedger = useMemo(() => {
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
    const names = { p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q' }
    const side = { w: { total: 0, pieces: { p: 0, n: 0, b: 0, r: 0, q: 0 } }, b: { total: 0, pieces: { p: 0, n: 0, b: 0, r: 0, q: 0 } } }
    new Chess(activeFen).board().flat().filter(Boolean).forEach((piece) => { side[piece.color].total += values[piece.type]; if (piece.type !== 'k') side[piece.color].pieces[piece.type] += 1 })
    const describe = (color) => Object.entries(side[color].pieces).filter(([, count]) => count).map(([piece, count]) => `${names[piece]}${count > 1 ? `×${count}` : ''}`).join(' · ')
    const edge = side.w.total - side.b.total
    return { white: side.w, black: side.b, whitePieces: describe('w'), blackPieces: describe('b'), verdict: edge === 0 ? 'Material level' : edge > 0 ? `White +${edge}` : `Black +${Math.abs(edge)}` }
  }, [activeFen])
  const activePositionLabel = analysisPosition?.label || `${opening.name}, move ${Math.ceil(ply / 2)}`
  const lichessAnalysisLink = `https://lichess.org/analysis/${encodeURIComponent(activeFen).replace(/%20/g, '_')}`
  const lab = gameLabs.find((item) => item.id === activeLab)
  const modelStudy = modelStudies.find((item) => item.id === activeModel)
  const endgameLesson = endgameRoute.find((item) => item.id === activeEndgame)
  const planningLens = planningFramework.find((item) => item.id === activePlanningLens)
  const pawnStructure = pawnStructures.find((item) => item.id === activeStructure)
  const capability = capabilityPaths.find((item) => item.id === activeCapability)
  const pattern = tacticPatterns.find((item) => item.id === activePattern)
  const labGame = useMemo(() => new Chess(labFen), [labFen])
  const modelGame = useMemo(() => {
    const game = new Chess(modelStudy.fen)
    modelStudy.moves.slice(0, modelPly).forEach((move) => game.move(move))
    return game
  }, [modelStudy, modelPly])
  const modelLastMove = useMemo(() => {
    if (!modelPly) return null
    const game = new Chess(modelStudy.fen)
    modelStudy.moves.slice(0, modelPly).forEach((move) => game.move(move))
    const last = game.history({ verbose: true }).at(-1)
    return last ? [last.from, last.to] : null
  }, [modelStudy, modelPly])
  const modelAnnotation = useMemo(() => [...modelStudy.annotations].reverse().find((item) => modelPly >= item.ply) || modelStudy.annotations[0], [modelStudy, modelPly])
  const puzzleGame = useMemo(() => puzzleFen ? new Chess(puzzleFen) : null, [puzzleFen])
  const reviewGame = useMemo(() => review ? new Chess(review.fens[reviewPly]) : null, [review, reviewPly])
  const reviewMove = review?.moves[reviewPly - 1]
  const reviewMoment = useMemo(() => {
    if (!reviewMove) return 'Initial position. Before you move forward, name the opening’s first claim on the centre.'
    if (reviewMove.captured) return `${reviewMove.san} changes the material balance. Ask whether the recapture or resulting piece activity was more important.`
    if (reviewMove.piece === 'p') return `${reviewMove.san} is irreversible. Check which squares, files, and pawn breaks it changed forever.`
    if (reviewMove.flags.includes('k') || reviewMove.flags.includes('q')) return `${reviewMove.san} changes king safety and rook coordination. Compare both sides’ fastest plan.`
    return `${reviewMove.san} is a developing or manoeuvring decision. Ask what it attacks, what it stops, and what it leaves behind.`
  }, [reviewMove])
  const explorerMoves = useMemo(() => intelligence.moves.slice(0, 5).map((move) => {
    const test = new Chess(activeFen)
    try { return { ...move, san: test.move({ from: move.move.slice(0, 2), to: move.move.slice(2, 4), promotion: move.move[4] })?.san } } catch { return { ...move, san: move.move } }
  }), [intelligence.moves, activeFen])
  const openingExplorerMoves = useMemo(() => openingIntelligence.moves.slice(0, 4).map((move) => {
    const test = new Chess(currentFen)
    try { return { ...move, san: test.move({ from: move.move.slice(0, 2), to: move.move.slice(2, 4), promotion: move.move[4] })?.san || move.move } } catch { return { ...move, san: move.move } }
  }), [openingIntelligence.moves, currentFen])
  const engineLines = useMemo(() => engine.pvs.map((pv) => {
    const test = new Chess(activeFen)
    const moves = pv.moves.split(' ').slice(0, 7).map((uci) => {
      try { return test.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })?.san } catch { return null }
    }).filter(Boolean)
    const evaluation = Number.isInteger(pv.mate) ? `M${pv.mate > 0 ? '+' : ''}${pv.mate}` : `${pv.cp >= 0 ? '+' : ''}${(pv.cp / 100).toFixed(2)}`
    return { ...pv, moves, evaluation }
  }), [engine.pvs, activeFen])
  const engineVerdict = useMemo(() => {
    const best = engine.pvs?.[0]
    if (!best) return null
    if (Number.isInteger(best.mate)) return best.mate > 0
      ? { title: 'White has a forced finish', detail: `The cloud line sees mate in ${Math.abs(best.mate)}. Check the forcing moves before trusting the number.` }
      : { title: 'Black has a forced finish', detail: `The cloud line sees mate in ${Math.abs(best.mate)}. Look for the threat before continuing the game.` }
    const cp = Number(best.cp || 0)
    if (Math.abs(cp) < 35) return { title: 'The position is roughly balanced', detail: 'There is no shortcut in the number. Compare plans, king safety, and the next pawn break.' }
    if (cp > 150) return { title: 'White has a clear practical edge', detail: 'Keep the initiative: improve the worst piece, then use the more active side of the board.' }
    if (cp < -150) return { title: 'Black has a clear practical edge', detail: 'Look for Black’s active resource; passive defence is often the way the edge becomes decisive.' }
    return cp > 0 ? { title: 'White is a little more comfortable', detail: 'The position is still playable. Identify the small pressure point instead of forcing a tactic.' } : { title: 'Black is a little more comfortable', detail: 'The position is still playable. Ask what Black can improve before the centre changes.' }
  }, [engine.pvs])
  const pulseMoves = useMemo(() => openingPulse.pulse.map((row) => {
    if (!row.move) return { ...row, san: '—' }
    const test = new Chess(row.fen)
    try { return { ...row, san: test.move({ from: row.move.move.slice(0, 2), to: row.move.move.slice(2, 4), promotion: row.move.move[4] })?.san || row.move.move } } catch { return { ...row, san: row.move.move } }
  }), [openingPulse.pulse])
  const profileSignals = useMemo(() => {
    if (profile.status !== 'ready') return null
    const formats = Object.entries(profile.perfs || {}).filter(([key, perf]) => key !== 'puzzle' && Number(perf.games) > 0)
    const primary = formats.sort(([, a], [, b]) => Number(b.games) - Number(a.games))[0]
    const totalGames = Number(profile.count?.all || 0)
    const ratedGames = Number(profile.count?.rated || 0)
    const hours = Math.round(Number(profile.playTime?.total || 0) / 3600)
    const years = profile.createdAt ? Math.max(0, Math.floor((Date.now() - Number(profile.createdAt)) / 31557600000)) : null
    const historyName = primary?.[0]?.replace(/[\s_-]/g, '').toLowerCase()
    const historyRow = (profile.ratingHistory || []).find((row) => row.name?.replace(/[\s_-]/g, '').toLowerCase() === historyName)
    const ratingPoints = (historyRow?.points || []).slice(-18).filter((point) => Number.isFinite(Number(point?.[3])))
    const firstRating = Number(ratingPoints[0]?.[3] || 0)
    const latestRating = Number(ratingPoints.at(-1)?.[3] || 0)
    const range = Math.max(1, ...ratingPoints.map((point) => Number(point[3])) ) - Math.min(...ratingPoints.map((point) => Number(point[3])))
    return {
      primary: primary ? { name: primary[0].replace(/([A-Z])/g, ' $1'), games: Number(primary[1].games || 0) } : null,
      ratedShare: totalGames ? Math.round((ratedGames / totalGames) * 100) : 0,
      hours,
      years,
      ratingPoints: ratingPoints.map((point) => ({ rating: Number(point[3]), date: `${point[0]}-${String(Number(point[1]) + 1).padStart(2, '0')}-${String(point[2]).padStart(2, '0')}`, height: range ? 22 + ((Number(point[3]) - Math.min(...ratingPoints.map((entry) => Number(entry[3])))) / range) * 78 : 60 })),
      ratingDelta: latestRating - firstRating,
      latestRating,
    }
  }, [profile])

  const categories = ['All', ...new Set(openings.map((item) => item.category))]
  const visibleOpenings = openings.filter((item) => (filter === 'All' || item.category === filter) && item.name.toLowerCase().includes(query.toLowerCase()))
  const railOpenings = openings.filter((item) => railFilter === 'All' || item.tag === railFilter)
  const repertoireQueue = useMemo(() => savedOpenings.map((id) => openings.find((item) => item.id === id)).filter(Boolean).slice(0, 4), [savedOpenings])
  const dueRevisions = useMemo(() => revisionItems.filter((item) => new Date(item.dueAt).getTime() <= Date.now()).sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt)), [revisionItems])
  const upcomingRevisions = useMemo(() => revisionItems.filter((item) => new Date(item.dueAt).getTime() > Date.now()).sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt)), [revisionItems])
  const openMistakes = useMemo(() => mistakeBook.filter((item) => !item.resolved).slice(0, 4), [mistakeBook])
  const journalTotal = Object.values(journal.minutes).reduce((total, minutes) => total + minutes, 0)
  const leastTrained = journalAreas.reduce((least, area) => (journal.minutes[area.id] || 0) < (journal.minutes[least.id] || 0) ? area : least, journalAreas[0])
  const dailySession = useMemo(() => {
    const retrieval = dueRevisions[0]
    const mistake = openMistakes[0]
    const phase = leastTrained.id
    return [
      retrieval ? { id: 'retrieval', tag: 'RECALL', title: retrieval.title, detail: retrieval.detail, action: 'Review due card', page: retrieval.kind === 'opening' ? 'openings' : 'practice', target: retrieval.kind === 'opening' ? 'study' : 'game-lab', area: retrieval.kind === 'opening' ? 'opening' : phase } : { id: 'repertoire', tag: 'OPENING', title: savedOpenings[0] ? openings.find((item) => item.id === savedOpenings[0])?.name || 'Your repertoire' : 'Choose one opening', detail: 'Train one line until you can state its plan and defensive idea.', action: 'Open repertoire', page: 'openings', target: 'study', area: 'opening' },
      mistake ? { id: 'repair', tag: 'REPAIR', title: mistake.title, detail: mistake.detail, action: 'Revisit miss', page: mistake.area === 'opening' ? 'openings' : 'practice', target: mistake.area === 'opening' ? 'study' : mistake.area === 'lab' ? 'game-lab' : 'puzzle-zone', area: mistake.area === 'opening' ? 'opening' : mistake.area === 'lab' ? phase : 'tactics', mistake } : { id: 'tactics', tag: 'CALCULATE', title: 'Daily tactical pulse', detail: 'Work from checks to captures to threats before you touch a piece.', action: 'Solve the puzzle', page: 'practice', target: 'puzzle-zone', area: 'tactics' },
      { id: 'phase', tag: 'BALANCE', title: `15 minutes of ${leastTrained.label}`, detail: leastTrained.cue, action: 'Train this phase', page: leastTrained.id === 'opening' ? 'openings' : 'practice', target: leastTrained.id === 'opening' ? 'study' : leastTrained.id === 'middle' ? 'game-lab' : leastTrained.id === 'end' ? 'endgame-route' : 'tactics-compass', area: leastTrained.id },
    ]
  }, [dueRevisions, openMistakes, leastTrained, savedOpenings])
  const completedSessionCount = dailySession.filter((item) => sessionChecks.includes(item.id)).length
  const commandItems = useMemo(() => {
    const destinations = [
      { id: 'home', label: 'Home', detail: 'Your boardwork dashboard', run: () => navigate('home') },
      { id: 'openings', label: 'Openings', detail: 'Repertoire, lines, plans, and defence', run: () => navigate('openings') },
      { id: 'practice', label: 'Practice', detail: 'Tactics, middlegames, structures, and endgames', run: () => navigate('practice') },
      { id: 'practice-tactics', label: 'Daily tactics', detail: 'Practice · calculate forcing moves', run: () => navigatePractice('tactics') },
      { id: 'practice-middlegame', label: 'Middlegame lab', detail: 'Practice · choose a plan and pawn break', run: () => navigatePractice('middlegame') },
      { id: 'practice-structures', label: 'Pawn structure atlas', detail: 'Practice · recognize long-term plans', run: () => navigatePractice('structures') },
      { id: 'practice-endgames', label: 'Endgame route', detail: 'Practice · convert exact positions', run: () => navigatePractice('endgames') },
      { id: 'analysis', label: 'Analysis desk', detail: 'Test a FEN, candidate move, or tablebase position', run: () => navigate('analysis') },
      { id: 'review', label: 'Game review', detail: 'Paste a PGN and turn a game into practice', run: () => navigate('review') },
      { id: 'scout', label: 'Scout', detail: 'Read a public Lichess profile', run: () => navigate('scout') },
      { id: 'learn', label: 'Learn', detail: 'Daily session, coordinate gym, and studies', run: () => navigate('learn') },
      ...capabilityPaths.map((item) => ({ id: `learn-${item.id}`, label: `${item.title} path`, detail: `Learn · ${item.signal}`, run: () => navigateLearnPath(item.id) })),
    ]
    const openingShortcuts = openings.map((item) => ({ id: `opening-${item.id}`, label: item.name, detail: `${item.eco} · ${item.tag.toLowerCase()}`, run: () => selectOpening(item.id) }))
    const needle = commandQuery.trim().toLowerCase()
    return [...destinations, ...openingShortcuts].filter((item) => !needle || `${item.label} ${item.detail}`.toLowerCase().includes(needle)).slice(0, 9)
  }, [commandQuery])
  function navigate(nextPage, target) {
    const pathname = nextPage === 'home' ? '/' : `/${nextPage}`
    if (window.location.pathname !== pathname) window.history.pushState({}, '', pathname)
    setPage(nextPage)
    setCommandOpen(false)
    setCommandQuery('')
    requestAnimationFrame(() => {
      if (target) document.querySelector(`#${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }
  function navigatePractice(route) {
    const target = practiceRouteTargets[route]
    if (!target) return
    const pathname = `/practice/${route}`
    if (window.location.pathname !== pathname) window.history.pushState({}, '', pathname)
    setPage('practice')
    requestAnimationFrame(() => document.querySelector(`#${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  function navigateLearnPath(path) {
    if (!capabilityPaths.some((item) => item.id === path)) return
    const pathname = `/learn/${path}`
    if (window.location.pathname !== pathname) window.history.pushState({}, '', pathname)
    setPage('learn')
    setActiveCapability(path)
    requestAnimationFrame(() => document.querySelector('#capability-ladder')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  function selectOpening(id) {
    const pathname = `/openings/${id}`
    if (window.location.pathname !== pathname) window.history.pushState({}, '', pathname)
    setPage('openings')
    setOpeningId(id)
    setPly(0)
    setMode('study')
    setSelected(null)
    setFeedback('New line loaded. Walk through the opening or start a drill.')
    requestAnimationFrame(() => document.querySelector('#study')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  function queueRevision({ kind, sourceId, title, detail }) {
    setRevisionItems((current) => {
      if (current.some((item) => item.kind === kind && item.sourceId === sourceId)) return current
      const next = [{ id: `${kind}-${sourceId}`, kind, sourceId, title, detail, interval: 0, reps: 0, dueAt: new Date().toISOString(), createdAt: new Date().toISOString() }, ...current].slice(0, 30)
      localStorage.setItem('atlas-revision-items', JSON.stringify(next))
      return next
    })
  }
  function completeRevision(id) {
    setRevisionItems((current) => {
      const next = current.map((item) => {
        if (item.id !== id) return item
        const interval = Math.min(item.interval + 1, revisionIntervals.length - 1)
        const dueAt = new Date(Date.now() + revisionIntervals[interval] * 86400000).toISOString()
        return { ...item, interval, reps: item.reps + 1, dueAt, lastReviewedAt: new Date().toISOString() }
      })
      localStorage.setItem('atlas-revision-items', JSON.stringify(next))
      return next
    })
  }
  function openRevision(item) {
    if (item.kind === 'opening') selectOpening(item.sourceId)
    else { setActiveLab(item.sourceId); navigate('practice', 'game-lab') }
  }
  function recordMistake(item) {
    setMistakeBook((current) => {
      const existing = current.find((entry) => !entry.resolved && entry.area === item.area && entry.sourceId === item.sourceId)
      const next = existing ? current.map((entry) => entry.id === existing.id ? { ...entry, title: item.title, detail: item.detail, seen: entry.seen + 1, updatedAt: new Date().toISOString() } : entry) : [{ ...item, id: `${Date.now()}-${item.area}`, seen: 1, createdAt: new Date().toISOString(), resolved: false }, ...current].slice(0, 20)
      localStorage.setItem('atlas-mistake-book', JSON.stringify(next))
      return next
    })
  }
  function revisitMistake(item) {
    if (item.area === 'opening') selectOpening(item.sourceId)
    else if (item.area === 'lab') { setActiveLab(item.sourceId); navigate('practice', 'game-lab') }
    else navigate('practice', 'puzzle-zone')
  }
  function resolveMistake(id) {
    setMistakeBook((current) => {
      const next = current.map((item) => item.id === id ? { ...item, resolved: true, resolvedAt: new Date().toISOString() } : item)
      localStorage.setItem('atlas-mistake-book', JSON.stringify(next))
      return next
    })
  }
  function revisionTiming(item) {
    const remaining = new Date(item.dueAt).getTime() - Date.now()
    if (remaining <= 0) return 'Due now'
    const days = Math.ceil(remaining / 86400000)
    return days === 1 ? 'Tomorrow' : `In ${days} days`
  }
  function toggleTheme() { const next = theme === 'light' ? 'dark' : 'light'; setTheme(next); localStorage.setItem('atlas-theme', next) }
  function toggleTrack(id) {
    setCompletedTracks((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      localStorage.setItem('atlas-tracks', JSON.stringify(next))
      return next
    })
  }
  function launchSessionTask(task) {
    if (task.mistake) revisitMistake(task.mistake)
    else navigate(task.page, task.target)
  }
  function toggleSessionCheck(id) {
    setSessionChecks((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      localStorage.setItem('atlas-session-checks', JSON.stringify({ date: dayStamp(), items: next }))
      return next
    })
  }
  function bumpStat(id) {
    setLifetimeStats((current) => {
      const next = { ...current, [id]: (current[id] || 0) + 1 }
      localStorage.setItem('atlas-lifetime-stats', JSON.stringify(next))
      return next
    })
  }
  function handleCoordinateSquare(square) {
    if (square === coordinateTarget) {
      setCoordinateScore((score) => score + 1)
      setCoordinateStreak((streak) => streak + 1)
      bumpStat('coordinates')
      setCoordinateFeedback(`Correct — ${square} is locked in. Next square:`)
      setCoordinateTarget((current) => {
        let next = randomCoordinate()
        while (next === current) next = randomCoordinate()
        return next
      })
    } else {
      setCoordinateStreak(0)
      setCoordinateFeedback(`Not ${square}. Reset your eyes: files run a–h, ranks run 1–8 from White’s side.`)
    }
  }
  function saveOpeningNote(value) {
    setOpeningNotes((current) => {
      const next = { ...current, [opening.id]: value.slice(0, 1200) }
      localStorage.setItem('atlas-opening-notes', JSON.stringify(next))
      return next
    })
  }
  const previousMove = useCallback(() => { setPly((current) => Math.max(0, current - 1)); setMode('study') }, [])
  const nextLineMove = useCallback(() => { setPly((current) => Math.min(opening.moves.length, current + 1)); setMode('study') }, [opening.moves.length])
  const flipBoard = useCallback(() => { setOrientation((side) => side === 'w' ? 'b' : 'w') }, [])
  useEffect(() => {
    function handleKeyboard(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((open) => !open)
        setCommandIndex(0)
        return
      }
      if (event.key === 'Escape' && commandOpen) { setCommandOpen(false); setCommandQuery(''); return }
      const key = event.key.toLowerCase()
      if (commandOpen) {
        if (key === 'arrowdown') { event.preventDefault(); setCommandIndex((index) => Math.min(Math.max(0, commandItems.length - 1), index + 1)); return }
        if (key === 'arrowup') { event.preventDefault(); setCommandIndex((index) => Math.max(0, index - 1)); return }
        if (key === 'enter') { event.preventDefault(); (commandItems[commandIndex] || commandItems[0])?.run(); return }
      }
      const tag = event.target.tagName
      if (event.metaKey || event.ctrlKey || event.altKey || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable) return
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
  }, [opening.moves.length, previousMove, nextLineMove, flipBoard, commandOpen, commandItems, commandIndex])
  useEffect(() => {
    const syncPage = () => { const nextPage = pageFromLocation(); setPage(nextPage); setOpeningId(openingFromLocation()); setActiveCapability(learnPathFromLocation()); setAnalysisPosition(sharedAnalysisFromLocation()); const target = practiceTargetFromLocation(); if (nextPage === 'practice' && target) requestAnimationFrame(() => document.querySelector(`#${target}`)?.scrollIntoView({ behavior: 'auto', block: 'start' })); if (nextPage === 'learn' && window.location.pathname.split('/').filter(Boolean)[1]) requestAnimationFrame(() => document.querySelector('#capability-ladder')?.scrollIntoView({ behavior: 'auto', block: 'start' })) }
    window.addEventListener('popstate', syncPage)
    return () => window.removeEventListener('popstate', syncPage)
  }, [])
  useEffect(() => {
    const target = practiceTargetFromLocation()
    if (page !== 'practice' || !target) return
    const timer = window.setTimeout(() => document.querySelector(`#${target}`)?.scrollIntoView({ behavior: 'auto', block: 'start' }), 300)
    return () => window.clearTimeout(timer)
  }, [page])
  useEffect(() => {
    const path = learnPathFromLocation()
    const isDirectPath = page === 'learn' && window.location.pathname.split('/').filter(Boolean)[1]
    if (!isDirectPath) return
    setActiveCapability(path)
    const timer = window.setTimeout(() => document.querySelector('#capability-ladder')?.scrollIntoView({ behavior: 'auto', block: 'start' }), 300)
    return () => window.clearTimeout(timer)
  }, [page])
  useEffect(() => {
    const controller = new AbortController()
    setIntelligence({ status: 'loading', moves: [] })
    fetch(`/api/chessdb?fen=${encodeURIComponent(activeFen)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Data unavailable')))
      .then((data) => setIntelligence({ status: 'ready', moves: data.moves || [], fetchedAt: data.fetchedAt }))
      .catch((error) => { if (error.name !== 'AbortError') setIntelligence({ status: 'error', moves: [] }) })
    return () => controller.abort()
  }, [activeFen])
  useEffect(() => {
    const controller = new AbortController()
    setOpeningIntelligence({ status: 'loading', moves: [] })
    fetch(`/api/chessdb?fen=${encodeURIComponent(currentFen)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Data unavailable')))
      .then((data) => setOpeningIntelligence({ status: 'ready', moves: data.moves || [], fetchedAt: data.fetchedAt }))
      .catch((error) => { if (error.name !== 'AbortError') setOpeningIntelligence({ status: 'error', moves: [] }) })
    return () => controller.abort()
  }, [currentFen])
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/opening-pulse', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Pulse unavailable')))
      .then((data) => setOpeningPulse({ status: 'ready', ...data }))
      .catch((error) => { if (error.name !== 'AbortError') setOpeningPulse({ status: 'error', pulse: [] }) })
    return () => controller.abort()
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/lichess-tv', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('TV unavailable')))
      .then((data) => setLichessTv({ status: 'ready', ...data }))
      .catch((error) => { if (error.name !== 'AbortError') setLichessTv({ status: 'error', games: [] }) })
    return () => controller.abort()
  }, [])
  useEffect(() => {
    if (activePieceCount > 7) { setTablebase({ status: 'ineligible', moves: [] }); return }
    const controller = new AbortController()
    setTablebase({ status: 'loading', moves: [] })
    fetch(`/api/tablebase?fen=${encodeURIComponent(activeFen)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Tablebase unavailable')))
      .then((data) => setTablebase({ status: 'ready', ...data }))
      .catch((error) => { if (error.name !== 'AbortError') setTablebase({ status: 'error', moves: [] }) })
    return () => controller.abort()
  }, [activeFen, activePieceCount])
  useEffect(() => {
    const controller = new AbortController()
    setEngine({ status: 'loading', pvs: [] })
    fetch(`/api/cloud-eval?fen=${encodeURIComponent(activeFen)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Engine unavailable')))
      .then((data) => setEngine({ status: data.available ? 'ready' : 'empty', ...data }))
      .catch((error) => { if (error.name !== 'AbortError') setEngine({ status: 'error', pvs: [] }) })
    return () => controller.abort()
  }, [activeFen])
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
  useEffect(() => {
    setLabSelected(null)
    setLabSolved(false)
    setLabLastMove(null)
    setLabFen(lab.fen)
    setLabReflection('')
    setLabFeedback('Choose a piece, then make the move that proves the idea.')
  }, [activeLab, lab.fen])
  function handleSquare(square) {
    if (mode !== 'drill') return
    if (!selected) { if (game.get(square)?.color === game.turn()) setSelected(square); return }
    const test = new Chess(game.fen())
    try {
      const made = test.move({ from: selected, to: square, promotion: 'q' })
      if (made.san === nextMove) { setPly((p) => p + 1); setScore((s) => s + 1); bumpStat('bookMoves'); setFeedback(`Exactly. ${made.san} is the book move.`) }
      else { setFeedback(`${made.san} is playable, but this drill is looking for ${nextMove}. Try again.`); recordMistake({ area: 'opening', sourceId: opening.id, title: `${opening.name}: ${made.san}`, detail: `The drill expected ${nextMove}. Rebuild the opening’s first plan before replaying this branch.` }) }
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
    if (move !== expected) { setPuzzleSelected(null); setPuzzleFeedback('Not this one. Scan checks, captures, then threats.'); recordMistake({ area: 'puzzle', sourceId: puzzle.puzzle.id, title: 'Daily tactic: forcing moves', detail: 'Start again with checks, captures, and threats—in that order.' }); return }
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
    if (nextStep >= puzzle.puzzle.solution.length) bumpStat('puzzles')
    setPuzzleFeedback(nextStep >= puzzle.puzzle.solution.length ? 'Solved. You found the whole forcing sequence.' : 'Correct. The defender replies—keep calculating.')
  }
  function reviewPgn() {
    if (!pgnInput.trim()) { setReviewFeedback('Paste a PGN first—moves alone are fine.'); return }
    if (pgnInput.length > 30000) { setReviewFeedback('Keep the PGN under 30,000 characters for this first-pass review.'); return }
    try {
      const parsed = new Chess()
      parsed.loadPgn(pgnInput.trim())
      const moves = parsed.history({ verbose: true })
      if (!moves.length) throw new Error('No moves found')
      const headers = parsed.getHeaders()
      const recognition = openings.map((opening) => {
        const firstMismatch = opening.moves.findIndex((san, index) => moves[index]?.san !== san)
        return { opening, matched: firstMismatch === -1 ? opening.moves.length : firstMismatch }
      }).filter((item) => item.matched >= 2).sort((a, b) => b.matched - a.matched)[0]
      setReview({ moves, headers, fens: [moves[0].before, ...moves.map((move) => move.after)] })
      setReviewPly(moves.length)
      setReviewFeedback(recognition ? `Loaded ${moves.length} plies. Opening recognition: ${recognition.opening.name} (${recognition.opening.eco}) through ${recognition.matched} plies. Now find the first irreversible decision after the book.` : `Loaded ${moves.length} plies. Start by naming the last irreversible decision before asking the engine.`)
    } catch { setReview(null); setReviewFeedback('That PGN could not be read. Export it from your chess site, then paste the full move text here.') }
  }
  function saveFocusItem() {
    const fallback = reviewMove ? `Review ${reviewMove.san}: ${reviewMoment}` : ''
    const note = focusDraft.trim() || fallback
    if (!note) return
    setFocusItems((current) => {
      const next = [{ id: `${Date.now()}-${focusArea}`, area: focusArea, note, createdAt: new Date().toISOString() }, ...current].slice(0, 12)
      localStorage.setItem('atlas-focus-items', JSON.stringify(next))
      return next
    })
    setFocusDraft('')
  }
  function saveLabReflection() {
    const note = labReflection.trim()
    if (!note) return
    setLabReflections((current) => {
      const next = [{ id: `${Date.now()}-${lab.id}`, labId: lab.id, title: lab.title, note, createdAt: new Date().toISOString() }, ...current].slice(0, 8)
      localStorage.setItem('atlas-lab-reflections', JSON.stringify(next))
      return next
    })
    queueRevision({ kind: 'lab', sourceId: lab.id, title: lab.title, detail: 'Explain the position’s idea before replaying the move.' })
    setLabReflection('')
  }
  function removeFocusItem(id) {
    setFocusItems((current) => { const next = current.filter((item) => item.id !== id); localStorage.setItem('atlas-focus-items', JSON.stringify(next)); return next })
  }
  function loadProfile(event) {
    event.preventDefault()
    const username = profileName.trim()
    if (!username) { setProfile({ status: 'error', error: 'Enter a public Lichess username.' }); return }
    setProfile({ status: 'loading' })
    fetch(`/api/lichess-profile?username=${encodeURIComponent(username)}`)
      .then((response) => response.ok ? response.json() : response.json().then((data) => Promise.reject(new Error(data.error))) )
      .then((data) => setProfile({ status: 'ready', ...data }))
      .catch((error) => setProfile({ status: 'error', error: error.message || 'Profile data is unavailable.' }))
  }
  function togglePattern(id) {
    setReviewedPatterns((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      localStorage.setItem('atlas-patterns', JSON.stringify(next))
      return next
    })
  }
  function toggleRepertoire(id) {
    const isSaved = savedOpenings.includes(id)
    setSavedOpenings((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      localStorage.setItem('atlas-repertoire', JSON.stringify(next))
      return next
    })
    if (isSaved) {
      setRevisionItems((current) => {
        const next = current.filter((item) => !(item.kind === 'opening' && item.sourceId === id))
        localStorage.setItem('atlas-revision-items', JSON.stringify(next))
        return next
      })
    } else {
      const openingToReview = openings.find((item) => item.id === id)
      if (openingToReview) queueRevision({ kind: 'opening', sourceId: id, title: openingToReview.name, detail: 'Replay the line, then state the first plan and the defensive idea.' })
    }
  }
  function logPractice(id) {
    setJournal((current) => {
      const clean = current.week === weekStamp() ? current : { week: weekStamp(), minutes: {} }
      const next = { ...clean, minutes: { ...clean.minutes, [id]: (clean.minutes[id] || 0) + 15 } }
      localStorage.setItem('atlas-journal', JSON.stringify(next))
      return next
    })
  }
  function resetJournal() { const next = { week: weekStamp(), minutes: {} }; localStorage.setItem('atlas-journal', JSON.stringify(next)); setJournal(next) }
  function exportStudySnapshot() {
    const payload = {
      exportedAt: new Date().toISOString(),
      product: 'First Rank',
      repertoire: savedOpenings.map((id) => openings.find((item) => item.id === id)?.name).filter(Boolean),
      openingNotes,
      revisionItems,
      mistakes: mistakeBook,
      focusItems,
      practiceJournal: journal,
      completedTracks,
      lifetimeStats,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `first-rank-study-${dayStamp()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }
  function analyseReviewPosition() {
    if (!reviewGame) return
    setAnalysisPosition({ fen: reviewGame.fen(), label: `Your PGN · ${reviewPly ? `move ${Math.ceil(reviewPly / 2)}${reviewPly % 2 ? '.' : '…'}` : 'start position'}` })
    navigate('analysis', 'position-desk')
  }
  function analyseLabPosition() {
    setAnalysisPosition({ fen: labFen, label: `${lab.title} lab` })
    navigate('analysis', 'position-desk')
  }
  function analyseEndgameLesson() {
    setAnalysisPosition({ fen: endgameLesson.fen, label: `${endgameLesson.title} technique` })
    navigate('analysis', 'position-desk')
  }
  function openAnalysisPosition(fen, label) {
    try {
      const position = new Chess(fen.trim())
      setAnalysisPosition({ fen: position.fen(), label })
      const pathname = `/analysis?fen=${encodeURIComponent(position.fen())}`
      if (window.location.pathname + window.location.search !== pathname) window.history.pushState({}, '', pathname)
      setFenDraft(position.fen())
      setFenFeedback(`Loaded ${label}. Database, engine, and tablebase checks are now pointed at this position.`)
      setPage('analysis')
      requestAnimationFrame(() => document.querySelector('#position-desk')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } catch {
      setFenFeedback('That FEN is not a legal chess position. Include all six FEN fields, then try again.')
    }
  }
  async function copyAnalysisLink() {
    if (!analysisPosition) return
    const url = `${window.location.origin}/analysis?fen=${encodeURIComponent(analysisPosition.fen)}`
    try {
      await navigator.clipboard.writeText(url)
      setShareFeedback('Copied ✓')
    } catch {
      setShareFeedback('Copy the URL from your address bar')
    }
  }
  function submitFen(event) {
    event.preventDefault()
    if (!fenDraft.trim()) { setFenFeedback('Paste a complete FEN first, or use one of the phase presets.'); return }
    openAnalysisPosition(fenDraft, 'Custom position')
  }
  function handleAnalysisSquare(square) {
    const test = new Chess(activeFen)
    if (!analysisSelected) {
      const piece = test.get(square)
      if (piece && piece.color === test.turn()) { setAnalysisSelected(square); setAnalysisFeedback(`Testing moves from ${square}.`) }
      else setAnalysisFeedback(`It is ${test.turn() === 'w' ? 'White' : 'Black'} to move. Choose one of that side’s pieces.`)
      return
    }
    const made = test.move({ from: analysisSelected, to: square, promotion: 'q' })
    if (!made) {
      const piece = test.get(square)
      if (piece && piece.color === test.turn()) { setAnalysisSelected(square); setAnalysisFeedback(`Testing moves from ${square}.`) }
      else { setAnalysisSelected(null); setAnalysisFeedback('That move is not legal from this position. Choose a piece and try again.') }
      return
    }
    setAnalysisSelected(null)
    setAnalysisFeedback(`${made.san} loaded. Compare the database and cloud-engine reply before deciding whether the idea survives.`)
    bumpStat('candidates')
    openAnalysisPosition(test.fen(), `Candidate move: ${made.san}`)
  }
  function handleLabSquare(square) {
    if (labSolved) return
    if (!labSelected) { if (labGame.get(square)?.color === labGame.turn()) setLabSelected(square); return }
    const test = new Chess(labGame.fen())
    try {
      const made = test.move({ from: labSelected, to: square, promotion: 'q' })
      setLabSelected(null)
      if (made.san === lab.answer) { setLabFen(test.fen()); setLabLastMove([made.from, made.to]); setLabSolved(true); bumpStat('labs'); setLabFeedback(lab.insight) }
      else { setLabFeedback(`${made.san} is legal, but pause: ${lab.prompt}`); recordMistake({ area: 'lab', sourceId: lab.id, title: `${lab.title}: ${made.san}`, detail: lab.prompt }) }
    } catch { setLabSelected(null); setLabFeedback('That piece cannot go there. Rebuild the position in your head, then try again.') }
  }

  return <main className={`app workspace-${page} profile-${profile.status} ${theme === 'dark' ? 'dark' : ''}`}>
    <nav className="workspace-nav"><button className="brand" onClick={() => navigate('home')}><span>♞</span> first<span>rank</span></button><div className="nav-links">{[['home', 'Home'], ['openings', 'Openings'], ['practice', 'Practice'], ['analysis', 'Analysis'], ['review', 'Review'], ['scout', 'Scout'], ['learn', 'Learn']].map(([id, label]) => <button className={page === id ? 'active' : ''} onClick={() => navigate(id)} key={id}>{label}</button>)}</div><div className="nav-utility"><button className="jump-button" onClick={() => setCommandOpen(true)} aria-haspopup="dialog">Jump <kbd>⌘K</kbd></button><button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme">{theme === 'light' ? '◐ Dark' : '◑ Light'}</button><button className="streak" onClick={() => navigate('learn', 'daily-session')}>⚡ Today {completedSessionCount}/{dailySession.length}</button></div></nav>
    {commandOpen && <div className="command-layer" role="presentation" onMouseDown={() => { setCommandOpen(false); setCommandQuery('') }}><section className="command-palette" role="dialog" aria-modal="true" aria-label="Jump anywhere" onMouseDown={(event) => event.stopPropagation()}><div className="command-input"><span>⌕</span><input autoFocus value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder="Go to a workspace or opening…" aria-label="Search workspaces and openings" /><kbd>ESC</kbd></div><p>WORKSPACES &amp; OPENINGS</p><div className="command-results">{commandItems.length ? commandItems.map((item) => <button key={item.id} onClick={item.run}><strong>{item.label}</strong><small>{item.detail}</small><i>↗</i></button>) : <div className="command-empty">No workspace or opening matches that.</div>}</div></section></div>}
    <aside className="quick-rail" aria-label="Workspace navigation"><span>FIRST RANK</span>{[['home', 'Home', '01'], ['openings', 'Openings', '02'], ['practice', 'Practice', '03'], ['analysis', 'Analysis', '04'], ['review', 'Review', '05'], ['scout', 'Scout', '06'], ['learn', 'Learn', '07']].map(([id, label, number]) => <button className={page === id ? 'active' : ''} onClick={() => navigate(id)} key={id}><b>{number}</b><i>{label}</i></button>)}</aside>
    {page === 'analysis' && analysisPosition && <aside className="share-rail" aria-label="Share this analysis position"><span>POSITION URL</span><strong>Share this board.</strong><p>Anyone with the link can open the exact FEN in First Rank’s live desk.</p><button onClick={copyAnalysisLink}>{shareFeedback || 'Copy analysis link'}</button></aside>}
    {page === 'practice' && <section className="practice-flight" aria-label="Practice routes"><div><p className="eyebrow">PRACTICE FLIGHT DECK</p><h2>Choose the<br /><em>right work.</em></h2><p>Different chess problems need different training. Pick the mode that matches the mistake you want to stop making today.</p></div><div className="practice-routes"><button onClick={() => navigatePractice('tactics')}><span>01 · CALCULATE</span><strong>Daily tactics</strong><small>Forcing moves, tactical discipline</small></button><button onClick={() => navigatePractice('middlegame')}><span>02 · PLAN</span><strong>Middlegame lab</strong><small>Find the break and improve the worst piece</small></button><button onClick={() => navigatePractice('structures')}><span>03 · STRUCTURE</span><strong>Pawn atlas</strong><small>Read the long-term plan from the pawns</small></button><button onClick={() => navigatePractice('endgames')}><span>04 · CONVERT</span><strong>Endgame route</strong><small>Exact technique and tablebase truth</small></button></div></section>}
    {page === 'openings' && <section className="opening-radar" aria-label="Live opening database signal"><div><p className="eyebrow">LIVE LINE RADAR · {opening.eco}</p><h2>What the database<br /><em>permits next.</em></h2><p>This is the live ChessDB read for the exact move you are studying—not a generic opening card. White score and engine score are signals; the plan still decides the move.</p><div className="radar-links"><a href={`https://lichess.org/analysis/${encodeURIComponent(currentFen).replace(/%20/g, '_')}`} target="_blank" rel="noreferrer">Open analysis on Lichess ↗</a><button onClick={() => openAnalysisPosition(currentFen, `${opening.name} · live line`)}>Interrogate this position →</button></div></div><div className="radar-board"><div className="radar-meta"><span className={`status-dot ${openingIntelligence.status}`}></span><strong>{openingIntelligence.status === 'ready' ? `${openingExplorerMoves.length} live candidate${openingExplorerMoves.length === 1 ? '' : 's'}` : openingIntelligence.status === 'loading' ? 'Reading current line…' : 'Signal temporarily unavailable'}</strong><small>Public source: ChessDB</small></div><div className="radar-moves">{openingIntelligence.status === 'ready' && openingExplorerMoves.length ? openingExplorerMoves.map((move, index) => <article key={move.move}><span>{String(index + 1).padStart(2, '0')} · {move.note || 'book'}</span><strong>{move.san}</strong><div><i style={{ width: `${Math.min(100, Math.max(8, Number(move.winrate) || 0))}%` }}></i></div><small>{move.winrate ? `${Number(move.winrate).toFixed(1)}% White score` : 'Score unavailable'} · {Number.isFinite(Number(move.score)) ? `${Number(move.score) >= 0 ? '+' : ''}${(Number(move.score) / 100).toFixed(2)} engine` : 'unscored'}</small></article>) : <p>{openingIntelligence.status === 'loading' ? 'Checking the book continuations for this position…' : 'No public continuation data for this exact branch yet.'}</p>}</div></div></section>}
    {page === 'scout' && <section className="form-lens" aria-label="Lichess rating history"><div><p className="eyebrow">PUBLIC FORM LENS</p><h2>A rating trail,<br /><em>not a verdict.</em></h2><p>Recent public rating history puts a profile snapshot in context. It is useful for choosing a training cadence, never for reducing a player to a graph.</p></div>{profileSignals?.ratingPoints.length ? <div className="form-card"><div className="form-summary"><span>{profileSignals.primary.name} · latest public point</span><strong>{profileSignals.latestRating}</strong><small className={profileSignals.ratingDelta >= 0 ? 'up' : 'down'}>{profileSignals.ratingDelta >= 0 ? '+' : ''}{profileSignals.ratingDelta} across the visible record</small></div><div className="form-chart" role="img" aria-label={`${profileSignals.primary.name} rating history, latest ${profileSignals.latestRating}, change ${profileSignals.ratingDelta}`}><div>{profileSignals.ratingPoints.map((point) => <i key={`${point.date}-${point.rating}`} title={`${point.date}: ${point.rating}`} style={{ height: `${point.height}%` }}></i>)}</div><small>{profileSignals.ratingPoints[0].date} → {profileSignals.ratingPoints.at(-1).date}</small></div></div> : <div className="form-empty"><span>↗</span><strong>{profile.status === 'loading' ? 'Reading public rating history…' : 'Look up a public handle to reveal its available rating trail.'}</strong><p>Lichess exposes this only for formats and accounts that have public history.</p></div>}</section>}
    <section className="position-launcher"><div><p className="eyebrow">UNIVERSAL POSITION DESK</p><h2>Bring any board<br /><em>into focus.</em></h2><p>Use a FEN from a game, course, or book. First Rank routes it through the same live database, cloud engine, and exact tablebase tools as every lesson.</p></div><form onSubmit={submitFen}><label htmlFor="fen-draft">FEN / FORSYTH–EDWARDS NOTATION</label><textarea id="fen-draft" value={fenDraft} onChange={(event) => setFenDraft(event.target.value)} placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" /><div className="preset-row"><button type="button" onClick={() => openAnalysisPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'Initial position')}>Opening preset</button><button type="button" onClick={() => openAnalysisPosition(gameLabs[0].fen, 'Middlegame preset')}>Middlegame preset</button><button type="button" onClick={() => openAnalysisPosition(gameLabs[1].fen, 'Endgame preset')}>Endgame preset</button></div><button className="open-position" type="submit">Open live position <span>→</span></button><p className="fen-feedback">{fenFeedback}</p></form></section>
    <section data-workspace="home" className="hero" id="top"><div><p className="eyebrow">THE CHESS LEARNING WORKSPACE</p><h1>Learn the <em>why</em><br />behind your moves.</h1><p className="hero-copy">A focused place to build an opening repertoire, practice plans, review games, and develop endgame technique.</p><button className="hero-cta" onClick={() => navigate('openings')}>Open your repertoire <span>→</span></button></div><div className="hero-note"><p>Today’s rule</p><strong>“Every opening move should buy you a plan.”</strong><div><span>FIRST RANK</span><span>WORKSPACE</span></div></div></section>
    {page === 'home' && <section className="live-tv" aria-label="Live Lichess TV boards"><div className="live-tv-copy"><p className="eyebrow">LIVE FROM LICHESS TV</p><h2>Strong boards,<br /><em>right now.</em></h2><p>Watch how titled players handle the positions you are training. The point is not to copy moves blindly—pause, name the plan, then compare it with the game.</p><a href="https://lichess.org/tv" target="_blank" rel="noreferrer">Watch Lichess TV ↗</a></div><div className="live-tv-grid">{lichessTv.status === 'ready' && lichessTv.games.length ? lichessTv.games.map((game) => <a key={`${game.channel}-${game.gameId}`} href={`https://lichess.org/${game.gameId}`} target="_blank" rel="noreferrer"><span>{game.channel}</span><strong>{game.title ? `${game.title} ` : ''}{game.username}</strong><small>{game.rating} · playing {game.color}</small><i>Watch ↗</i></a>) : <div className="live-tv-empty"><span>{lichessTv.status === 'loading' ? '↻' : '♞'}</span><strong>{lichessTv.status === 'loading' ? 'Finding the boards…' : 'Live boards are temporarily unavailable.'}</strong><p>The Home workspace still links directly to Lichess TV.</p></div>}</div></section>}
    <section className="revision-deck"><div className="revision-heading"><div><p className="eyebrow">MEMORY, NOT MOMENTUM</p><h2>Your next<br /><em>useful recall.</em></h2></div><p>Every saved opening and written lab insight enters a small spaced-review queue. Mark it only after you can explain the idea without looking.</p></div><div className="revision-metrics"><span><b>{dueRevisions.length}</b> due now</span><span><b>{revisionItems.length}</b> concepts held</span><span><b>{upcomingRevisions.length}</b> returning later</span></div><div className="revision-list">{dueRevisions.length ? dueRevisions.slice(0, 4).map((item) => <article key={item.id}><div><span>{item.kind === 'opening' ? 'OPENING RECALL' : 'POSITION RECALL'} · {revisionTiming(item)}</span><h3>{item.title}</h3><p>{item.detail}</p></div><div><button onClick={() => openRevision(item)}>Open board →</button><button onClick={() => completeRevision(item.id)}>I recalled it ✓</button></div></article>) : <div className="revision-empty"><span>♞</span><strong>{revisionItems.length ? 'Nothing urgent. Let the ideas breathe.' : 'Your recall queue is empty.'}</strong><p>{revisionItems.length ? `Next return: ${revisionTiming(upcomingRevisions[0])}.` : 'Save an opening or keep a lab reflection; First Rank will bring it back at the right time.'}</p></div>}</div></section>
    <section className="mistake-ledger"><div><p className="eyebrow">THE MISTAKE BOOK</p><h2>Turn a miss<br /><em>into a map.</em></h2></div><div className="mistake-list">{openMistakes.length ? openMistakes.map((item) => <article key={item.id}><div><span>{item.area === 'opening' ? 'OPENING DRILL' : item.area === 'lab' ? 'GAME LAB' : 'TACTICAL CALCULATION'} · seen {item.seen}×</span><strong>{item.title}</strong><p>{item.detail}</p></div><div><button onClick={() => revisitMistake(item)}>Revisit →</button><button onClick={() => resolveMistake(item.id)}>Cleared ✓</button></div></article>) : <div className="mistake-empty"><span>♜</span><strong>Nothing to repair yet.</strong><p>Miss a legal drill move, lab idea, or tactic and it will land here—ready to be revisited deliberately.</p></div>}</div></section>
    <section className="boardwork-ledger"><div><p className="eyebrow">YOUR FIRST RANK LEDGER</p><h2>The work<br /><em>adds up.</em></h2><p>These are things you actually did inside First Rank—not a guessed rating, not a vanity streak.</p></div><div className="ledger-grid"><article><span>BOOK MOVES</span><strong>{lifetimeStats.bookMoves || 0}</strong><small>correct moves recalled in drills</small></article><article><span>TACTICS</span><strong>{lifetimeStats.puzzles || 0}</strong><small>daily forcing sequences solved</small></article><article><span>LAB IDEAS</span><strong>{lifetimeStats.labs || 0}</strong><small>middlegame or endgame plans found</small></article><article><span>POSITIONS TESTED</span><strong>{lifetimeStats.candidates || 0}</strong><small>candidate moves sent to analysis</small></article><article><span>BOARD FLUENCY</span><strong>{lifetimeStats.coordinates || 0}</strong><small>coordinates found without guessing</small></article></div></section>
    <section className="home-command"><div><p className="eyebrow">YOUR BOARDWORK</p><h2>One board.<br /><em>One useful job.</em></h2></div><div className="home-routes"><button onClick={() => navigate('openings')}><span>01 · REPERTOIRE</span><strong>Openings</strong><p>{savedOpenings.length ? `${savedOpenings.length} systems saved · continue your line` : 'Choose a system and learn the plan behind it'}</p><i>Go to openings →</i></button><button onClick={() => navigate('practice')}><span>02 · TRAINING</span><strong>Practice</strong><p>Daily tactics, middlegame plans, and endgame technique.</p><i>Start a drill →</i></button><button onClick={() => navigate('analysis')}><span>03 · LIVE DESK</span><strong>Analysis</strong><p>Bring a FEN, test a candidate, and interrogate the position.</p><i>Open analysis →</i></button><button onClick={() => navigate('review')}><span>04 · FEEDBACK</span><strong>Review</strong><p>{focusItems.length ? `${focusItems.length} focus item${focusItems.length === 1 ? '' : 's'} waiting` : 'Turn your recent game into a concrete training focus'}</p><i>Review a game →</i></button><button onClick={() => navigate('scout')}><span>05 · PUBLIC INTEL</span><strong>Scout</strong><p>Read a public Lichess profile, formats, and recent-game archive.</p><i>Open scouting →</i></button><button onClick={() => navigate('learn')}><span>06 · PROGRAM</span><strong>Learn</strong><p>{journalTotal ? `${journalTotal} minutes logged this week` : `Start with 15 minutes of ${leastTrained.label.toLowerCase()}`}</p><i>See the plan →</i></button></div></section>
    <section data-workspace="openings" className="repertoire-rail" id="repertoire-rail" aria-label="Opening selector"><div className="rail-intro"><div><p className="eyebrow">START HERE · {openings.length} LINES READY</p><strong>Choose your next<br />battlefield.</strong></div><div className="rail-filters"><button className={railFilter === 'All' ? 'active' : ''} onClick={() => setRailFilter('All')}>All systems</button><button className={railFilter === 'WHITE REPERTOIRE' ? 'active' : ''} onClick={() => setRailFilter('WHITE REPERTOIRE')}>As White</button><button className={railFilter === 'BLACK REPERTOIRE' ? 'active' : ''} onClick={() => setRailFilter('BLACK REPERTOIRE')}>As Black</button></div></div><div className="opening-strip">{railOpenings.map((item, index) => <button key={item.id} onClick={() => selectOpening(item.id)} className={item.id === openingId ? 'active' : ''}><span>{String(index + 1).padStart(2, '0')} · {item.eco}</span><b>{item.name}</b><small>{item.category} · {item.tempo}</small><i>{item.id === openingId ? 'In study ↓' : 'Study this →'}</i></button>)}</div></section>
    <section className="opening-pulse"><div><p className="eyebrow">LIVE OPENING PULSE</p><h2>What does the<br /><em>database answer?</em></h2></div><div className="pulse-grid">{openingPulse.status === 'ready' ? pulseMoves.map((row) => <article key={row.id}><span>{row.label}</span><strong>{row.san}</strong><small>{row.name} · {row.move?.winrate ? `${Number(row.move.winrate).toFixed(1)}% White score` : 'live line'}</small></article>) : <p>{openingPulse.status === 'loading' ? 'Reading public opening replies…' : 'Live opening pulse is temporarily unavailable.'}</p>}</div><p className="pulse-source">Public source: <a href="https://www.chessdb.cn/" target="_blank" rel="noreferrer">ChessDB ↗</a> · Replies are a database signal, not a command.</p></section>
    <section className="study" id="study"><div className="study-intro"><div><p className="eyebrow">LESSON 01 / OPENING ATLAS</p><h2>Build the position.<br /><em>Understand the plan.</em></h2></div><div className="lesson-status"><span>YOUR PROGRESS</span><strong>{Math.round((ply / opening.moves.length) * 100)}%</strong><small>{mode === 'drill' ? 'Drill active' : 'Line exploration'}</small></div></div><aside className="repertoire"><p className="eyebrow">REPERTOIRE / {opening.tag}</p><h2>{opening.name}</h2><p>{opening.promise}</p><div className="line"><span>MAIN LINE</span>{opening.moves.map((move, i) => <button key={`${move}-${i}`} onClick={() => { setPly(i + 1); setMode('study') }} className={i === ply - 1 ? 'current' : ''}>{i % 2 === 0 ? `${Math.floor(i / 2) + 1}.` : ''} {move}</button>)}</div><button className="drill-button" onClick={startDrill}>Start move drill <span>→</span></button></aside>
      <div className="board-area"><div className="board-header"><span>{mode === 'drill' ? 'DRILL MODE' : 'EXPLORE THE LINE'}</span><div><button className="flip-button" onClick={flipBoard} aria-label="Flip board">↻</button><button disabled={!ply} onClick={previousMove}>←</button><span>{ply} / {opening.moves.length}</span><button disabled={ply === opening.moves.length} onClick={nextLineMove}>→</button></div></div><Board game={game} orientation={orientation} selected={selected} onSquare={handleSquare} lastMove={previous} /><p className="feedback">{feedback}</p><p className="key-hints"><kbd>←</kbd><kbd>H</kbd><kbd>A</kbd> previous · <kbd>→</kbd><kbd>L</kbd><kbd>D</kbd> next · <kbd>W</kbd>/<kbd>K</kbd> start · <kbd>S</kbd>/<kbd>J</kbd> end · <kbd>F</kbd> flip</p></div>
      <aside className="coach"><div><div className="coach-mark">♜</div><p className="eyebrow">POSITION COACH</p></div><div><h3>{nextMove ? `The next idea: ${nextMove}` : 'Main line complete'}</h3><p>{nextMove ? `${game.turn() === 'w' ? 'White' : 'Black'} to move. Find the move that carries the opening’s central idea forward.` : 'You have reached the first reference position. Now choose your plan.'}</p></div><div className="coach-actions"><div className="score"><span>DRILL SCORE</span><strong>{String(score).padStart(2, '0')}</strong></div><button onClick={startDrill}>Reset drill</button></div></aside></section>
    <section className="notes" id="field-notes"><div className="notes-title"><p className="eyebrow">FIELD NOTES</p><h2>The ideas that survive<br />when the book ends.</h2><label className="opening-notebook" htmlFor="opening-note"><span>YOUR {opening.name.toUpperCase()} NOTE</span><textarea id="opening-note" value={openingNotes[opening.id] || ''} onChange={(event) => saveOpeningNote(event.target.value)} placeholder="Write the plan you want to remember, a sideline that annoyed you, or the defensive idea you keep missing…" /><small>Saved privately in this browser.</small></label></div><article><span>01</span><h3>Plan of attack</h3><ul>{opening.plans.map((plan) => <li key={plan}>{plan}</li>)}</ul></article><article><span>02</span><h3>Common mistake</h3><p>{opening.trap}</p></article><article><span>03</span><h3>How to defend it</h3><p>{opening.defense}</p></article></section>
    <section className="intelligence" id="position-desk" aria-label="Live position intelligence"><div className="intel-heading"><div><p className="eyebrow">LIVE POSITION DESK</p><h2>What the database<br /><em>likes from here.</em></h2></div><p>Current-position move quality, queried from ChessDB’s public analysis database. Use it as a second opinion—not a substitute for understanding the plan.</p></div>{analysisPosition && <div className="analysis-banner"><span>ANALYSING</span><strong>{activePositionLabel}</strong><button onClick={() => setAnalysisPosition(null)}>Return to lesson position ↩</button></div>}<div className="material-ledger"><div><span>WHITE MATERIAL</span><strong>{materialLedger.white.total}</strong><small>{materialLedger.whitePieces}</small></div><p>{materialLedger.verdict}</p><div><span>BLACK MATERIAL</span><strong>{materialLedger.black.total}</strong><small>{materialLedger.blackPieces}</small></div></div><div className="intel-body"><div className="intel-status"><span className={`status-dot ${intelligence.status}`}></span><span>{intelligence.status === 'loading' ? 'Reading the position…' : intelligence.status === 'ready' ? activePositionLabel : 'Connection paused'}</span><small>Source: <a href="https://www.chessdb.cn/" target="_blank" rel="noreferrer">ChessDB ↗</a></small></div><div className="intel-moves">{intelligence.status === 'ready' && explorerMoves.length ? explorerMoves.map((move) => <div className="intel-move" key={move.move}><strong>{move.san}</strong><span className="move-bar"><i style={{ width: `${Math.min(100, Math.max(8, Number(move.winrate) || 0))}%` }}></i></span><b>{move.winrate ? `${Number(move.winrate).toFixed(1)}%` : '—'}</b><small>{move.note || 'book'}</small></div>) : <p className="intel-empty">{intelligence.status === 'loading' ? 'Finding the strongest continuations…' : 'No live data for this exact position yet. Explore another point in the line.'}</p>}</div></div></section>
    <section className="engine-lens"><div className="engine-heading"><div><p className="eyebrow">CLOUD ENGINE LENS</p><h2>Ask the engine.<br /><em>Keep your judgment.</em></h2></div><p>Cloud evaluation gives you candidate lines after you have tried to explain the position yourself. Scores are from White’s perspective.</p></div><div className="engine-body"><div className="engine-state"><span className={`status-dot ${engine.status}`}></span><strong>{engine.status === 'ready' ? `Depth ${engine.depth}` : engine.status === 'loading' ? 'Scanning cloud eval…' : 'No cloud entry yet'}</strong>{engine.status === 'ready' && <small>{Math.round((engine.knodes || 0) / 1000).toLocaleString()}k nodes · 3 principal variations</small>}{engineVerdict && <div className="engine-verdict"><span>POSITION READ</span><b>{engineVerdict.title}</b><p>{engineVerdict.detail}</p></div>}<a href={lichessAnalysisLink} target="_blank" rel="noreferrer">Open this position in Lichess ↗</a></div><div className="engine-lines">{engine.status === 'ready' && engineLines.length ? engineLines.map((line, index) => <div className="engine-line" key={`${line.moves}-${index}`}><b>{line.evaluation}</b><span>{line.moves.map((move, moveIndex) => <i key={`${move}-${moveIndex}`}>{moveIndex % 2 === 0 ? `${Math.floor(moveIndex / 2) + 1}. ` : ''}{move} </i>)}</span></div>) : <p className="engine-empty">{engine.status === 'loading' ? 'Looking for a deep evaluation of this exact position…' : 'This position is not in the cloud cache yet. That is normal for uncommon branches.'}</p>}</div></div><div className="candidate-sandbox"><div><p className="eyebrow">CANDIDATE LAB</p><h3>Play your move.<br /><em>Then interrogate it.</em></h3><p>{analysisFeedback}</p><button onClick={() => { setAnalysisSelected(null); setAnalysisFeedback('Choose a piece, then test the candidate move you would actually play.') }}>Clear candidate</button></div><div><Board game={new Chess(activeFen)} orientation="w" selected={analysisSelected} onSquare={handleAnalysisSquare} /><small>Legal destinations light up after you choose a piece. Promotions default to a queen.</small></div></div></section>
    {tablebase.status !== 'ineligible' && <section className="tablebase-truth"><div><p className="eyebrow">SYZYGY TABLEBASE</p><h2>Not an opinion.<br /><em>Perfect play.</em></h2><p>{activePieceCount} pieces on the board. Tablebases know the exact result from here.</p></div><div className="tablebase-result">{tablebase.status === 'ready' ? <><div className="tb-verdict"><span>RESULT FOR SIDE TO MOVE</span><strong>{tablebase.category.replace('-', ' ')}</strong><small>{tablebase.dtz ? `${Math.abs(tablebase.dtz)} plies to the next zeroing move` : 'Exact position result'}</small></div><div className="tb-moves">{tablebase.moves.map((move) => <div key={move.uci}><b>{move.san}</b><span>{move.category.replace('-', ' ')}</span><small>{move.dtz ? `DTZ ${Math.abs(move.dtz)}` : 'tablebase move'}</small></div>)}</div></> : <p className="tb-loading">{tablebase.status === 'loading' ? 'Probing exact endgame truth…' : 'Exact tablebase data is temporarily unavailable.'}</p>}</div></section>}
    <section className="puzzle-zone" id="puzzle-zone"><div className="puzzle-heading"><div><p className="eyebrow">LIVE FROM LICHESS</p><h2>Daily tactical<br /><em>pulse.</em></h2></div><div className="puzzle-meta">{puzzle.status === 'ready' ? <><span>{puzzle.puzzle.rating} RATING</span><span>{puzzle.puzzle.plays.toLocaleString()} SOLVES</span></> : <span>LOADING PUZZLE</span>}</div></div><div className="puzzle-workspace"><div className="puzzle-board">{puzzleGame ? <Board game={puzzleGame} orientation={puzzleSide || 'w'} selected={puzzleSelected} onSquare={handlePuzzleSquare} /> : <div className="puzzle-loading">Finding today’s position…</div>}<p className="puzzle-feedback">{puzzleFeedback}</p></div><div className="puzzle-brief"><p className="eyebrow">CALCULATE, DON’T GUESS</p><h3>{puzzleStep >= (puzzle.puzzle?.solution.length || Infinity) ? 'Line complete.' : 'Your move.'}</h3><p>Start by asking what is forcing. The best tactical decisions are usually checks, captures, or threats.</p>{puzzle.status === 'ready' && <div className="puzzle-tags">{puzzle.puzzle.themes.slice(0, 4).map((theme) => <span key={theme}>{theme.replace(/([A-Z])/g, ' $1')}</span>)}</div>}<button onClick={resetPuzzle}>Reset position <span>↺</span></button><a href="https://lichess.org/training" target="_blank" rel="noreferrer">More Lichess puzzles ↗</a></div></div></section>
    <section className="tactics-compass" id="tactics-compass"><div className="compass-heading"><div><p className="eyebrow">THE TACTICAL VOCABULARY</p><h2>See the motif<br /><em>before the move.</em></h2></div><div><strong>{reviewedPatterns.length}<i>/</i>{tacticPatterns.length}</strong><span>patterns reviewed</span></div></div><div className="compass-workspace"><div className="pattern-index">{tacticPatterns.map((item, index) => <button className={`${activePattern === item.id ? 'active' : ''} ${reviewedPatterns.includes(item.id) ? 'reviewed' : ''}`} onClick={() => setActivePattern(item.id)} key={item.id}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title}</strong><small>{item.level}</small></button>)}</div><article className="pattern-inspector"><p className="eyebrow">{pattern.level}</p><h3>{pattern.title}</h3><div><span>THE SIGNAL</span><strong>{pattern.cue}</strong></div><div><span>YOUR CHECK</span><p>{pattern.check}</p></div><footer><button onClick={() => togglePattern(pattern.id)}>{reviewedPatterns.includes(pattern.id) ? 'Reviewed ✓' : 'Mark reviewed'}</button><a href={`https://lichess.org/training/${pattern.id}`} target="_blank" rel="noreferrer">Train {pattern.title} on Lichess ↗</a></footer></article></div></section>
    <section className="library" id="library"><div className="library-heading"><div><p className="eyebrow">THE REPERTOIRE ROOM</p><h2>{openings.length} foundational<br /><em>opening systems.</em></h2></div><p>Choose a family, find your line, and take it straight to the board. This is a practical first library—not an intimidating encyclopedia.</p></div><div className="repertoire-queue"><div><p className="eyebrow">MY REPERTOIRE · {savedOpenings.length} SAVED</p><strong>{repertoireQueue.length ? 'Your next few systems' : 'Start a personal repertoire'}</strong></div>{repertoireQueue.length ? <div className="queue-lines">{repertoireQueue.map((item, index) => <button onClick={() => selectOpening(item.id)} key={item.id}><span>{String(index + 1).padStart(2, '0')} · {item.eco}</span><b>{item.name}</b><i>{index === 0 ? 'Study line →' : 'Queue next'}</i></button>)}</div> : <p>Save openings below. Keep it narrow: one White system and one response to 1.e4 / 1.d4 is enough to begin.</p>}</div><div className="library-controls"><div className="filters">{categories.map((category) => <button key={category} className={filter === category ? 'chosen' : ''} onClick={() => setFilter(category)}>{category}</button>)}</div><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an opening" aria-label="Find an opening" /></label></div><div className="opening-library">{visibleOpenings.map((item) => <article className={`library-opening ${item.id === openingId ? 'selected-opening' : ''}`} key={item.id}><button onClick={() => selectOpening(item.id)}><span>{item.eco}</span><b>{item.name}</b><small>{item.category} · {item.tempo}</small><i>Study line →</i></button><button className="save-opening" aria-pressed={savedOpenings.includes(item.id)} onClick={() => toggleRepertoire(item.id)}>{savedOpenings.includes(item.id) ? 'In repertoire ✓' : '+ Repertoire'}</button></article>)}{!visibleOpenings.length && <p className="empty">No opening found. Try another name or family.</p>}</div></section>
    <section className="game-lab" id="game-lab"><div className="lab-heading"><div><p className="eyebrow">YOUR COMPLETE GAME, ONE LAYER AT A TIME</p><h2>The opening is the invitation.<br /><em>The rest is the game.</em></h2></div><p>First Rank carries you beyond the first moves: train the decisions that convert a familiar position into points.</p></div><div className="lab-tabs">{gameLabs.map((item) => <button onClick={() => setActiveLab(item.id)} className={activeLab === item.id ? 'active' : ''} key={item.id}>{item.label}<strong>{item.title}</strong></button>)}</div><div className="lab-workspace"><div className="lab-board"><p className="eyebrow">{lab.eyebrow} · {labSolved ? 'IDEA FOUND' : 'MOVE TO PROVE IT'}</p><Board game={labGame} orientation="w" selected={labSelected} lastMove={labLastMove} onSquare={handleLabSquare} /><p>{lab.mission}</p></div><div className="lab-brief"><p className="eyebrow">THINK BEFORE YOU MOVE</p><h3>{lab.title}</h3><p>{lab.prompt}</p><ol>{lab.focus.map((item) => <li key={item}>{item}</li>)}</ol><div className={`lab-feedback ${labSolved ? 'solved' : ''}`}>{labFeedback}</div>{labSolved && <div className="lab-reflection"><p className="eyebrow">RETRIEVAL CHECK</p><label htmlFor="lab-reflection">In your own words: why does {lab.answer} work?</label><div><input id="lab-reflection" value={labReflection} onChange={(event) => setLabReflection(event.target.value)} placeholder="Name the plan or technique, not just the move." /><button onClick={saveLabReflection}>Keep this idea</button></div>{labReflections.find((item) => item.labId === lab.id) && <small>Last note: “{labReflections.find((item) => item.labId === lab.id).note}”</small>}</div>}<button onClick={analyseLabPosition}>Analyse this position <span>↑</span></button><button onClick={() => { setLabFen(lab.fen); setLabSelected(null); setLabSolved(false); setLabLastMove(null); setLabReflection(''); setLabFeedback('Choose a piece, then make the move that proves the idea.') }}>Reset this position <span>↺</span></button></div></div></section>
    <section className="planning-compass" id="planning-compass"><div className="planning-heading"><div><p className="eyebrow">MIDDLEGAME POSITION COMPASS</p><h2>Before the move,<br /><em>read the board.</em></h2></div><p>Strong players do not merely “find ideas.” They compare the imbalances in the same order until a plan becomes inevitable.</p></div><div className="planning-workspace"><div className="planning-index">{planningFramework.map((item) => <button className={activePlanningLens === item.id ? 'active' : ''} onClick={() => setActivePlanningLens(item.id)} key={item.id}><span>{item.number}</span><strong>{item.title}</strong></button>)}</div><article className="planning-lesson"><p className="eyebrow">POSITION AUDIT · {planningLens.number}</p><h3>{planningLens.title}</h3><div><span>ASK</span><strong>{planningLens.question}</strong></div><div><span>THEN</span><p>{planningLens.action}</p></div><button onClick={() => document.querySelector('#game-lab')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Try it on the middlegame board ↑</button></article></div></section>
    <section className="endgame-route" id="endgame-route"><div className="route-heading"><div><p className="eyebrow">ENDGAME TECHNIQUE ROUTE</p><h2>The positions you<br /><em>must not fumble.</em></h2></div><p>Six non-negotiable mechanisms, each connected to an exact position. Read the rule, state the plan aloud, then test your understanding against perfect play.</p></div><div className="route-workspace"><div className="route-index">{endgameRoute.map((item) => <button className={activeEndgame === item.id ? 'active' : ''} onClick={() => setActiveEndgame(item.id)} key={item.id}><span>{item.number}</span><strong>{item.title}</strong><small>{item.level}</small></button>)}</div><article className="route-lesson"><p className="eyebrow">{endgameLesson.level}</p><h3>{endgameLesson.title}</h3><div><span>THE RULE</span><strong>{endgameLesson.rule}</strong></div><div><span>YOUR JOB</span><p>{endgameLesson.mission}</p></div><button onClick={analyseEndgameLesson}>Open exact position + tablebase ↗</button></article></div></section>
    <section className="game-review" id="game-review"><div className="review-heading"><div><p className="eyebrow">BRING YOUR OWN GAME</p><h2>Turn a loss into<br /><em>a training plan.</em></h2></div><p>Paste any standard PGN. Atlas reads it locally in your browser and lets you step through the decisive moments—nothing is uploaded.</p></div><div className="review-workspace"><div className="review-input"><label htmlFor="pgn">PGN / MOVETEXT</label><textarea id="pgn" value={pgnInput} onChange={(event) => setPgnInput(event.target.value)} placeholder={'1. e4 e5 2. Nf3 Nc6 3. Bb5 a6\n\nOr paste a complete PGN export…'} /><button onClick={reviewPgn}>Read my game <span>→</span></button><p>{reviewFeedback}</p></div><div className="review-result">{reviewGame ? <><div className="review-meta"><span>{review.headers.White} vs {review.headers.Black}</span><b>{review.headers.Result}</b></div><div className="review-controls"><button onClick={() => setReviewPly(0)} disabled={!reviewPly}>↞</button><button onClick={() => setReviewPly((current) => Math.max(0, current - 1))} disabled={!reviewPly}>←</button><span>{reviewPly} / {review.moves.length} · {reviewPly ? `${Math.ceil(reviewPly / 2)}${reviewPly % 2 ? '.' : '…'}` : 'Start'}</span><button onClick={() => setReviewPly((current) => Math.min(review.moves.length, current + 1))} disabled={reviewPly === review.moves.length}>→</button><button onClick={() => setReviewPly(review.moves.length)} disabled={reviewPly === review.moves.length}>↠</button></div><Board game={reviewGame} orientation="w" onSquare={() => {}} /><div className="review-coach"><p className="eyebrow">{reviewMove ? `MOVE ${reviewPly} · ${reviewMove.san}` : 'POSITION COACH'}</p><strong>{reviewMoment}</strong></div><button className="send-to-desk" onClick={analyseReviewPosition}>Analyse this moment ↑</button><p><strong>{review.moves.length} plies read.</strong> Use the arrows to find a pawn move, capture, or king-safety commitment worth analysing.</p></> : <div className="review-placeholder"><span>♞</span><strong>Your game will land here.</strong><p>Then step through the decision points before comparing a position with the engine and database above.</p></div>}</div></div><div className="focus-inbox"><div><p className="eyebrow">TURN INSIGHT INTO REPETITION</p><h3>My focus queue</h3><p>Save one concrete finding from a review. It becomes the next thing worth training.</p></div><div className="focus-compose"><select value={focusArea} onChange={(event) => setFocusArea(event.target.value)} aria-label="Focus area">{journalAreas.map((area) => <option value={area.id} key={area.id}>{area.label}</option>)}</select><input value={focusDraft} onChange={(event) => setFocusDraft(event.target.value)} placeholder={reviewMove ? `e.g. Why ${reviewMove.san} changed the position` : 'Describe the habit to train'} /><button onClick={saveFocusItem}>Save focus +</button></div><div className="focus-list">{focusItems.length ? focusItems.slice(0, 4).map((item) => <div key={item.id}><span>{journalAreas.find((area) => area.id === item.area)?.label || item.area}</span><p>{item.note}</p><button onClick={() => { logPractice(item.area); removeFocusItem(item.id) }}>Train 15m ✓</button><button aria-label="Remove focus item" onClick={() => removeFocusItem(item.id)}>×</button></div>) : <p className="focus-empty">No saved findings yet. The best first note is a decision you want to handle differently next game.</p>}</div></div></section>
    <section className="player-desk" id="player-desk"><div className="player-heading"><div><p className="eyebrow">LIVE PLAYER INTEL</p><h2>Know the games<br /><em>you actually play.</em></h2></div><p>Look up any public Lichess account. Ratings and game totals are live from Lichess, so your training plan starts with the formats you really use.</p></div><div className="player-workspace"><form className="player-form" onSubmit={loadProfile}><label htmlFor="profile-name">PUBLIC LICHESS HANDLE</label><div><input id="profile-name" value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="e.g. DrNykterstein" /><button type="submit">Look up ↗</button></div><p>No sign-in. Public profile data only. <a href="https://lichess.org" target="_blank" rel="noreferrer">Lichess ↗</a></p></form><div className="player-result">{profile.status === 'ready' ? <><div className="profile-title"><span>{profile.title || 'PLAYER'}</span><h3>{profile.username}</h3><a href={`https://lichess.org/@/${profile.username}`} target="_blank" rel="noreferrer">Open profile ↗</a></div><div className="perf-grid">{Object.entries(profile.perfs).map(([key, perf]) => <div key={key}><span>{key}</span><strong>{perf.rating}</strong><small>{perf.games || 0} games · {perf.prog > 0 ? '+' : ''}{perf.prog || 0}</small></div>)}</div><div className="profile-foot"><span>{(profile.count.all || 0).toLocaleString()} total games</span><span>{profile.count.all ? `${Math.round(((profile.count.win || 0) / profile.count.all) * 100)}% wins` : 'New profile'}</span><span>{profile.online ? 'Online now' : 'Offline'}</span></div></> : <div className="player-empty"><span>{profile.status === 'loading' ? '↻' : '♞'}</span><strong>{profile.status === 'loading' ? 'Reading the scorecard…' : profile.status === 'error' ? profile.error : 'A player’s live scorecard will appear here.'}</strong><p>Compare formats, then train the weakness—not merely the rating you like most.</p></div>}</div></div></section>
    <section className="profile-signals" aria-label="Lichess player signals"><div className="signals-heading"><div><p className="eyebrow">PUBLIC GAME SIGNALS</p><h2>What the archive<br /><em>actually says.</em></h2></div><p>A factual snapshot from this public Lichess profile. Use it to choose a format to study—not to pretend game counts can read someone’s mind.</p></div>{profileSignals ? <><div className="signal-grid"><article><span>PRIMARY ARENA</span><strong>{profileSignals.primary ? profileSignals.primary.name : 'No main format'}</strong><small>{profileSignals.primary ? `${profileSignals.primary.games.toLocaleString()} recorded games` : 'No public game history'}</small></article><article><span>RATED SHARE</span><strong>{profileSignals.ratedShare}%</strong><small>of public games were rated</small></article><article><span>BOARD HOURS</span><strong>{profileSignals.hours.toLocaleString()}</strong><small>public time played on Lichess</small></article><article><span>ARCHIVE AGE</span><strong>{profileSignals.years === null ? '—' : `${profileSignals.years}y`}</strong><small>since this account was created</small></article></div><div className="signal-actions"><p>{profileSignals.primary ? `${profile.username} has the deepest public sample in ${profileSignals.primary.name}. Start there if you are comparing their familiar environment with your own.` : 'This profile has no public time-control sample to compare yet.'}</p><a href={`https://lichess.org/@/${profile.username}/download`} target="_blank" rel="noreferrer">Download public games ↗</a><a href={`https://lichess.org/@/${profile.username}/all`} target="_blank" rel="noreferrer">Open game archive ↗</a></div></> : <div className="signals-empty"><span>♞</span><strong>Look up a public handle above.</strong><p>Then First Rank turns the available Lichess archive into a useful, privacy-respecting preparation snapshot.</p></div>}</section>
    <section className="coordinate-gym"><div className="coordinate-copy"><p className="eyebrow">BOARD FLUENCY · BEGINNER FOUNDATION</p><h2>Know the board<br /><em>without looking.</em></h2><p>Coordinates turn chess from “that pawn over there” into a language you can calculate with. Fast square recognition makes notation, tactics, and online lessons much easier.</p><div className="coordinate-metrics"><span><b>{coordinateScore}</b> squares found</span><span><b>{coordinateStreak}</b> current streak</span></div><p className="coordinate-feedback">{coordinateFeedback}</p></div><div className="coordinate-board"><div className="coordinate-prompt"><span>FIND THIS SQUARE</span><strong>{coordinateTarget}</strong><button onClick={() => { setCoordinateTarget(randomCoordinate()); setCoordinateStreak(0); setCoordinateFeedback('Fresh square. Read the file first, then the rank.') }}>Skip →</button></div><Board game={new Chess()} orientation="w" onSquare={handleCoordinateSquare} /><small>White’s home rank is 1. Files move left to right: a through h.</small></div></section>
    <section className="capability-ladder" id="capability-ladder"><div className="ladder-heading"><div><p className="eyebrow">PICK THE RIGHT KIND OF WORK</p><h2>Meet your game<br /><em>where it is.</em></h2></div><p>You do not become strong by training advanced things too early. Choose the route that feels honest, then follow the next useful action.</p></div><div className="ladder-workspace"><div className="ladder-steps">{capabilityPaths.map((item) => <button className={activeCapability === item.id ? 'active' : ''} onClick={() => navigateLearnPath(item.id)} key={item.id}><span>{item.number}</span><strong>{item.title}</strong><small>{activeCapability === item.id ? 'Current route' : `Open /learn/${item.id}`}</small></button>)}</div><article className="ladder-detail"><p className="eyebrow">ROUTE {capability.number} · SHAREABLE PATH</p><h3>{capability.title}</h3><p>{capability.signal}</p><ul>{capability.focus.map((item) => <li key={item}>{item}</li>)}</ul><button onClick={() => navigate(capability.target.slice(1).split('-')[0] === 'position' ? 'analysis' : capability.target === '#repertoire-rail' ? 'openings' : capability.target === '#planning-compass' ? 'practice' : capability.target === '#game-review' ? 'review' : 'analysis', capability.target.slice(1))}>{capability.action} ↗</button></article></div></section>
    <section className="daily-session" id="daily-session"><div className="session-intro"><p className="eyebrow">TODAY’S TRAINING FLIGHT PLAN</p><h2>One strong session.<br /><em>Zero wandering.</em></h2><p>Built from the work that is actually waiting: your due recall, unresolved misses, and the phase you have neglected this week.</p><div className="session-count"><strong>{completedSessionCount}<i>/</i>{dailySession.length}</strong><span>sessions checked off today</span></div></div><div className="session-runway">{dailySession.map((task, index) => <article className={sessionChecks.includes(task.id) ? 'done' : ''} key={task.id}><span>{String(index + 1).padStart(2, '0')} · {task.tag}</span><h3>{task.title}</h3><p>{task.detail}</p><footer><button onClick={() => launchSessionTask(task)}>{task.action} <i>→</i></button><button className="session-check" onClick={() => toggleSessionCheck(task.id)} aria-pressed={sessionChecks.includes(task.id)}>{sessionChecks.includes(task.id) ? 'Done today ✓' : 'Check off'}</button></footer></article>)}</div></section>
    <section className="training-journal"><div className="journal-heading"><div><p className="eyebrow">THIS WEEK’S BOARDWORK</p><h2>Balance beats<br /><em>bingeing.</em></h2></div><div><strong>{journalTotal}</strong><span>minutes logged</span><p>Next up: <b>{leastTrained.label}</b> — {leastTrained.cue.toLowerCase()}.</p></div></div><div className="journal-grid">{journalAreas.map((area) => <article key={area.id}><div><span>{area.label}</span><b>{journal.minutes[area.id] || 0}<i>m</i></b></div><p>{area.cue}</p><div className="journal-track"><i style={{ width: `${Math.min(100, ((journal.minutes[area.id] || 0) / 45) * 100)}%` }}></i></div><button onClick={() => logPractice(area.id)}>Log 15 minutes +</button></article>)}</div><button className="journal-reset" onClick={resetJournal}>Reset this week</button></section>
    <section className="model-theatre"><div className="model-heading"><div><p className="eyebrow">THE MODEL ROOM</p><h2>Watch the plan<br /><em>become the move.</em></h2></div><p>Step through three compact reference sequences. The annotation changes only when the position earns a new question—so the board stays the teacher.</p></div><div className="model-tabs">{modelStudies.map((study) => <button className={activeModel === study.id ? 'active' : ''} onClick={() => { setActiveModel(study.id); setModelPly(0) }} key={study.id}><span>{study.phase}</span><strong>{study.title}</strong><small>{study.byline}</small></button>)}</div><div className="model-workspace"><div className="model-board"><div className="model-controls"><span>{modelPly} / {modelStudy.moves.length}</span><div><button disabled={!modelPly} onClick={() => setModelPly((ply) => Math.max(0, ply - 1))}>←</button><button disabled={modelPly === modelStudy.moves.length} onClick={() => setModelPly((ply) => Math.min(modelStudy.moves.length, ply + 1))}>→</button></div></div><Board game={modelGame} orientation="w" onSquare={() => {}} lastMove={modelLastMove} /><div className="model-moves">{modelStudy.moves.map((move, index) => <button onClick={() => setModelPly(index + 1)} className={index === modelPly - 1 ? 'current' : ''} key={`${move}-${index}`}>{index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ` : ''}{move}</button>)}</div></div><article className="model-note"><p className="eyebrow">AT MOVE {modelPly || 'START'}</p><h3>{modelAnnotation.title}</h3><p>{modelAnnotation.text}</p><div><span>YOUR JOB</span><strong>Pause here. Say the plan before advancing the board.</strong></div><button onClick={() => openAnalysisPosition(modelGame.fen(), `${modelStudy.title} · move ${Math.ceil(modelPly / 2) || 1}`)}>Send this position to analysis ↗</button></article></div></section>
    <section className="curriculum" id="curriculum"><div className="curriculum-top"><div><p className="eyebrow">THE PATH TO STRONG CHESS</p><h2>Train what actually<br /><em>makes you dangerous.</em></h2></div><div className="completion"><span>TRACKS COMPLETE</span><strong>{completedTracks.length}<i>/</i>{curriculum.length}</strong><p>Build a balanced game. Mark a track when you’ve trained it this week.</p></div></div><div className="curriculum-grid">{curriculum.map((track) => <article key={track.id} className={completedTracks.includes(track.id) ? 'done' : ''}><div><span>{track.number}</span><small>{track.level}</small></div><h3>{track.title}</h3><p>{track.detail}</p><ul>{track.tasks.map((task) => <li key={task}>{task}</li>)}</ul><button onClick={() => toggleTrack(track.id)} aria-pressed={completedTracks.includes(track.id)}>{completedTracks.includes(track.id) ? 'Completed this week ✓' : 'Mark as trained'}</button></article>)}</div></section>
    <section className="resource-dock"><div><p className="eyebrow">THE DEEPER TOOLKIT</p><h2>Resources worth<br /><em>having open.</em></h2></div><div className="resource-list">{resourceDock.map((resource) => <a href={resource.href} target="_blank" rel="noreferrer" key={resource.name}><span>{resource.label}</span><strong>{resource.name}</strong><p>{resource.detail}</p><i>Open resource ↗</i></a>)}</div></section>
    {page === 'practice' && <section className="structure-atlas" id="structure-atlas"><div className="structure-heading"><div><p className="eyebrow">PAWN STRUCTURE ATLAS</p><h2>When the pawns<br /><em>tell the plan.</em></h2></div><p>Structures are the chessboard’s long memory. Once you recognize one, you can stop guessing and start looking for the breaks, squares, and piece trades that make sense.</p></div><div className="structure-workspace"><div className="structure-index">{pawnStructures.map((item, index) => <button className={activeStructure === item.id ? 'active' : ''} onClick={() => setActiveStructure(item.id)} key={item.id}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title}</strong><small>{item.label}</small></button>)}</div><article className="structure-lesson"><p className="eyebrow">{pawnStructure.label}</p><h3>{pawnStructure.title}</h3><div><span>THE SIGNAL</span><p>{pawnStructure.signal}</p></div><div><span>THE PLAN</span><p>{pawnStructure.plan}</p></div><div><span>KEY BREAKS</span><strong>{pawnStructure.breaks}</strong></div><div><span>WATCH OUT</span><p>{pawnStructure.warning}</p></div><button onClick={() => navigate('analysis', 'position-desk')}>Bring a structure to analysis ↗</button></article></div></section>}
    {page === 'learn' && <section className="study-export"><div><p className="eyebrow">YOUR STUDY, YOURS TO KEEP</p><h2>Take your<br /><em>work with you.</em></h2></div><div><p>Download a private JSON snapshot of your repertoire, field notes, revision queue, mistake book, focus items, practice journal, and boardwork ledger. Nothing is uploaded.</p><button onClick={exportStudySnapshot}>Download my study snapshot <span>↓</span></button></div></section>}
    <footer><span>FIRST RANK — PLAY WITH INTENTION</span><span>Pieces: Cburnett set via Lichess · CC BY-SA</span></footer>
  </main>
}

export default App
