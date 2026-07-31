import fs from 'node:fs'
import { Chess } from 'chess.js'

const source = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const fens = [...source.matchAll(/fen:\s*'([^']+)'/g)].map((match) => match[1])
const labSource = source.match(/const gameLabs = \[([\s\S]*?)\n\]\n\nconst modelStudies/)
const labPairs = labSource ? [...labSource[1].matchAll(/fen:\s*'([^']+)'[\s\S]*?answer:\s*'([^']+)'/g)].map((match) => ({ fen: match[1], answer: match[2] })) : []
const labPhases = labSource ? [...labSource[1].matchAll(/phase:\s*'([^']+)'/g)].map((match) => match[1]) : []
const openingSource = source.match(/const openings = \[([\s\S]*?)\n\]\n\nconst files/)
const openingLines = openingSource ? [...openingSource[1].matchAll(/moves:\s*\[([^\]]+)\]/g)].map((match) => [...match[1].matchAll(/'([^']+)'/g)].map((move) => move[1])) : []

if (!fens.length || !labPairs.length || !openingLines.length) throw new Error('No chess lesson content was found to validate.')
if (labPhases.length !== labPairs.length || !['middle', 'end'].every((phase) => labPhases.includes(phase))) throw new Error('Every interactive lab must belong to the middlegame or endgame route.')

for (const fen of fens) new Chess(fen)

for (const { fen, answer } of labPairs) {
  const game = new Chess(fen)
  const move = game.move(answer)
  if (!move) throw new Error(`Lab answer ${answer} is not legal from ${fen}`)
}

for (const line of openingLines) {
  const game = new Chess()
  for (const move of line) {
    if (!game.move(move)) throw new Error(`Opening move ${move} is not legal in ${line.join(' ')}`)
  }
}

console.log(`Validated ${fens.length} lesson positions, ${labPairs.length} interactive lab moves, and ${openingLines.length} opening lines.`)
