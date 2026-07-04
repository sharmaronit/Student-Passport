# Product Requirements Document (PRD)
## Student Skill Passport

| Field | Value |
|-------|-------|
| **Product Name** | Student Skill Passport |
| **Version** | 1.0 (MVP) |
| **Date** | July 2026 |
| **Status** | In Development |

---

## 1. Executive Summary

A **Web3-powered digital wallet** that enables students to collect, store, and share cryptographically verifiable credentials as **Soulbound Tokens (SBTs)** on the **Polygon** blockchain. Eliminates resume fraud by giving recruiters instant, trustless verification.

---

## 2. Problem Statement

- **72% of job seekers** have lied on their resume (ResumeLab, 2023).
- Background checks cost **$30–$300 per candidate** and take 3–14 days.
- No standardized, trustless system exists for verifying skills across institutions.

| Stakeholder | Pain Point |
|-------------|-----------|
| **Students** | Honest students compete against fraudulent claims |
| **Recruiters** | Waste 30%+ of hiring time on verification |
| **Universities** | Degrees devalued when easily faked |
| **Companies** | Bad hires cost ~30% of annual salary |

---

## 3. Vision

> *"Every student carries undeniable, cryptographic proof of everything they've learned, built, and achieved — verified in seconds by anyone, anywhere."*

### MVP Goals

| # | Goal | Metric |
|---|------|--------|
| G1 | Collect credentials from multiple issuers into one wallet | ≥ 5 types |
| G2 | Verify any credential in under 10 seconds | < 10s avg |
| G3 | Tamper-proof, non-transferable credentials | 100% SBT |
| G4 | Auto-verify GitHub activity | Contribution graph rendered |
| G5 | Zero-friction onboarding | < 3 min to first credential view |

---

## 4. Target Users

- **Students (Holders)**: Age 18–28, undergrad/grad/bootcamp graduates
- **Issuers (Providers)**: Universities, hackathon orgs, cert platforms, companies
- **Verifiers (Consumers)**: Recruiters, hiring managers — must work without a wallet

---

## 5. The Five Pillars

| # | Pillar | Issuer | Data |
|---|--------|--------|------|
| 1 | **Hackathons** | Hackathon orgs | Event, date, team, placement, tracks |
| 2 | **Certifications** | Cert platforms | Platform, cert ID, URL, skills, level |
| 3 | **Internships** | Companies | Company, role, dates, tech stack |
| 4 | **Projects** | Self/collaborators | Repo URL, live URL, tech stack |
| 5 | **GitHub** | Auto via GitHub API | Commits, PRs, languages, repos, graph |

---

## 6. User Stories

### Students (P0)
- Connect MetaMask wallet and create profile
- Register with email and link wallet later
- View all credentials (SBTs) in dashboard
- Connect GitHub and see contribution stats (P1)
- Generate shareable verification links (P1)
- Auto-receive SBT on open-source PR merge (P2)

### Issuers (P0)
- Register organization and get verified on-chain
- Issue credential (SBT) to student wallet
- Revoke a previously issued credential
- View all issued credentials (P1)

### Verifiers (P0)
- Verify credential by token ID
- Open share link to see verified credential without a wallet
- See issuer identity and on-chain status (P1)

---

## 7. MVP Feature Scope

| Priority | Features |
|----------|----------|
| **P0** | Wallet auth (MetaMask + WalletConnect), hybrid email auth, CRUD profiles, credential issuance (IPFS → SBT → DB), on-chain verification |
| **P1** | GitHub API integration, contribution graph, share links, credential search/filter |
| **P2** | GitHub webhook auto-mint, bulk issuance, public portfolio, analytics |

---

## 8. Success Metrics (6 months)

| Metric | Target |
|--------|--------|
| Registered students | 1,000+ |
| Credentials issued | 5,000+ |
| Avg verification time | < 10 seconds |
| GitHub profiles connected | 40%+ of students |
| On-chain verification success | 99.9%+ |

---

## 9. Risks

| Risk | Mitigation |
|------|-----------|
| Students unfamiliar with Web3 | Hybrid auth; onboarding tutorial |
| Gas fees on mainnet | Testnet for MVP; gasless meta-TXs later |
| GitHub API rate limits | Cache in PostgreSQL; authenticated calls (5000/hr) |
| Smart contract bugs | Hardhat tests; audit before mainnet |

---

## 10. Roadmap

| Phase | Timeline | Deliverables |
|-------|----------|-------------|
| Phase 1 ✅ | Week 1–2 | Go backend, PostgreSQL, Docker |
| Phase 2 ✅ | Week 2–3 | Solidity contracts + tests |
| Phase 3 | Week 3–4 | go-ethereum, wallet auth, on-chain integration |
| Phase 4 | Week 4–5 | IPFS/Pinata, GitHub API, E2E credential flow |
| Phase 5 | Week 5–7 | React frontend, dashboards, public verification |
| Phase 6 | Week 7–8 | Testing, polish, demo deployment |
