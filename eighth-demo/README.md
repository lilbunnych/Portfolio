# Eighth Demo — Ledgerly

Personal finance dashboard for a fictional app, "Ledgerly". All numbers are deterministic sample data.

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 (class-based dark mode)
- Recharts for the area and donut charts, Phosphor icons
- Relative `base` so `dist/` runs from any folder

## Features

- KPI tiles with change vs the previous period
- 3 / 6 / 12 month range switch that drives every widget
- Cash flow area chart, spending by category donut
- Monthly budgets with over-budget state
- Transactions: search, category filter, sortable date and amount, "show more", empty state
- Light / dark theme toggle remembered per browser
- Sidebar on desktop, bottom tab bar on phones

## Run

```bash
npm install
npm run dev
npm run build   # output in dist/
```
