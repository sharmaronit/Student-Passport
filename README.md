# Student Skill Passport 🎓🔗

A **Web3-powered digital wallet** for students that stores verifiable academic and professional credentials as **Soulbound Tokens (SBTs)** on the **Polygon** blockchain. Recruiters can verify any credential on-chain — no middlemen, no faking.

---

## The Problem

Current resumes rely on the honor system. They are easily faked, leading to wasted time and money on background checks.

## The Solution

Institutions issue **cryptographically verifiable, non-transferable credentials** directly to a student's blockchain wallet. Anyone can verify them on-chain — zero trust required.

## The Five Pillars of Credentials

| Pillar | What It Proves |
|--------|---------------|
| 🏆 **Hackathons** | Attendance, team participation, placements |
| 📜 **Certifications** | Verified certificates from authorized platforms |
| 💼 **Internships** | Employment dates, tech stacks, roles |
| 🚀 **Projects** | Deployed apps, code repositories |
| 🐙 **GitHub Contributions** | Open-source commits, PRs, coding activity — auto-verified via GitHub API |

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   React App     │────▶│   Go API     │────▶│  Polygon Amoy   │
│   + MetaMask    │     │  (Chi/pgx)   │     │  Smart Contracts│
│   + WalletConnect│    │              │     │  (Soulbound SBT)│
└─────────────────┘     │              │     └─────────────────┘
                        │              │     ┌─────────────────┐
                        │              │────▶│  IPFS (Pinata)  │
                        │              │     │  Credential Data│
                        │              │     └─────────────────┘
                        │              │     ┌─────────────────┐
                        │              │────▶│  PostgreSQL     │
                        │              │     │  User Profiles  │
                        │              │     └─────────────────┘
                        │              │     ┌─────────────────┐
                        │              │────▶│  GitHub API     │
                        └──────────────┘     │  Contributions  │
                                             └─────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Polygon Amoy Testnet (Chain ID: 80002) |
| Smart Contracts | Solidity 0.8.24 + Hardhat + OpenZeppelin |
| Backend | Go 1.22 + Chi + pgx + go-ethereum |
| Database | PostgreSQL 15 |
| Decentralized Storage | IPFS via Pinata |
| Frontend | React (Vite) + wagmi + WalletConnect |
| Auth | Hybrid (Email + MetaMask wallet signature) |
| GitHub Integration | GitHub REST/GraphQL API + OAuth + Webhooks |
| Containerization | Docker + Docker Compose |

## Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Go 1.22+](https://go.dev/dl/)
- [Node.js 18+](https://nodejs.org/) & npm
- [MetaMask](https://metamask.io/) browser extension

### 1. Clone & Configure
```bash
cp .env.example .env
# Edit .env with your values (Pinata keys, wallet private key, etc.)
```

### 2. Start Backend (Docker)
```bash
docker compose up -d
# PostgreSQL starts → Migrations run → Go API starts
# API available at http://localhost:8080
```

### 3. Verify API Health
```bash
curl http://localhost:8080/api/v1/health
```

### 4. Smart Contracts (Hardhat)
```bash
cd contracts
npm install
npx hardhat test                                    # Run all contract tests
npx hardhat run scripts/deploy.js --network amoy    # Deploy to testnet
```

### 5. Get Free Testnet Tokens
- Visit [Polygon Faucet](https://faucet.polygon.technology/)
- Enter your wallet address
- Receive free POL tokens for gas fees (zero cost on testnet)

## API Endpoints

### Auth (Hybrid: Email + Wallet)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register with wallet address + email |
| POST | `/api/v1/auth/nonce` | Get nonce to sign with MetaMask |
| POST | `/api/v1/auth/verify` | Verify signed nonce → JWT |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get my profile |
| PUT | `/api/v1/users/me` | Update my profile |
| GET | `/api/v1/users/:id` | Get user by ID |
| GET | `/api/v1/users` | List users (filter by role) |

### Credentials
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/credentials/issue` | Issue credential (issuer-only) |
| GET | `/api/v1/credentials/:id` | Get credential by ID |
| GET | `/api/v1/credentials` | List with filters |
| GET | `/api/v1/wallet/credentials` | Get my credentials |
| POST | `/api/v1/credentials/:id/revoke` | Revoke (issuer-only) |
| GET | `/api/v1/credentials/verify/:tokenId` | Public verification |

### GitHub Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/github/:username/stats` | Fetch GitHub contribution stats |
| GET | `/api/v1/github/:username/repos` | List top repositories |
| POST | `/api/v1/github/connect` | Connect GitHub via OAuth |
| POST | `/api/v1/github/webhook` | Receive PR merge events (auto-mint SBT) |

## Smart Contracts

| Contract | Purpose |
|----------|---------|
| `IssuerRegistry.sol` | Whitelist of authorized credential issuers |
| `SkillCredential.sol` | Soulbound Token (SBT) — non-transferable ERC-721 |
| `RevocationRegistry.sol` | On-chain credential revocation tracker |

## Project Structure
```
student-skill-passport/
├── docs/              # PRD, TRD, FRD documentation
├── backend/           # Go API server
│   ├── cmd/api/       # Entry point
│   ├── internal/      # Private app code (domain, service, handler, repo)
│   ├── pkg/crypto/    # SHA-256 hashing utilities
│   └── migrations/    # SQL migrations
├── contracts/         # Solidity smart contracts
│   ├── contracts/     # .sol files
│   ├── test/          # Hardhat tests
│   └── scripts/       # Deployment scripts
├── frontend/          # React app (Phase 5)
├── supabase/          # Seed data
└── docker-compose.yml
```

## Documentation

| Document | Description |
|----------|-------------|
| [PRD](docs/PRD.md) | Product Requirements Document — vision, user stories, success metrics |
| [TRD](docs/TRD.md) | Technical Requirements Document — architecture, stack, infrastructure |
| [FRD](docs/FRD.md) | Functional Requirements Document — detailed feature specifications |

## License

MIT
