# Technical Requirements Document (TRD)
## Student Skill Passport

| Field | Value |
|-------|-------|
| **Version** | 1.0 (MVP) |
| **Date** | July 2026 |

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│  React (Vite) + wagmi + WalletConnect + MetaMask            │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS / JSON
┌──────────────────────▼──────────────────────────────────────┐
│                    API LAYER (Go)                            │
│  Chi Router → Auth Middleware → Handlers → Services          │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ User Svc │ │ Credential   │ │ Blockchain Svc           │ │
│  │          │ │ Service      │ │ (go-ethereum + ethclient) │ │
│  └────┬─────┘ └──────┬───────┘ └──────────┬───────────────┘ │
│       │              │                     │                 │
│  ┌────▼──────────────▼─────┐  ┌────────────▼──────────┐     │
│  │ PostgreSQL Repository   │  │ IPFS Client (Pinata)  │     │
│  └─────────────────────────┘  └───────────────────────┘     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌────────────┐
│ PostgreSQL   │ │ Polygon  │ │ IPFS       │
│ (Supabase)   │ │ Amoy     │ │ (Pinata)   │
│              │ │ Testnet  │ │            │
│ - profiles   │ │          │ │ Credential │
│ - credentials│ │ - SBTs   │ │ metadata   │
│ - share_links│ │ - Issuer │ │ JSON files │
│ - github_data│ │   Registry│ │           │
└──────────────┘ └──────────┘ └────────────┘
```

---

## 2. Technology Stack

### Backend
| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Language | Go | 1.22+ | High-performance, compiled, excellent concurrency |
| HTTP Router | Chi | v5 | Lightweight, idiomatic Go, middleware-friendly |
| Database Driver | pgx | v5 | Fastest pure-Go PostgreSQL driver |
| JWT | golang-jwt | v5 | Industry-standard token auth |
| Logging | zerolog | v1.33 | Zero-allocation structured JSON logging |
| Config | godotenv | v1.5 | Simple .env file loading |
| Blockchain | go-ethereum | latest | Official Go Ethereum client |
| Hashing | crypto/sha256 | stdlib | SHA-256 for credential content hashing |

### Blockchain
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Network | Polygon Amoy Testnet | EVM-compatible, near-zero gas, fast finality |
| Chain ID | 80002 | Amoy testnet identifier |
| RPC | `rpc-amoy.polygon.technology` | Official public RPC |
| Smart Contracts | Solidity 0.8.24 | Latest stable, optimizer enabled |
| Framework | Hardhat | Industry-standard Solidity dev toolchain |
| Libraries | OpenZeppelin v5 | Audited ERC-721, Ownable, AccessControl |
| Token Standard | ERC-721 (modified SBT) | Non-transferable via `_update()` override |

### Database
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| RDBMS | PostgreSQL 15 | JSONB support, GIN indexes, RLS, mature ecosystem |
| Migrations | golang-migrate | Version-controlled schema changes |
| Extensions | uuid-ossp, pgcrypto | UUID generation, random nonce generation |

### Frontend (Phase 5)
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | React + Vite | Fast HMR, modern tooling |
| Wallet | wagmi + @web3modal/react | MetaMask + WalletConnect support |
| Styling | TBD (Tailwind or vanilla CSS) | — |

### Infrastructure
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Containerization | Docker + Docker Compose | Reproducible local dev |
| IPFS Pinning | Pinata | Reliable pinning, dedicated gateways |
| CI/CD | GitHub Actions (future) | — |

---

## 3. Database Schema

### `profiles` table
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| wallet_address | VARCHAR(42) | Unique, Ethereum address |
| role | ENUM | 'student' or 'issuer' |
| full_name | VARCHAR(255) | Required |
| email | VARCHAR(255) | Optional, unique |
| auth_nonce | VARCHAR(64) | Random hex for wallet sign-in |
| university, graduation_year | VARCHAR, SMALLINT | Student fields |
| github_url, linkedin_url, portfolio_url | TEXT | Student links |
| org_name, org_type, org_website | VARCHAR, TEXT | Issuer fields |
| org_verified | BOOLEAN | On-chain verification status |
| created_at, updated_at | TIMESTAMPTZ | Auto-managed |

### `credentials` table
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| token_id | BIGINT | On-chain SBT token ID |
| tx_hash | VARCHAR(66) | Minting transaction hash |
| ipfs_cid | VARCHAR(128) | IPFS Content Identifier |
| student_id, issuer_id | UUID (FK) | References profiles |
| credential_type | ENUM | hackathon, certification, internship, project |
| title, description | VARCHAR, TEXT | Human-readable |
| status | ENUM | pending, issued, revoked, expired |
| metadata | JSONB | Type-specific data (GIN indexed) |
| content_hash | VARCHAR(128) | SHA-256 of canonical credential JSON |
| issued_at, expires_at | TIMESTAMPTZ | Time bounds |

### `credential_share_links` table
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| credential_id, student_id | UUID (FK) | References |
| share_token | VARCHAR(64) | Unique, URL-safe random token |
| is_active | BOOLEAN | Can be deactivated |
| views_count | INTEGER | Analytics |
| expires_at | TIMESTAMPTZ | Optional TTL |

---

## 4. Smart Contract Architecture

### IssuerRegistry.sol
- **Purpose**: Whitelist of authorized credential issuers
- **Storage**: `mapping(address => Issuer)` with name, orgType, isActive, registeredAt
- **Access**: Only contract owner (admin) via `Ownable`
- **Functions**: `registerIssuer()`, `revokeIssuer()`, `reactivateIssuer()`, `isAuthorizedIssuer()`

### SkillCredential.sol (Soulbound Token)
- **Purpose**: Non-transferable ERC-721 for credential minting
- **Soulbound Mechanism**: `_update()` reverts if `from != address(0) && to != address(0)`
- **On-chain Storage**: `CredentialData` struct per token (issuer, student, type, hash, CID, timestamp, revoked)
- **Mappings**: `studentCredentials[address]`, `issuerCredentials[address]`
- **Access**: Only addresses passing `issuerRegistry.isAuthorizedIssuer()` can mint

### RevocationRegistry.sol
- **Purpose**: Independent revocation tracker by content hash
- **Storage**: `mapping(string => bool)` for revocation status
- **Access**: Authorized revokers managed by contract owner

---

## 5. API Design

- **Protocol**: REST over HTTPS
- **Format**: JSON request/response with standard envelope `{ success, data, error }`
- **Auth**: JWT Bearer tokens (issued after wallet signature verification)
- **Versioning**: URL-based (`/api/v1/`)
- **Rate Limiting**: To be added in production
- **CORS**: Configured for `localhost:3000` and `localhost:5173`

### Pull Desk Endpoints (Digilocker Mode)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/credentials/pull` | `POST` | JWT | Pull achievements via third-party APIs (GitHub, Credly, Devfolio) and mint SBTs |

**Request Payload:**
```json
{
  "credential_type": "project",
  "pull_parameters": {
    "github_username": "sharmaronit",
    "repository_owner": "facebook",
    "repository_name": "react"
  }
}
```

---

## 6. Security Requirements

| Requirement | Implementation |
|-------------|---------------|
| Authentication | Wallet signature (EIP-191) + JWT; nonce rotation prevents replay |
| Authorization | Role-based middleware (student vs issuer) |
| Data Privacy | PII never stored on-chain; only hashes and CIDs on blockchain |
| Private Keys | Backend wallet key via env var; never committed to git |
| SQL Injection | Parameterized queries via pgx |
| Input Validation | Struct validation tags on all request DTOs |
| CORS | Allowlist of frontend origins only |

---

## 7. GitHub Integration (Phase 4)

| Component | Implementation |
|-----------|---------------|
| **Stats Fetch** | GitHub REST API v3 — `/users/{username}` for profile, repos, contributions |
| **OAuth** | GitHub OAuth App — students authorize to link account |
| **Caching** | Store GitHub stats in PostgreSQL, refresh every 24h |
| **Contribution Graph** | Frontend uses `react-github-calendar` library |
| **Auto-Mint (P2)** | GitHub Webhook on PR merge → Go backend verifies → mints SBT |

---

## 8. Deployment Architecture (Production — Future)

| Component | Platform |
|-----------|----------|
| Go API | AWS ECS / Railway / Fly.io |
| PostgreSQL | Supabase Cloud (managed) |
| Smart Contracts | Polygon Mainnet |
| IPFS | Pinata (dedicated gateway) |
| Frontend | Vercel |
| DNS | Cloudflare |
| Monitoring | Prometheus + Grafana |
