# First Rank

First Rank is a browser-first chess learning workspace: build an opening repertoire, practice middlegame plans and endgames, review PGNs, inspect positions, and use public Lichess/ChessDB signals without an account.

## Workspaces

- `/` — daily boardwork, live Lichess TV pulse, recall queue, and learning ledger
- `/openings` — opening atlas and drills
- `/openings/:openingId` — a shareable opening study, such as `/openings/sicilian`
- `/practice` — tactics, pawn structures, middlegame labs, and endgame routes
- `/practice/:route` — a direct practice destination: `tactics`, `middlegame`, `structures`, or `endgames`
- `/analysis?fen=...` — a shareable FEN position with ChessDB, cloud engine, and tablebase tools
- `/review` — local PGN review and training-focus capture
- `/scout` — public Lichess profile, format, and rating-history context
- `/learn` — daily program, coordinate gym, reference studies, and export

## Public data sources

- [ChessDB](https://www.chessdb.cn/) for current-position opening candidates
- [Lichess](https://lichess.org/) for public profiles, rating history, TV boards, cloud evaluation, tablebases, and daily puzzles

Public data is read only. Personal notes, repertoire choices, review queue, and progress live locally in the browser.

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

`vercel.json` rewrites application routes to the Vite entry point so direct workspace and study URLs work in production.
