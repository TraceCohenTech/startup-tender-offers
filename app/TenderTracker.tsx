"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─── DATASET ─────────────────────────────────────────────────────────────────
// 63 events · 31 companies · 2022–2026
// Sources: PitchBook · Bloomberg · CNBC · TechCrunch · Reuters · Axios · WSJ
//          · Sacra · Forge Global · SecondaryLink · Compa · Company press releases
const TENDER_DATA = [
  // ══ OPENAI ══════════════════════════════════════════════════════════════════
  {
    company: "OpenAI", sector: "AI", date: "Jan 2023", valuation: 29,
    amountKnown: 300, amountStatus: "reported",
    sharePrice: null, buyers: "Thrive Capital, Founders Fund, Sequoia, a16z, K2 Global",
    notes: "Insider share sale at $27B–$29B valuation. Thrive, Founders Fund, Sequoia, a16z, and K2 Global bought ~$300M from existing shareholders. More than doubled the $14B 2021 mark.",
    recurring: true, dealType: "Employee Secondary",
  },
  {
    company: "OpenAI", sector: "AI", date: "Nov 2023", valuation: 86,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Thrive Capital (lead)",
    notes: "Tender extended to Jan 5, 2024. Employees offered window to sell at ~$86B valuation. Thrive Capital led. Amount never publicly confirmed.",
    recurring: true, dealType: "Employee Tender",
  },
  {
    company: "OpenAI", sector: "AI", date: "Nov 2024", valuation: 157,
    amountKnown: 1500, amountStatus: "reported",
    sharePrice: null, buyers: "SoftBank",
    notes: "SoftBank bought ~$1.5B from past & current employees at $157B valuation. Company never officially confirmed. ~$500M likely went to taxes. ~400 eligible employees, up to $10M each.",
    recurring: true, dealType: "Employee Tender",
  },
  {
    company: "OpenAI", sector: "AI", date: "Oct 2025", valuation: 500,
    amountKnown: 6600, amountStatus: "confirmed",
    sharePrice: null, buyers: "SoftBank, Thrive Capital, Dragoneer, MGX (Abu Dhabi), T. Rowe Price",
    notes: "Authorized up to $10.3B; only ~$6.6B tendered (employees held back). 600+ employees; 75+ cashed out max $30M each. Employees held profit participation units (PPUs), not traditional equity. ~$2B+ went to taxes out of the $6.6B. Largest private employee liquidity event in tech history.",
    recurring: true, dealType: "Employee Tender",
  },

  // ══ SPACEX ══════════════════════════════════════════════════════════════════
  {
    company: "SpaceX", sector: "Aerospace", date: "May 2022", valuation: 125,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: 70, buyers: "a16z (~$300M authorized), Gigafund, 137 Ventures, other Musk-aligned VCs",
    notes: "Leaked internal docs showed $70/share vs. $270 primary price. a16z authorized to buy ~4.3M shares (~$300M). Total amount undisclosed but likely $500M–$1B based on authorized buyers.",
    recurring: true, dealType: "Employee Tender",
  },
  {
    company: "SpaceX", sector: "Aerospace", date: "Dec 2022", valuation: 137,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: 80, buyers: "Undisclosed; select authorized investors",
    notes: "Year-end tender at $127B–$140B per Benzinga/Bloomberg. $80/share per Benzinga. Semi-annual cadence confirmed by Musk. Amount undisclosed.",
    recurring: true, dealType: "Employee Tender",
  },
  {
    company: "SpaceX", sector: "Aerospace", date: "H1 2023", valuation: 150,
    amountKnown: 750, amountStatus: "reported",
    sharePrice: null, buyers: "Andreessen Horowitz and undisclosed institutional investors",
    notes: "~$750M in insider shares at ~$150B valuation per Benzinga. a16z confirmed buyer. Part of semi-annual cadence.",
    recurring: true, dealType: "Employee Tender",
  },
  {
    company: "SpaceX", sector: "Aerospace", date: "Dec 2023", valuation: 180,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Institutional investors",
    notes: "Year-end tender at $180B valuation. Revenue ~$8.7B in 2023 implies ~20.7x LTM revenue. Amount undisclosed.",
    recurring: true, dealType: "Employee Tender",
  },
  {
    company: "SpaceX", sector: "Aerospace", date: "Jun 2024", valuation: 210,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: 112, buyers: "Undisclosed",
    notes: "$112/share; company + investors buying. Amount undisclosed. Bloomberg flagged $108–$110/share range earlier in year.",
    recurring: true, dealType: "Employee Tender",
  },
  {
    company: "SpaceX", sector: "Aerospace", date: "Dec 2024", valuation: 350,
    amountKnown: 1250, amountStatus: "confirmed",
    sharePrice: 185, buyers: "SpaceX (repurchased $500M) + external investors",
    notes: "$1.25B total; SpaceX directly bought back $500M. $185/share. 67% valuation jump from Jun 2024.",
    recurring: true, dealType: "Employee Tender + Buyback",
  },
  {
    company: "SpaceX", sector: "Aerospace", date: "Jul 2025", valuation: 400,
    amountKnown: 1000, amountStatus: "confirmed",
    sharePrice: 212, buyers: "SpaceX + undisclosed investors",
    notes: "$1B deal; $212/share. SpaceX bought an unspecified portion. $400B valuation.",
    recurring: true, dealType: "Employee Tender + Buyback",
  },
  {
    company: "SpaceX", sector: "Aerospace", date: "Dec 2025", valuation: 800,
    amountKnown: 2560, amountStatus: "confirmed",
    sharePrice: 421, buyers: "SpaceX + institutional investors",
    notes: "$2.56B in insider shares. $421/share. Doubled valuation from Jul 2025 in 6 months. Ahead of reported 2026 IPO at $1.5T target.",
    recurring: true, dealType: "Employee Tender + Buyback",
  },

  // ══ STRIPE ══════════════════════════════════════════════════════════════════
  {
    company: "Stripe", sector: "Fintech", date: "Mar 2023", valuation: 50,
    amountKnown: 6500, amountStatus: "confirmed",
    sharePrice: null, buyers: "New & existing institutional investors (Series I)",
    notes: "$6.5B Series I — entire round structured primarily as employee liquidity + tax coverage for expiring RSUs. 'Down round' from $95B 2021 peak. Stripe stated it 'doesn't need this capital to run its business.'",
    recurring: true, dealType: "Primary Round (Liquidity-Driven)",
  },
  {
    company: "Stripe", sector: "Fintech", date: "Feb 2024", valuation: 65,
    amountKnown: 694, amountStatus: "confirmed",
    sharePrice: null, buyers: "Sequoia, Goldman Sachs, and other existing investors",
    notes: "$694M employee liquidity tender at $65B — up 30% from Mar 2023. Stripe also repurchased shares alongside external buyers. Annual cadence solidifying.",
    recurring: true, dealType: "Employee Tender + Buyback",
  },
  {
    company: "Stripe", sector: "Fintech", date: "Nov 2024", valuation: 70,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Undisclosed secondary buyers",
    notes: "Employee tender at ~$70B per Bloomberg. Ongoing quiet secondary activity. Amount undisclosed.",
    recurring: true, dealType: "Employee Tender",
  },
  {
    company: "Stripe", sector: "Fintech", date: "Feb 2025", valuation: 91.5,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Undisclosed external investors + Stripe self-repurchase",
    notes: "Announced alongside 2024 annual letter ($1.4T TPV, +38% YoY). Amount undisclosed. Stripe also repurchased shares. Nearly back to $95B 2021 peak.",
    recurring: true, dealType: "Employee Tender + Buyback",
  },
  {
    company: "Stripe", sector: "Fintech", date: "Sep 2025", valuation: 107,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Undisclosed investors at 409A valuation",
    notes: "Internal 409A valuation reached $106.7B; Stripe entered talks to repurchase shares at that mark. 17% step-up from $91.5B.",
    recurring: true, dealType: "Internal Repurchase / Secondary",
  },
  {
    company: "Stripe", sector: "Fintech", date: "Feb 2026", valuation: 159,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Thrive Capital, Coatue, a16z + Stripe self-repurchase",
    notes: "Announced alongside 2025 annual letter ($1.9T TPV). Amount undisclosed. Thrive/Coatue/a16z bought majority; Stripe repurchased some. 'No near-term IPO plans.'",
    recurring: true, dealType: "Employee Tender + Buyback",
  },

  // ══ ANTHROPIC ═══════════════════════════════════════════════════════════════
  {
    company: "Anthropic", sector: "AI", date: "Mar 2025", valuation: 61.5,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: 56.09, buyers: "Undisclosed institutional investors",
    notes: "First-ever Anthropic tender. Employees could sell up to $2M at $56.09/share. Total size undisclosed.",
    recurring: false, dealType: "Employee Tender",
  },
  {
    company: "Anthropic", sector: "AI", date: "Apr 2026", valuation: 350,
    amountKnown: null, amountStatus: "reported",
    sharePrice: null, buyers: "Curated institutional syndicate (Coatue, GIC, others)",
    notes: "Targeted ~$6B; fell short as employees held shares betting on higher IPO. ~$5–6B final size per reports. Pre-money $350B. ARR crossed $30B within weeks of tender closing.",
    recurring: false, dealType: "Employee Tender",
  },

  // ══ DATABRICKS ══════════════════════════════════════════════════════════════
  {
    company: "Databricks", sector: "Data/AI", date: "Sep 2023", valuation: 43,
    amountKnown: 500, amountStatus: "reported",
    sharePrice: null, buyers: "T. Rowe Price, NVIDIA, others",
    notes: "$500M+ raise at $43B; included secondary component. First step toward addressing expiring employee stock grants.",
    recurring: false, dealType: "Primary Round (w/ Secondary)",
  },
  {
    company: "Databricks", sector: "Data/AI", date: "Dec 2024", valuation: 62,
    amountKnown: 10000, amountStatus: "confirmed",
    sharePrice: null, buyers: "Thrive Capital (lead), a16z, DST Global, GIC, Insight Partners, WCM, ICONIQ, MGX, Nvidia, Meta, others",
    notes: "$10B Series J — described as 'non-dilutive'; majority was employee tender/secondary. First RSU tender for Databricks employees. Largest VC secondary tender ever at time.",
    recurring: true, dealType: "Primary + Largest Employee Tender",
  },
  {
    company: "Databricks", sector: "Data/AI", date: "Sep 2025", valuation: 100,
    amountKnown: 1000, amountStatus: "confirmed",
    sharePrice: null, buyers: "Undisclosed; new investors",
    notes: "Series K at $100B; 61% jump from $62B. $1B raised. Included secondary/tender component. Ghodsi said investors 'reached out almost daily.'",
    recurring: true, dealType: "Primary + Employee Tender",
  },
  {
    company: "Databricks", sector: "Data/AI", date: "Mar 2026", valuation: 134,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Recurring tender participants",
    notes: "Recurring tender — second since large 2025 RSU release. Databricks committed to ongoing tenders. Part of $5B Series L raise context. Amount undisclosed.",
    recurring: true, dealType: "Employee Tender (Recurring)",
  },

  // ══ BYTEDANCE ═══════════════════════════════════════════════════════════════
  {
    company: "ByteDance", sector: "Consumer Internet", date: "2022", valuation: 300,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Company / private buyers",
    notes: "Ongoing employee secondary activity at $300B valuation. ByteDance remained private despite TikTok divestiture pressure. Terms vary by report.",
    recurring: true, dealType: "Employee Secondary",
  },
  {
    company: "ByteDance", sector: "Consumer Internet", date: "2024", valuation: 268,
    amountKnown: 5000, amountStatus: "reported",
    sharePrice: null, buyers: "Company / private buyers",
    notes: "ByteDance organized secondary sales and buybacks totaling ~$5B at ~$268B valuation. Slightly down from $300B peak. Employee liquidity a priority given long-delayed IPO.",
    recurring: true, dealType: "Company Buyback / Secondary",
  },

  // ══ REVOLUT ═════════════════════════════════════════════════════════════════
  {
    company: "Revolut", sector: "Fintech", date: "Aug 2024", valuation: 45,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Undisclosed institutional investors",
    notes: "Secondary share sale at $45B; employees given liquidity. Amount undisclosed. Company had just received UK banking license.",
    recurring: true, dealType: "Employee Secondary",
  },
  {
    company: "Revolut", sector: "Fintech", date: "Nov 2025", valuation: 75,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: 1381, buyers: "Coatue, Greenoaks, Dragoneer, Fidelity, Andreessen Horowitz, NVentures (Nvidia VC), Franklin Templeton",
    notes: "67% jump from Aug 2024. Employees could sell up to 20% of holdings. $1,381/share. Now Europe's most valuable private tech firm. Revenue $4B, profit $1.4B in 2024.",
    recurring: true, dealType: "Employee Secondary",
  },

  // ══ PLAID ═══════════════════════════════════════════════════════════════════
  {
    company: "Plaid", sector: "Fintech", date: "Apr 2025", valuation: 6.1,
    amountKnown: 575, amountStatus: "confirmed",
    sharePrice: null, buyers: "Franklin Templeton (lead), Fidelity, BlackRock, NEA, Ribbit Capital",
    notes: "Down round — 54% below $13.4B peak (2021). Proceeds primarily covered employee RSU tax withholding. Company confirmed no 2025 IPO plans.",
    recurring: true, dealType: "Employee Secondary",
  },
  {
    company: "Plaid", sector: "Fintech", date: "Feb 2026", valuation: 8,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Institutional investors (existing + new)",
    notes: "31% increase from April 2025 $6.1B valuation. Company-facilitated employee tender. IPO path signaled for 2026–2027.",
    recurring: true, dealType: "Employee Tender",
  },

  // ══ RAMP ════════════════════════════════════════════════════════════════════
  {
    company: "Ramp", sector: "Fintech", date: "Mar 2025", valuation: 13,
    amountKnown: 150, amountStatus: "confirmed",
    sharePrice: null, buyers: "Undisclosed secondary buyers",
    notes: "$150M secondary at $13B — nearly doubled valuation from $5.8B down round in 2023. Payment volume $55B (up from $10B in Jan 2023).",
    recurring: false, dealType: "Employee Secondary",
  },
  {
    company: "Ramp", sector: "Fintech", date: "Nov 2025", valuation: 32,
    amountKnown: 300, amountStatus: "confirmed",
    sharePrice: null, buyers: "Lightspeed (lead), Founders Fund, Coatue, D1, Thrive, GIC, Sutter Hill, Bessemer, Alpha Wave, Robinhood Ventures (88 total)",
    notes: "$300M primary + employee tender offer component. 42% jump from $22.5B in July. ARR ~$700M. 5 valuation step-ups in 14 months.",
    recurring: false, dealType: "Primary + Employee Tender",
  },

  // ══ RIPPLING ════════════════════════════════════════════════════════════════
  {
    company: "Rippling", sector: "HR/SaaS", date: "Apr 2024", valuation: 13.5,
    amountKnown: 590, amountStatus: "confirmed",
    sharePrice: null, buyers: "Coatue (lead) + others",
    notes: "$590M authorized tender (employees + seed investors) alongside $200M Series F primary. Over $2B in total investor demand — oversubscribed 3x+. Banned ex-employees working at Deel or Workday from participating.",
    recurring: false, dealType: "Employee Tender + Primary",
  },

  // ══ FIGMA ═══════════════════════════════════════════════════════════════════
  {
    company: "Figma", sector: "Design/SaaS", date: "May 2024", valuation: 12.5,
    amountKnown: 750, amountStatus: "confirmed",
    sharePrice: 23.19, buyers: "a16z, Sequoia, Kleiner Perkins, Fidelity, Coatue, Iconiq, General Catalyst, Franklin Venture Partners (25+ total)",
    notes: "$600M–$900M tender (~$750M midpoint). $23.19/share — ~2/3 of what Adobe would have paid. Employees who sold at $12.5B later saw IPO at $19.3B in Jul 2025 (NYSE: FIG, $33/share).",
    recurring: false, dealType: "Employee Tender",
  },

  // ══ NOTION ══════════════════════════════════════════════════════════════════
  {
    company: "Notion", sector: "Productivity", date: "2022", valuation: 10,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Sequoia Capital, Index Ventures",
    notes: "Annual cadence guaranteed to employees — described as unique 'Notion perk.' Sequoia + Index leading. Amount undisclosed.",
    recurring: true, dealType: "Employee Tender (Annual)",
  },
  {
    company: "Notion", sector: "Productivity", date: "Jan 2026", valuation: 11,
    amountKnown: 270, amountStatus: "confirmed",
    sharePrice: null, buyers: "GIC (new), Sequoia Capital, Index Ventures",
    notes: "$270M at $11B (Bloomberg had initially reported $12B). GIC joined as new investor. Former employees demand exceeded allocation — CEO Ivan Zhao apologized to ex-employees who were scaled back.",
    recurring: true, dealType: "Employee Tender (Annual)",
  },

  // ══ CANVA ═══════════════════════════════════════════════════════════════════
  {
    company: "Canva", sector: "Design/SaaS", date: "Feb 2024", valuation: 26,
    amountKnown: 1600, amountStatus: "confirmed",
    sharePrice: null, buyers: "Institutional investors (existing + new)",
    notes: "$1.6B secondary at $26B — down ~35% from $40B 2021 peak. $2.4B in buyer demand; 50% oversubscribed. Longtime employees and investors participated on $2.7B revenue.",
    recurring: true, dealType: "Secondary Sale",
  },
  {
    company: "Canva", sector: "Design/SaaS", date: "Mar 2025", valuation: 37,
    amountKnown: 450, amountStatus: "reported",
    sharePrice: null, buyers: "Private institutional investors",
    notes: "$400M–$500M secondary at $37B (~midpoint). 42% step-up from Feb 2024. Company crossed $3.5B ARR. Pre-IPO cadence building.",
    recurring: true, dealType: "Secondary Sale",
  },
  {
    company: "Canva", sector: "Design/SaaS", date: "Aug 2025", valuation: 42,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: 1646.14, buyers: "Fidelity Management & Research, JPMorgan Asset Management",
    notes: "Employees could sell up to $3M vested equity. Valuation up 60%+ from $26B (2024). $3.5B ARR. Pre-IPO liquidity event; CFO Kelly Steckelberg hired from Zoom.",
    recurring: true, dealType: "Employee Tender",
  },

  // ══ GUSTO ═══════════════════════════════════════════════════════════════════
  {
    company: "Gusto", sector: "HR/Payroll", date: "Jun 2025", valuation: 9.3,
    amountKnown: 200, amountStatus: "confirmed",
    sharePrice: null, buyers: "Ontario Teachers' Pension Plan (Teachers' Venture Growth)",
    notes: "$200M+ tender at $9.3B — pure secondary, no new primary capital. FCF positive since early 2023. 401(k) +50% YoY; Gusto Money +140% YoY.",
    recurring: false, dealType: "Employee Tender",
  },

  // ══ FLIPKART ════════════════════════════════════════════════════════════════
  {
    company: "Flipkart", sector: "E-commerce", date: "2025", valuation: null,
    amountKnown: 50, amountStatus: "confirmed",
    sharePrice: null, buyers: "Flipkart (self-buyback)",
    notes: "$50M employee stock buyback. ~7,000–7,500 employees benefited. Walmart-majority-owned. No external investors; pure company-run program.",
    recurring: false, dealType: "Employee Buyback",
  },

  // ══ SWORD HEALTH ════════════════════════════════════════════════════════════
  {
    company: "Sword Health", sector: "Digital Health", date: "Aug 2024", valuation: 3,
    amountKnown: 100, amountStatus: "confirmed",
    sharePrice: null, buyers: "Existing investors",
    notes: "$100M employee tender + $30M primary raise at $3B valuation. AI-powered physical therapy startup. Pure employee liquidity alongside small primary.",
    recurring: false, dealType: "Employee Tender + Primary",
  },

  // ══ HIGHTOUCH ═══════════════════════════════════════════════════════════════
  {
    company: "Hightouch", sector: "Data/Marketing", date: "Mar 2025", valuation: 1.3,
    amountKnown: 30, amountStatus: "confirmed",
    sharePrice: null, buyers: "StepStone, PeakXV",
    notes: "$30M tender at $1.3B (step-up from $1.2B raise a month earlier). Only 2-year employee eligibility (vs. typical 4yr). 10-year post-departure exercise window. Driver: competing with OpenAI/Anthropic tender liquidity for talent.",
    recurring: false, dealType: "Employee Tender",
  },

  // ══ LINEAR ══════════════════════════════════════════════════════════════════
  {
    company: "Linear", sector: "Productivity", date: "2025", valuation: 1.25,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Private investors",
    notes: "Tender at same $1.25B valuation as Series C. One of a new wave of sub-$2B companies offering tenders as a retention tool competing with AI-company liquidity offers. Size undisclosed.",
    recurring: false, dealType: "Employee Tender",
  },

  // ══ ELEVENLABS ══════════════════════════════════════════════════════════════
  {
    company: "ElevenLabs", sector: "AI", date: "2025", valuation: 6.6,
    amountKnown: 100, amountStatus: "confirmed",
    sharePrice: null, buyers: "Sequoia, ICONIQ, a16z, and others",
    notes: "$100M employee tender at $6.6B. Sequoia, ICONIQ, a16z participated. Employees with 1+ year tenure eligible. Company announced directly on blog.",
    recurring: false, dealType: "Employee Tender",
  },

  // ══ HARVEY ══════════════════════════════════════════════════════════════════
  {
    company: "Harvey", sector: "Legal AI", date: "Dec 2025", valuation: 8,
    amountKnown: 75, amountStatus: "reported",
    sharePrice: null, buyers: "a16z-led consortium; WndrCo, T. Rowe Price, Sequoia, Kleiner Perkins, Conviction, Elad Gil",
    notes: "$75M tender alongside $150M Series F. First-ever Harvey tender. Over 50% of AmLaw 100 firms use Harvey. Valuation grew from $3B (Feb) → $5B (Jun) → $8B (Dec 2025).",
    recurring: false, dealType: "Employee Tender + Primary",
  },

  // ══ CLAY ════════════════════════════════════════════════════════════════════
  {
    company: "Clay", sector: "AI/GTM", date: "May 2025", valuation: 1.5,
    amountKnown: 20, amountStatus: "confirmed",
    sharePrice: null, buyers: "Sequoia Capital (led), other investors",
    notes: "$20M tender at $1.5B. Sequoia led; 8,000+ customers. Employees sell 'on their own timeline: starting a side project, buying a home, or just having financial freedom.'",
    recurring: false, dealType: "Employee Tender",
  },

  // ══ FANATICS ════════════════════════════════════════════════════════════════
  {
    company: "Fanatics", sector: "E-commerce/Sports", date: "Sep 2024", valuation: 25,
    amountKnown: 87, amountStatus: "reported",
    sharePrice: null, buyers: "Undisclosed secondary market participants",
    notes: "$75M–$100M tender at $25B (~$87M midpoint). ~19% discount from $31B Dec 2022 peak. IPO repeatedly delayed. Company stated it 'doesn't need capital' — purely employee liquidity.",
    recurring: true, dealType: "Employee Tender",
  },

  // ══ RIPPLE (XRP LABS) ═══════════════════════════════════════════════════════
  {
    company: "Ripple (XRP Labs)", sector: "Crypto/Fintech", date: "Jan 2024", valuation: 11.3,
    amountKnown: 285, amountStatus: "confirmed",
    sharePrice: null, buyers: "Ripple Labs (self-buyback)",
    notes: "$285M share buyback. Investors could sell up to 6% of stake. Company held >$1B cash + $25B in crypto assets. First in a series of accelerating buybacks.",
    recurring: true, dealType: "Company Buyback",
  },
  {
    company: "Ripple (XRP Labs)", sector: "Crypto/Fintech", date: "Jun 2024", valuation: 25,
    amountKnown: 700, amountStatus: "confirmed",
    sharePrice: 175, buyers: "Ripple Labs (self-buyback)",
    notes: "$700M buyback at $175/share, implying ~$25B valuation. Significantly larger than Jan 2024. XRP price surge boosted treasury position; company funded internally.",
    recurring: true, dealType: "Company Buyback",
  },
  {
    company: "Ripple (XRP Labs)", sector: "Crypto/Fintech", date: "Early 2026", valuation: 50,
    amountKnown: 750, amountStatus: "reported",
    sharePrice: null, buyers: "Undisclosed institutional investors",
    notes: "~$750M tender at $50B per PitchBook. Sep 2025 attempt at $40B drew minimal participation — employees held betting on higher valuations. Concurrent $500M raise from Fortress/Citadel.",
    recurring: true, dealType: "Employee Tender",
  },

  // ══ COREWEAVE ═══════════════════════════════════════════════════════════════
  {
    company: "CoreWeave", sector: "AI Infrastructure", date: "Nov 2024", valuation: 23,
    amountKnown: 650, amountStatus: "confirmed",
    sharePrice: 46.99, buyers: "Cisco, Fidelity",
    notes: "$650M pre-IPO secondary at $23B. $46.99/share — higher than March 2025 IPO price of $40. Employees who held to IPO lost vs. the secondary price. IPO priced March 28, 2025 (Nasdaq: CRWV).",
    recurring: false, dealType: "Employee Secondary",
  },

  // ══ ANDURIL ═════════════════════════════════════════════════════════════════
  {
    company: "Anduril", sector: "Defense Tech", date: "Jan 2025", valuation: 28,
    amountKnown: 100, amountStatus: "reported",
    sharePrice: null, buyers: "Founders Fund and Series G participants",
    notes: "First employee tender alongside Series G raise at $28B–$30.5B. 2024 revenue doubled to ~$1B. Concurrent with $1.5B primary raise led by Founders Fund.",
    recurring: false, dealType: "Employee Tender",
  },

  // ══ xAI ═════════════════════════════════════════════════════════════════════
  {
    company: "xAI", sector: "AI", date: "Jun 2025", valuation: 113,
    amountKnown: 300, amountStatus: "reported",
    sharePrice: null, buyers: "New and existing investors",
    notes: "Staff allowed to sell shares at $113B valuation. ~$300M tender. Followed March 2025 acquisition of X (Twitter). Preceded SpaceX acquisition of xAI on Feb 2, 2026 at $250B xAI / $1T combined.",
    recurring: false, dealType: "Employee Tender",
  },

  // ══ CHECKOUT.COM ════════════════════════════════════════════════════════════
  {
    company: "Checkout.com", sector: "Fintech", date: "Sep 2025", valuation: 12,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Checkout.com (internal buyback only)",
    notes: "Company-only buyback — no third-party investors. 2,000 eligible employees with ≥1 year tenure. Valuation reflects 70% drop from $40B peak (2022). First liquidity event since 2022.",
    recurring: false, dealType: "Employee Buyback",
  },

  // ══ VEEAM ═══════════════════════════════════════════════════════════════════
  {
    company: "Veeam", sector: "Enterprise SaaS", date: "2024", valuation: null,
    amountKnown: 2000, amountStatus: "reported",
    sharePrice: null, buyers: "Private equity / institutional investors",
    notes: "$2B investor secondary sale. Veeam is PE-backed (Insight Partners majority). Large private tech secondary included for scale context. Exact valuation not publicly disclosed.",
    recurring: false, dealType: "Investor Secondary",
  },

  // ══ SUPABASE ════════════════════════════════════════════════════════════════
  {
    company: "Supabase", sector: "Dev Infrastructure", date: "Jun 2026", valuation: 10.5,
    amountKnown: 500, amountStatus: "confirmed",
    sharePrice: null, buyers: "GIC (lead), Accel, Y Combinator, Coatue, Stripe, Salesforce Ventures, Peak XV, Felicis",
    notes: "$500M Series F at $10.5B. Primary raise with secondary allocation for community members. Every prior Supabase round included employee secondaries. Claude Code is now Supabase's largest contributor. 600% database growth YoY.",
    recurring: false, dealType: "Primary Round (w/ Community Secondary)",
  },

  // ══ KLARNA ══════════════════════════════════════════════════════════════════
  {
    company: "Klarna", sector: "Fintech", date: "2023", valuation: 14.6,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Undisclosed secondary buyers",
    notes: "Pre-IPO secondary sales as valuation recovered from $6.7B 2022 low. $45.6B 2021 peak → $6.7B crash → $14.6B recovery. IPO'd NYSE Sep 10, 2025 (KLAR, $40/share); opened at ~$45, valuing company at ~$19.65B at first-day close.",
    recurring: false, dealType: "Employee Secondary",
  },

  // ══ DECAGON ═════════════════════════════════════════════════════════════════
  {
    company: "Decagon", sector: "AI/Customer Support", date: "Mar 2026", valuation: 4.5,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Coatue, Index Ventures, a16z, Definition Capital, Forerunner Ventures, Ribbit Capital",
    notes: "First-ever employee tender. Same investors as Series D. 300+ employees eligible. Valuation tripled from $1.5B Series C (Jun 2025). Emerging trend: tenders priced at round valuation, not a discount.",
    recurring: false, dealType: "Employee Tender",
  },

  // ══ GAMMA ═══════════════════════════════════════════════════════════════════
  {
    company: "Gamma", sector: "Productivity", date: "2025", valuation: null,
    amountKnown: null, amountStatus: "undisclosed",
    sharePrice: null, buyers: "Private investors",
    notes: "Named in WSJ/Compa roundup as participating in 2025 employee tender trend. AI presentation startup. Exact terms, valuation, and size not publicly disclosed. Low-confidence inclusion.",
    recurring: false, dealType: "Employee Tender",
  },
];

// ─── VALUATION TRAJECTORY ─────────────────────────────────────────────────────
// Tender-implied valuations for the 5 most active companies
const VALUATION_TIMELINE = [
  { t: "May '22", OpenAI: null, SpaceX: 125,  Stripe: null, Databricks: null, Anthropic: null },
  { t: "Dec '22", OpenAI: null, SpaceX: 137,  Stripe: null, Databricks: null, Anthropic: null },
  { t: "Jan '23", OpenAI: 29,   SpaceX: null, Stripe: null, Databricks: null, Anthropic: null },
  { t: "Mar '23", OpenAI: null, SpaceX: null, Stripe: 50,   Databricks: null, Anthropic: null },
  { t: "Jun '23", OpenAI: null, SpaceX: 150,  Stripe: null, Databricks: null, Anthropic: null },
  { t: "Sep '23", OpenAI: null, SpaceX: null, Stripe: null, Databricks: 43,   Anthropic: null },
  { t: "Nov '23", OpenAI: 86,   SpaceX: null, Stripe: null, Databricks: null, Anthropic: null },
  { t: "Dec '23", OpenAI: null, SpaceX: 180,  Stripe: null, Databricks: null, Anthropic: null },
  { t: "Feb '24", OpenAI: null, SpaceX: null, Stripe: 65,   Databricks: null, Anthropic: null },
  { t: "Jun '24", OpenAI: null, SpaceX: 210,  Stripe: null, Databricks: null, Anthropic: null },
  { t: "Nov '24", OpenAI: 157,  SpaceX: null, Stripe: 70,   Databricks: null, Anthropic: null },
  { t: "Dec '24", OpenAI: null, SpaceX: 350,  Stripe: null, Databricks: 62,   Anthropic: null },
  { t: "Feb '25", OpenAI: null, SpaceX: null, Stripe: 92,   Databricks: null, Anthropic: null },
  { t: "Mar '25", OpenAI: null, SpaceX: null, Stripe: null, Databricks: null, Anthropic: 62  },
  { t: "Jul '25", OpenAI: null, SpaceX: 400,  Stripe: null, Databricks: null, Anthropic: null },
  { t: "Sep '25", OpenAI: null, SpaceX: null, Stripe: 107,  Databricks: 100,  Anthropic: null },
  { t: "Oct '25", OpenAI: 500,  SpaceX: null, Stripe: null, Databricks: null, Anthropic: null },
  { t: "Dec '25", OpenAI: null, SpaceX: 800,  Stripe: null, Databricks: null, Anthropic: null },
  { t: "Feb '26", OpenAI: null, SpaceX: null, Stripe: 159,  Databricks: null, Anthropic: null },
  { t: "Mar '26", OpenAI: null, SpaceX: null, Stripe: null, Databricks: 134,  Anthropic: null },
  { t: "Apr '26", OpenAI: null, SpaceX: null, Stripe: null, Databricks: null, Anthropic: 350 },
];

const CHART_COLORS: Record<string, string> = {
  OpenAI:     "#0071e3",
  SpaceX:     "#e8570c",
  Stripe:     "#1a7f3c",
  Databricks: "#b45309",
  Anthropic:  "#0891b2",
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SECTORS = ["All", ...Array.from(new Set(TENDER_DATA.map(d => d.sector))).sort()];
const YEARS = ["All", "2022", "2023", "2024", "2025", "2026"];
const MAX_VAL = Math.max(...TENDER_DATA.filter(d => d.valuation != null).map(d => d.valuation as number));

const STATUS_COLORS: Record<string, string> = {
  confirmed:   "#1a7f3c",
  reported:    "#b45309",
  undisclosed: "#6e6e73",
  estimated:   "#0891b2",
};

const SECTOR_COLORS: Record<string, string> = {
  "AI":                  "#0071e3",
  "Aerospace":           "#e8570c",
  "Fintech":             "#1a7f3c",
  "Data/AI":             "#0369a1",
  "HR/SaaS":             "#b45309",
  "Design/SaaS":         "#be185d",
  "Productivity":        "#0284c7",
  "HR/Payroll":          "#0d9488",
  "Data/Marketing":      "#4d7c0f",
  "AI/GTM":              "#0891b2",
  "E-commerce/Sports":   "#c2410c",
  "Crypto/Fintech":      "#92400e",
  "Dev Infrastructure":  "#065f46",
  "AI/Customer Support": "#9d174d",
  "Consumer Internet":   "#be123c",
  "Defense Tech":        "#374151",
  "AI Infrastructure":   "#1d4ed8",
  "Legal AI":            "#854d0e",
  "E-commerce":          "#b91c1c",
  "Digital Health":      "#0f766e",
  "Enterprise SaaS":     "#4b5563",
};

const DEAL_ACCENT: Record<string, string> = {
  "Employee Tender":                           "#0071e3",
  "Employee Tender (Annual)":                  "#0071e3",
  "Employee Tender + Buyback":                 "#0071e3",
  "Employee Tender + Primary":                 "#0071e3",
  "Employee Tender (Recurring)":               "#0071e3",
  "Employee Secondary":                        "#e8570c",
  "Company Buyback":                           "#1a7f3c",
  "Employee Buyback":                          "#1a7f3c",
  "Company Buyback / Secondary":               "#1a7f3c",
  "Primary Round (Liquidity-Driven)":          "#0891b2",
  "Primary Round (w/ Secondary)":              "#0891b2",
  "Primary Round (w/ Community Secondary)":    "#0891b2",
  "Primary + Employee Tender":                 "#0284c7",
  "Primary + Largest Employee Tender":         "#0284c7",
  "Secondary Sale":                            "#b45309",
  "Investor Secondary":                        "#b45309",
  "Internal Repurchase / Secondary":           "#b45309",
};

// ─── FORMATTERS ───────────────────────────────────────────────────────────────
const fmtVal = (v: number | null): string => {
  if (v == null) return "—";
  if (v >= 1) return `$${v % 1 === 0 ? v : v.toFixed(1)}B`;
  return `$${(v * 1000).toFixed(0)}M`;
};

const fmtAmt = (a: number | null, status: string): string => {
  if (a == null) return "Undisclosed";
  const base = a >= 1000 ? `$${(a / 1000).toFixed(1)}B` : `$${a}M`;
  return (status === "reported" ? "~" : "") + base;
};

// ─── ANIMATIONS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes barGrow {
    from { width: 0%; }
  }
  @keyframes tickerScroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes rowIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes livePulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
  }
  .tender-row { animation: rowIn 0.22s ease both; }
  .bar-grow   { animation: barGrow 0.9s cubic-bezier(0.16,1,0.3,1) both; }
  .ticker-track { animation: tickerScroll 32s linear infinite; }
  .live-dot   { animation: livePulse 1.6s ease-in-out infinite; }
`;

function useCountUp(target: number, duration = 1400): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = Math.round(duration / 16);
    const id = setInterval(() => {
      frame++;
      const ease = 1 - Math.pow(1 - frame / total, 3);
      setVal(Math.round(ease * target));
      if (frame >= total) { setVal(target); clearInterval(id); }
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────
function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
      background: color + "18", border: `1px solid ${color}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontWeight: 700, color, letterSpacing: "-0.01em",
    }}>
      {name[0]}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.15)", borderRadius: 12,
      padding: "14px 20px", minWidth: 130,
      border: "1px solid rgba(255,255,255,0.2)",
      backdropFilter: "blur(4px)",
    }}>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "#6e6e73";
  const labels: Record<string, string> = {
    confirmed: "Confirmed", reported: "Reported",
    undisclosed: "Undisclosed", estimated: "Estimated",
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color, letterSpacing: "0.03em" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {labels[status] || status}
    </span>
  );
}

function ValuationChart() {
  const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Geist Sans', sans-serif";
  const companies = Object.keys(CHART_COLORS);
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
      padding: "22px 28px 16px",
      marginBottom: 16,
    }}>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#6e6e73", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'SF Mono','Fira Code',monospace" }}>
          Valuation Trajectory
        </div>
        <div style={{ fontSize: 12, color: "#aeaeb2", marginTop: 2, fontFamily: FONT }}>
          Implied valuations at each tender event · 5 most active companies
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={VALUATION_TIMELINE} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 10, fill: "#aeaeb2", fontFamily: FONT }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tickFormatter={v => `$${v}B`}
            tick={{ fontSize: 10, fill: "#aeaeb2", fontFamily: FONT }}
            axisLine={false}
            tickLine={false}
            width={46}
          />
          <Tooltip
            contentStyle={{
              background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: 12, fontFamily: FONT,
            }}
            formatter={(value, name) => [`$${value}B`, name as string]}
            labelStyle={{ color: "#6e6e73", fontSize: 11, marginBottom: 4 }}
          />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 11, color: "#6e6e73", fontFamily: FONT, paddingTop: 8 }}
          />
          {companies.map(co => (
            <Line
              key={co}
              type="monotone"
              dataKey={co}
              stroke={CHART_COLORS[co]}
              strokeWidth={2}
              dot={{ r: 3.5, fill: CHART_COLORS[co], strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function TenderTracker() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");
  const [year, setYear] = useState("All");
  const [sort, setSort] = useState({ col: "date", dir: "desc" });
  const [expanded, setExpanded] = useState<number | null>(null);
  const [recurringOnly, setRecurringOnly] = useState(false);
  const [filterKey, setFilterKey] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Geist Sans', 'Segoe UI', sans-serif";
  const MONO = "'SF Mono', 'Fira Code', 'Cascadia Code', monospace";

  const totalKnown = TENDER_DATA.filter(d => d.amountKnown != null).reduce((s, d) => s + (d.amountKnown ?? 0), 0);
  const companies  = new Set(TENDER_DATA.map(d => d.company)).size;
  const confirmed  = TENDER_DATA.filter(d => d.amountStatus === "confirmed").length;

  // count-up values (called unconditionally to respect hooks rules)
  const animEvents  = useCountUp(TENDER_DATA.length, 1000);
  const animTotal   = useCountUp(Math.round(totalKnown / 1000 * 10), 1400); // tenths of B
  const animConfirm = useCountUp(confirmed, 900);
  const animCos     = useCountUp(companies, 800);

  const dateOrder = (d: string): number => {
    const m: Record<string, number> = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 };
    const norm = d.replace("~","").replace("Early ","Feb ").replace("Mid ","Jun ")
      .replace("H1 ","Mar ").replace("H2 ","Sep ").replace("Q1 ","Feb ")
      .replace("Q2 ","May ").replace("Q3 ","Aug ").replace("Q4 ","Nov ");
    const parts = norm.split(" ");
    const yr = parseInt(parts[parts.length - 1]) || 2023;
    const mo = m[parts[0]] || 6;
    return yr * 100 + mo;
  };

  const filtered = useMemo(() => {
    let data = [...TENDER_DATA];
    if (recurringOnly) data = data.filter(d => d.recurring);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d =>
        d.company.toLowerCase().includes(q) ||
        d.sector.toLowerCase().includes(q) ||
        d.notes.toLowerCase().includes(q) ||
        (d.buyers || "").toLowerCase().includes(q)
      );
    }
    if (sector !== "All") data = data.filter(d => d.sector === sector);
    if (year !== "All") data = data.filter(d => d.date.includes(year));
    data.sort((a, b) => {
      let av, bv;
      if (sort.col === "date")           { av = dateOrder(a.date); bv = dateOrder(b.date); }
      else if (sort.col === "valuation") { av = a.valuation ?? -1; bv = b.valuation ?? -1; }
      else if (sort.col === "amount")    { av = a.amountKnown ?? -1; bv = b.amountKnown ?? -1; }
      else { av = (a as Record<string, unknown>)[sort.col] ?? ""; bv = (b as Record<string, unknown>)[sort.col] ?? ""; }
      return sort.dir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return data;
  }, [search, sector, year, sort, recurringOnly, filterKey]);

  const topDeals = useMemo(() =>
    [...TENDER_DATA]
      .filter(d => d.amountKnown != null)
      .sort((a, b) => (b.amountKnown ?? 0) - (a.amountKnown ?? 0))
      .slice(0, 8),
  []);
  const topMax = topDeals[0]?.amountKnown ?? 1;

  const toggleSort = (col: string) =>
    setSort(s => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "desc" });

  const SortIcon = ({ col }: { col: string }) => (
    <span style={{ opacity: sort.col === col ? 0.9 : 0.25, fontSize: 8, marginLeft: 3 }}>
      {sort.col === col ? (sort.dir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  const surpriseMe = () => {
    setSector("All"); setYear("All"); setSearch(""); setRecurringOnly(false);
    const idx = Math.floor(Math.random() * TENDER_DATA.length);
    setExpanded(idx);
    setFilterKey(k => k + 1);
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const focusCompany = (company: string) => {
    setSearch(company); setSector("All"); setYear("All");
    setExpanded(null);
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const headers = [
    { key: "company",      label: "Company",   w: 210 },
    { key: "date",         label: "Date",       w: 90  },
    { key: "valuation",    label: "Valuation",  w: 130 },
    { key: "amount",       label: "Amount",     w: 120 },
    { key: "amountStatus", label: "Confidence", w: 110 },
  ];

  const TICKER_ITEMS = [
    "🔥 Databricks Dec 2024 · $10B — largest VC secondary tender in history",
    "🚀 SpaceX Dec 2025 · $800B valuation · $2.56B tendered",
    "🤖 OpenAI Oct 2025 · $6.6B · 600+ employees cashed out",
    "💳 Stripe Feb 2026 · $159B · 7th annual liquidity event",
    "🧠 Anthropic Apr 2026 · $350B pre-money · employees held back expecting more",
    "⚡ Ripple Jun 2024 · $700M self-funded buyback · no external investors",
    "🎨 Figma May 2024 · $23.19/share · employees who sold missed IPO upside at $33",
    "🌍 Revolut Nov 2025 · $1,381/share · Europe's most valuable private tech co",
  ];
  const tickerText = [...TICKER_ITEMS, ...TICKER_ITEMS].join("   ·   ");

  return (
    <div style={{ background: "#f5f5f7", minHeight: "100vh", fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Watermark */}
      <div style={{
        position: "fixed", top: 16, right: 20, zIndex: 9999,
        fontSize: 10, color: "rgba(0,0,0,0.18)", pointerEvents: "none",
        fontFamily: MONO, letterSpacing: "0.04em",
      }}>
        @Trace_Cohen · t@nyvp.com
      </div>

      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(135deg, #003d82 0%, #0071e3 55%, #0096d6 100%)",
        padding: "40px 40px 0",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span style={{ fontSize: 10, letterSpacing: "0.22em", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", fontFamily: MONO }}>
              ValueAdd VC · Private Market Intelligence
            </span>
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Startup Tender Offers & Secondary Share Sales
          </h1>
          <p style={{ margin: "0 0 28px", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            Every known private market liquidity event · 2022–2026
            <span style={{ color: "rgba(255,255,255,0.35)" }}> · and that&apos;s just what leaked</span>
          </p>

          {/* Stat cards with count-up */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatCard label="Total Events"       value={animEvents}                           sub={`${animCos} companies`} />
            <StatCard label="Known Liquidity"    value={`$${(animTotal / 10).toFixed(1)}B+`} sub="confirmed + reported" />
            <StatCard label="Confirmed"          value={animConfirm}                          sub="company/press verified" />
            <StatCard label="Undisclosed"        value={TENDER_DATA.filter(d => d.amountStatus === "undisclosed").length} sub="size not public" />
            <StatCard label="Recurring Programs" value={TENDER_DATA.filter(d => d.recurring).length} sub="multi-event companies" />
          </div>

          {/* Scrolling ticker */}
          <div style={{ marginTop: 24, overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 10, paddingBottom: 14 }}>
            <div className="ticker-track" style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: MONO, letterSpacing: "0.03em" }}>
                {tickerText}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 40px 60px" }}>

        {/* ── BIGGEST DEALS LEADERBOARD ── */}
        <div style={{
          background: "#fff", borderRadius: 14,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
          padding: "22px 28px",
          marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6e6e73", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: MONO }}>
                Biggest Known Deals
              </div>
              <div style={{ fontSize: 11, color: "#aeaeb2", marginTop: 2 }}>Click a row to filter the table below</div>
            </div>
            <button
              onClick={surpriseMe}
              style={{
                background: "linear-gradient(135deg, #003d82, #0071e3)",
                color: "#fff", border: "none", borderRadius: 20,
                padding: "7px 16px", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: FONT,
                boxShadow: "0 2px 8px rgba(0,113,227,0.35)",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,113,227,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,113,227,0.35)"; }}
            >
              🎲 Surprise me
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {topDeals.map((d, i) => {
              const sc = SECTOR_COLORS[d.sector] || "#0071e3";
              const pct = Math.max(4, ((d.amountKnown ?? 0) / topMax) * 100);
              const pctLabel = Math.round(((d.amountKnown ?? 0) / (totalKnown)) * 100);
              return (
                <div
                  key={i}
                  onClick={() => focusCompany(d.company)}
                  style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", borderRadius: 8, padding: "4px 0", transition: "background 0.12s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#f5f5f7"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: 22, textAlign: "right", fontSize: 11, color: "#c7c7cc", fontFamily: MONO, flexShrink: 0 }}>
                    #{i + 1}
                  </div>
                  <div style={{ width: 180, flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                      {d.company}
                    </div>
                    <div style={{ fontSize: 10, color: "#aeaeb2", fontFamily: MONO }}>{d.date}</div>
                  </div>
                  <div style={{ flex: 1, height: 8, background: "#f0f0f5", borderRadius: 99, overflow: "hidden" }}>
                    <div
                      className="bar-grow"
                      style={{
                        width: `${pct}%`, height: "100%",
                        background: `linear-gradient(90deg, ${sc}cc, ${sc})`,
                        borderRadius: 99,
                        animationDelay: `${i * 0.08}s`,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: "#c7c7cc", fontFamily: MONO, width: 36, textAlign: "right", flexShrink: 0 }}>
                    {pctLabel}%
                  </div>
                  <div style={{ width: 84, textAlign: "right", fontSize: 15, fontWeight: 700, color: sc, fontFamily: MONO, letterSpacing: "-0.02em", flexShrink: 0 }}>
                    {fmtAmt(d.amountKnown, d.amountStatus)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── VALUATION CHART ── */}
        <ValuationChart />

        {/* ── FILTERS ── */}
        <div style={{
          background: "#fff", borderRadius: 12, padding: "12px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
          marginBottom: 10,
          display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
        }}>
          <input
            placeholder="Search company, buyers, notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8,
              color: "#1d1d1f", padding: "7px 12px", fontFamily: FONT, fontSize: 13,
              width: 230, outline: "none",
            }}
          />

          <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.1)" }} />

          <select
            value={sector}
            onChange={e => setSector(e.target.value)}
            style={{
              background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8,
              color: sector === "All" ? "#6e6e73" : "#1d1d1f",
              padding: "7px 28px 7px 12px", fontFamily: FONT, fontSize: 13,
              outline: "none", cursor: "pointer", appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236e6e73' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
              fontWeight: sector === "All" ? 400 : 600,
            }}
          >
            {SECTORS.map(s => (
              <option key={s} value={s}>{s === "All" ? "All Sectors" : s}</option>
            ))}
          </select>

          <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.1)" }} />

          <div style={{ display: "flex", gap: 4 }}>
            {YEARS.map(y => {
              const active = year === y;
              return (
                <button key={y} onClick={() => setYear(y)} style={{
                  background: active ? "#0071e3" : "transparent",
                  color: active ? "#fff" : "#6e6e73",
                  border: `1px solid ${active ? "#0071e3" : "rgba(0,0,0,0.12)"}`,
                  borderRadius: 20, padding: "4px 10px", fontSize: 11,
                  cursor: "pointer", fontFamily: FONT, transition: "all 0.12s",
                  fontWeight: active ? 600 : 400,
                }}>{y}</button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.1)" }} />

          <button onClick={() => setRecurringOnly(r => !r)} style={{
            background: recurringOnly ? "#fff3e8" : "transparent",
            color: recurringOnly ? "#b45309" : "#6e6e73",
            border: `1px solid ${recurringOnly ? "#fcd34d" : "rgba(0,0,0,0.12)"}`,
            borderRadius: 20, padding: "4px 11px", fontSize: 11,
            cursor: "pointer", fontFamily: FONT, fontWeight: recurringOnly ? 600 : 400,
          }}>
            {recurringOnly ? "◉" : "◎"} Recurring only
          </button>

          {(search || sector !== "All" || year !== "All" || recurringOnly) && (
            <button
              onClick={() => { setSearch(""); setSector("All"); setYear("All"); setRecurringOnly(false); setExpanded(null); }}
              style={{
                background: "transparent", color: "#aeaeb2",
                border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20,
                padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: FONT,
              }}
            >
              ✕ Clear
            </button>
          )}

          <span style={{ marginLeft: "auto", fontSize: 11, color: "#aeaeb2", fontFamily: MONO }}>
            {filtered.length} / {TENDER_DATA.length}
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginBottom: 10, paddingLeft: 2, flexWrap: "wrap", alignItems: "center" }}>
          {Object.entries(STATUS_COLORS).map(([k, c]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#8e8e93" }}>
              <span style={{ width: 7, height: 7, borderRadius: 2, background: c, display: "inline-block" }} />
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </div>
          ))}
          <span style={{ fontSize: 11, color: "#c7c7cc" }}>· Click any row for details</span>
        </div>

        {/* ── TABLE ── */}
        <div
          ref={tableRef}
          style={{
            background: "#fff", borderRadius: 14,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fafafa" }}>
                  {headers.map(col => (
                    <th key={col.key} onClick={() => toggleSort(col.key)} style={{
                      textAlign: "left", padding: "10px 14px", fontSize: 10,
                      letterSpacing: "0.1em", color: sort.col === col.key ? "#0071e3" : "#8e8e93",
                      cursor: "pointer", userSelect: "none", fontWeight: 600,
                      textTransform: "uppercase", whiteSpace: "nowrap", minWidth: col.w,
                    }}>
                      {col.label}<SortIcon col={col.key} />
                    </th>
                  ))}
                  <th style={{ padding: "10px 14px", fontSize: 10, color: "#8e8e93", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => {
                  const isExp = expanded === i;
                  const sc = SECTOR_COLORS[row.sector] || "#0071e3";
                  const ac = DEAL_ACCENT[row.dealType] || "#0071e3";
                  const valPct = row.valuation ? Math.max(4, (row.valuation / MAX_VAL) * 100) : 0;

                  return (
                    <tr
                      key={`${row.company}-${row.date}`}
                      className="tender-row"
                      onClick={() => setExpanded(isExp ? null : i)}
                      style={{
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                        background: isExp ? "#f0f6ff" : "transparent",
                        cursor: "pointer",
                        borderLeft: `3px solid ${isExp ? ac : "transparent"}`,
                        animationDelay: `${Math.min(i * 0.018, 0.4)}s`,
                      }}
                      onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = "#f7f7f9"; }}
                      onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = "transparent"; }}
                    >
                      {/* Company + sector + deal type badge */}
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar name={row.company} color={sc} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#1d1d1f", letterSpacing: "-0.01em", lineHeight: 1.25 }}>
                              {row.company}
                            </div>
                            <div style={{ display: "flex", gap: 4, marginTop: 2, flexWrap: "nowrap" }}>
                              <span style={{
                                background: sc + "12", color: sc,
                                border: `1px solid ${sc}25`, borderRadius: 20,
                                padding: "1px 7px", fontSize: 9, fontWeight: 500,
                              }}>{row.sector}</span>
                              {row.recurring && (
                                <span style={{
                                  background: "#fef3c7", color: "#b45309",
                                  border: "1px solid #fcd34d", borderRadius: 20,
                                  padding: "1px 6px", fontSize: 9, fontWeight: 500,
                                }}>↻ recurring</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#6e6e73", whiteSpace: "nowrap", fontFamily: MONO }}>
                        {row.date}
                      </td>

                      {/* Valuation */}
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: 13, color: row.valuation ? "#1d1d1f" : "#c7c7cc", fontWeight: 600, fontFamily: MONO, marginBottom: 4 }}>
                          {fmtVal(row.valuation)}
                        </div>
                        {row.valuation && (
                          <div style={{ width: 64, height: 3, background: "#e5e5ea", borderRadius: 99 }}>
                            <div style={{ width: `${valPct}%`, height: "100%", background: sc, borderRadius: 99 }} />
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                        <span style={{
                          fontSize: 13, fontFamily: MONO, fontWeight: row.amountKnown ? 600 : 400,
                          color: row.amountKnown
                            ? (row.amountStatus === "confirmed" ? "#1a7f3c" : row.amountStatus === "reported" ? "#b45309" : "#1d1d1f")
                            : "#aeaeb2",
                        }}>
                          {fmtAmt(row.amountKnown, row.amountStatus)}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td style={{ padding: "10px 14px" }}>
                        <StatusBadge status={row.amountStatus} />
                      </td>

                      {/* Notes */}
                      <td style={{
                        padding: "10px 14px", fontSize: 12, color: "#6e6e73",
                        maxWidth: 400,
                        overflow: isExp ? "visible" : "hidden",
                        textOverflow: isExp ? "clip" : "ellipsis",
                        whiteSpace: isExp ? "normal" : "nowrap",
                        lineHeight: 1.55,
                      }}>
                        {isExp ? (
                          <div style={{ animation: "fadeInUp 0.2s ease both" }}>
                            <div style={{ color: "#1d1d1f", marginBottom: 12, fontSize: 13, lineHeight: 1.7 }}>
                              {row.notes}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                              <span style={{
                                background: ac + "14", color: ac,
                                border: `1px solid ${ac}30`, borderRadius: 20,
                                padding: "3px 10px", fontSize: 11, fontWeight: 600,
                              }}>
                                {row.dealType}
                              </span>
                              {row.buyers && (
                                <div style={{ fontSize: 11, color: "#6e6e73", width: "100%" }}>
                                  <span style={{ color: "#0071e3", fontWeight: 600 }}>Buyers: </span>{row.buyers}
                                </div>
                              )}
                              {row.sharePrice && (
                                <div style={{ fontSize: 11, color: "#6e6e73" }}>
                                  <span style={{ color: "#1a7f3c", fontWeight: 600 }}>Share price: </span>
                                  ${row.sharePrice.toLocaleString()}/share
                                </div>
                              )}
                            </div>
                          </div>
                        ) : row.notes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "56px 48px", color: "#8e8e93" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>No deals found</div>
              <div style={{ fontSize: 13 }}>Try broadening your search or clearing the filters.</div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
            <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#0071e3", textDecoration: "none", fontWeight: 500 }}>
              ↗ @Trace_Cohen
            </a>
            <a href="mailto:t@nyvp.com"
              style={{ fontSize: 12, color: "#0071e3", textDecoration: "none", fontWeight: 500 }}>
              ↗ t@nyvp.com
            </a>
          </div>
          <p style={{ fontSize: 11, color: "#aeaeb2", lineHeight: 1.7, margin: 0, maxWidth: 900 }}>
            Sources: PitchBook · Bloomberg · CNBC · TechCrunch · Reuters · Crunchbase · Axios · Sacra · WSJ · Fortune · The Information · Economic Times · SecondaryLink · Compa · Company press releases
            &nbsp;·&nbsp; &ldquo;Confirmed&rdquo; = company or press release verified. &ldquo;Reported&rdquo; = single credible source. &ldquo;Undisclosed&rdquo; = no public figure.
            &nbsp;·&nbsp; Last updated June 2026.
          </p>
        </div>

      </div>
    </div>
  );
}
