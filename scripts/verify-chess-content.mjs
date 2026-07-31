import fs from 'node:fs'
import { Chess } from 'chess.js'

const source = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const fens = [...source.matchAll(/fen:\s*'([^']+)'/g)].map((match) => match[1])
const labSource = source.match(/const gameLabs = \[([\s\S]*?)\n\]\n\nconst modelStudies/)
const labPairs = labSource ? [...labSource[1].matchAll(/fen:\s*'([^']+)'[\s\S]*?answer:\s*'([^']+)'/g)].map((match) => ({ fen: match[1], answer: match[2] })) : []

if (!fens.length || !labPairs.length) throw new Error('No chess lesson content was found to validate.')

for (const fen of fens) new Chess(fen)

for (const { fen, answer } of labPairs) {
  const game = new Chess(fen)
  const move = game.move(answer)
  if (!move) throw new Error(`Lab answer ${answer} is not legal from ${fen}`)
}

console.log(`Validated ${fens.length} lesson positions and ${labPairs.length} interactive lab moves.`)
