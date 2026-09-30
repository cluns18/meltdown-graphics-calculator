# Meltdown Graphics pricing calculator

DTF-first instant pricing for Meltdown Graphics (Knoxville, TN), embedded on the store.

- **DTF apparel** is priced online from Jake's own published starting prices (meltdowngraphics.com
  quote page) plus the picked S&S blank over a basic tee at wholesale x2, plus his rush ladder.
  Every number and every assumption is in `netlify/functions/pricing.cjs` (`ASSUMPTIONS`).
- **Screen printing** is by request: the calculator collects the job and never shows a price.
- **Gang sheets** link out to the Gang Sheet Builder product.
- Garment step: three reasoned picks, then the whole S&S catalog (Supabase `calculator_catalog`).
- Quotes post to `obg-mail-api` with `shop_id: 'meltdown'`.

Build env (Netlify): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_FIREBASE_*`.
Check the math: `node scripts/verify-pricing.cjs`.
