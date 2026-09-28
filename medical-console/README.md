# Health Console (working name)

A Next.js + React Three Fiber frontend: live global health data on a
draggable 3D globe, a condition lookup panel (symptoms / precautions /
medical approach / non-medical approach / historical use), a live news
ticker, and an extensible module grid that future features slot into.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Where things live

- `app/page.tsx` — assembles all sections
- `app/globals.css` — all design tokens and styling (colors, type, layout)
- `components/Globe.tsx` — the shared 3D globe (used in the hero and the
  world-data section), built with `@react-three/fiber` + `drei`'s
  `OrbitControls` for drag-to-rotate
- `components/LookupPanel.tsx` — the condition search + tabbed content;
  the `content` object holds placeholder copy — replace with your real,
  sourced data
- `components/WorldDataPanel.tsx` — second globe wired to a live region
  readout
- `components/ModuleGrid.tsx` — the `modules` array is the whole
  extensibility system: add an object here and it renders as a new tile

## Naming

Search for `[PRODUCT NAME]` (in `components/Nav.tsx`) and
`[Product name]` (in `components/Footer.tsx`) once you've picked a name.

## Before this goes anywhere real

- Every placeholder medical claim needs to point to an actual, verified
  source (the `source-tag` / `disclaimer` elements are there for this).
- Avoid absolute accuracy claims ("100% accurate") in the UI copy — say
  what's actually true instead (e.g. "clinically sourced," "last verified
  on X"), and always route people to a clinician for anything beyond
  general information.
