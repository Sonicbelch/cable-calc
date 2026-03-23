# EOC Tools — BS 7671 Electrical Design Calculators

Free UK electrical design tools hosted at [tools.eoclondon.com](https://tools.eoclondon.com).

Built by [Electricians On Call London](https://eoclondon.com).

## Tools

| Tool | Route | Description |
|------|-------|-------------|
| Cable size (Iz) | `/cable-size` | Corrected current-carrying capacity, Ib ≤ In ≤ Iz chain, voltage drop, adiabatic |
| Voltage drop | `/voltage-drop` | Voltage drop vs BS 7671 Appendix 12 limits |
| Adiabatic | `/adiabatic` | Minimum CPC size using BS 7671 Reg 543.1.3 |
| Zs / disconnection | `/zs` | Max Zs lookup for MCB B/C/D, BS 88 and BS 3036 fuses |

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router)
- React 18
- Plain CSS (no Tailwind, no UI library)
- Hosted on [Vercel](https://vercel.com)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Running tests

```bash
npm test
```

## Deployment

This repo auto-deploys to Vercel on every push to `main`.

### Custom domain setup (tools.eoclondon.com)

1. In [Vercel dashboard](https://vercel.com) → Project → Settings → Domains
2. Add `tools.eoclondon.com`
3. In your DNS provider, add a CNAME record:
   - **Name:** `tools`
   - **Value:** `cname.vercel-dns.com`
4. Vercel will automatically provision an SSL certificate

## Data sources

- Cable current ratings: BS 7671:2018+A2:2022 Appendix 4, Tables 4D1A–4E4A
- Correction factors: BS 7671 Tables 4B1, 4B2, 4C1
- Voltage drop (mV/A/m): BS 7671 Appendix 4 (resistive component)
- Adiabatic k values: BS 7671 Tables 54.2–54.4
- Maximum Zs: BS 7671 Tables 41.2–41.4

## Disclaimer

These tools are preliminary design aids only. Results must be verified by a qualified electrician against the current edition of BS 7671 before any work is carried out or certified.
