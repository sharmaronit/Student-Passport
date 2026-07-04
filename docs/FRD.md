# Functional Requirements Document (FRD)
## Student Skill Passport

| Field | Value |
|-------|-------|
| **Version** | 1.0 (MVP) |
| **Date** | July 2026 |

---

## 1. Authentication & Authorization

### FR-1.1: Wallet-Based Authentication
| Field | Detail |
|-------|--------|
| **Description** | Users authenticate by signing a message with their blockchain wallet |
| **Flow** | 1. Client sends wallet address → 2. Server returns nonce + message → 3. Client signs with MetaMask/WalletConnect → 4. Server verifies signature → 5. Server issues JWT |
| **Nonce Rotation** | After each successful auth, server generates new nonce (prevents replay attacks) |
| **Wallets Supported** | MetaMask (browser extension), WalletConnect (QR code / mobile) |

### FR-1.2: Hybrid Email Registration
| Field | Detail |
|-------|--------|
| **Description** | Users can register with email and link a wallet later |
| **Fields** | email (required), full_name (required), role (required), wallet_address (optional) |
| **Wallet Linking** | Users can connect wallet to existing email account at any time |

### FR-1.3: Role-Based Access Control
| Role | Permissions |
|------|------------|
| **Student** | View own credentials, connect GitHub, generate share links, update profile |
| **Issuer** | Issue credentials, revoke own issued credentials, view issuance history |
| **Verifier** | Public verification endpoint (no auth required) |

---

## 2. User Profile Management

### FR-2.1: Student Profile
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| wallet_address | string | Yes | Ethereum address (0x...) |
| full_name | string | Yes | Min 2, max 255 chars |
| email | string | No | Unique if provided |
| university | string | No | Institution name |
| graduation_year | integer | No | 4-digit year |
| github_url | string | No | GitHub profile URL |
| linkedin_url | string | No | LinkedIn profile URL |
| portfolio_url | string | No | Personal website |
| avatar_url | string | No | Profile picture URL |
| bio | string | No | Short biography |

### FR-2.2: Issuer Profile
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| wallet_address | string | Yes | Organization wallet |
| full_name | string | Yes | Admin name |
| org_name | string | Yes | Organization name |
| org_type | string | Yes | university, company, hackathon_org, cert_platform |
| org_website | string | No | Organization URL |
| org_verified | boolean | Read-only | Set by admin via IssuerRegistry on-chain |

### FR-2.3: Profile Operations
| Operation | Endpoint | Auth | Notes |
|-----------|----------|------|-------|
| Create | POST /auth/register | None | Creates profile |
| Read own | GET /users/me | JWT | Returns full profile |
| Read other | GET /users/:id | JWT | Returns public fields only |
| Update own | PUT /users/me | JWT | Partial update supported |
| List | GET /users?role=student | JWT | Paginated, filterable by role |

---

## 3. Credential Management

### FR-3.1: Credential Issuance
| Field | Detail |
|-------|--------|
| **Who** | Authorized issuers only (verified in IssuerRegistry on-chain) |
| **Input** | student_wallet, credential_type, title, description, metadata (JSONB), expires_at |
| **Process** | 1. Validate issuer is authorized → 2. Build credential JSON → 3. Compute SHA-256 hash → 4. Upload metadata to IPFS (Pinata) → 5. Mint SBT on Polygon (hash + CID) → 6. Cache in PostgreSQL |
| **Output** | credential object with token_id, tx_hash, ipfs_cid |

### FR-3.2: Credential Types & Metadata

#### Hackathon
```json
{
  "event_name": "HackMIT 2024",
  "event_date": "2024-10-15",
  "team_name": "Neural Ninjas",
  "team_size": 4,
  "placement": "1st",
  "tracks": ["AI", "Education"],
  "event_url": "https://hackmit.org"
}
```

#### Certification
```json
{
  "platform": "AWS",
  "cert_id": "AWS-SAA-C03-12345",
  "cert_url": "https://aws.amazon.com/verify/12345",
  "skill_tags": ["cloud", "architecture"],
  "level": "associate"
}
```

#### Internship
```json
{
  "company": "TechCorp",
  "role": "SWE Intern",
  "start_date": "2024-06-01",
  "end_date": "2024-08-31",
  "tech_stack": ["Go", "PostgreSQL", "Docker"],
  "manager_name": "John Smith",
  "manager_email": "john@techcorp.dev"
}
```

#### Project
```json
{
  "repo_url": "https://github.com/user/project",
  "live_url": "https://project.dev",
  "tech_stack": ["React", "Node.js"],
  "contributors": ["Jane Doe", "Alex Chen"],
  "description": "A full-stack web application"
}
```

### FR-3.3: Credential Verification (Public)
| Field | Detail |
|-------|--------|
| **Endpoint** | GET /credentials/verify/:tokenId (no auth required) |
| **Process** | 1. Read SBT data from Polygon → 2. Check IssuerRegistry → 3. Check RevocationRegistry → 4. Fetch metadata from IPFS → 5. Recompute SHA-256 → 6. Compare with on-chain hash |
| **Response** | credential data, issuer info, hash_valid, issuer_verified, not_revoked |

### FR-3.4: Credential Revocation
| Field | Detail |
|-------|--------|
| **Who** | Only the original issuer |
| **Process** | 1. Call SkillCredential.revokeCredential(tokenId) → 2. Call RevocationRegistry.revoke(hash) → 3. Update DB status to 'revoked' |
| **Effect** | Credential still visible but marked as revoked; verification returns `not_revoked: false` |

### FR-3.5: Share Links
| Field | Detail |
|-------|--------|
| **Who** | Students can create share links for their own credentials |
| **Token** | 64-char random hex string |
| **URL** | `https://app.skillpassport.dev/verify/{share_token}` |
| **Features** | View counter, optional expiry date, can be deactivated |
| **Public** | Anyone with the link can view — no wallet or auth needed |

### FR-3.6: Digilocker Pull-Based Verification (Student Pull Desk)
| Field | Detail |
|-------|--------|
| **Who** | Any authenticated student can pull achievements directly to their wallet |
| **Integrations** | 1. **GitHub**: checks commit list for the student username in the specified repository.<br>2. **Credly/Coursera**: verifies certification IDs against platforms.<br>3. **Devfolio**: checks hackathon submissions.<br>4. **Internships**: triggers signature sign-off from manager email. |
| **Output** | Verifies credentials, uploads metadata to IPFS, and mints an SBT on-chain |

---

## 4. GitHub Integration

### FR-4.1: GitHub Profile Stats
| Field | Detail |
|-------|--------|
| **Endpoint** | GET /github/:username/stats |
| **Data Returned** | Public repos count, total stars, top languages, followers, account age |
| **Caching** | Cached in PostgreSQL for 24 hours |
| **Rate Limit** | GitHub API: 60/hr unauthenticated, 5000/hr authenticated |

### FR-4.2: GitHub Repositories
| Field | Detail |
|-------|--------|
| **Endpoint** | GET /github/:username/repos |
| **Data Returned** | Top 10 repos by stars: name, description, language, stars, forks, last updated |
| **Sorting** | By star count (descending) |

### FR-4.3: GitHub OAuth Connect
| Field | Detail |
|-------|--------|
| **Endpoint** | POST /github/connect |
| **Flow** | 1. Student initiates OAuth → 2. Redirected to GitHub → 3. Authorizes app → 4. Callback with code → 5. Server exchanges for access token → 6. Stores token, fetches profile |
| **Stored** | GitHub username, access token (encrypted), connected_at |

### FR-4.4: Contribution Graph (Frontend)
| Field | Detail |
|-------|--------|
| **Library** | `react-github-calendar` |
| **Display** | Green contribution heatmap (like GitHub profile) on student dashboard |
| **Data Source** | GitHub public contributions API |

### FR-4.5: Auto-Mint on PR Merge (P2 — Future)
| Field | Detail |
|-------|--------|
| **Trigger** | GitHub Webhook fires on `pull_request.closed` with `merged: true` |
| **Endpoint** | POST /github/webhook |
| **Process** | 1. Verify webhook signature → 2. Check if repo qualifies (star threshold, org whitelist) → 3. Build project credential → 4. Mint SBT to student wallet |
| **Credential Type** | `project` with auto-populated metadata from PR data |

---

## 5. On-Chain Operations

### FR-5.1: Issuer Registration
| Field | Detail |
|-------|--------|
| **Contract** | IssuerRegistry.sol |
| **Trigger** | Admin action (contract owner) |
| **Function** | `registerIssuer(address, name, orgType)` |
| **Effect** | Issuer can now mint SBTs via SkillCredential |

### FR-5.2: SBT Minting
| Field | Detail |
|-------|--------|
| **Contract** | SkillCredential.sol |
| **Function** | `issueCredential(student, type, hash, cid, uri)` |
| **Caller** | Must pass `issuerRegistry.isAuthorizedIssuer(msg.sender)` |
| **Result** | Non-transferable ERC-721 token in student's wallet |

### FR-5.3: Transfer Prevention (Soulbound)
| Field | Detail |
|-------|--------|
| **Mechanism** | `_update()` override reverts all transfers except mint and burn |
| **Error** | "SkillCredential: Soulbound tokens cannot be transferred" |

---

## 6. Non-Functional Requirements

| Requirement | Specification |
|-------------|--------------|
| **Response Time** | API responses < 500ms (p95) |
| **Availability** | 99.5% uptime (MVP) |
| **Scalability** | Support 1,000 concurrent users |
| **Data Retention** | Credentials permanent (on-chain); profiles retained indefinitely |
| **Browser Support** | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| **Mobile** | Responsive web; WalletConnect for mobile wallet access |
| **Accessibility** | WCAG 2.1 AA compliance (frontend) |

---

## 7. Error Handling

| Scenario | HTTP Code | Response |
|----------|-----------|----------|
| Invalid wallet address | 400 | `{ error: "invalid wallet address" }` |
| Wallet not registered | 404 | `{ error: "wallet not registered" }` |
| Invalid/expired JWT | 401 | `{ error: "invalid or expired token" }` |
| Insufficient permissions | 403 | `{ error: "insufficient permissions" }` |
| Credential not found | 404 | `{ error: "credential not found" }` |
| Issuer not authorized | 403 | `{ error: "only issuers can issue credentials" }` |
| Duplicate wallet | 409 | `{ error: "wallet already registered" }` |
| Blockchain TX failed | 500 | `{ error: "on-chain transaction failed" }` |
| GitHub API rate limited | 429 | `{ error: "GitHub API rate limit exceeded" }` |
