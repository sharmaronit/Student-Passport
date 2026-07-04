-- ============================================
-- Migration 000002: Create credentials tables (Web3)
-- ============================================

-- The Four Pillars
CREATE TYPE credential_type AS ENUM ('hackathon', 'certification', 'internship', 'project');

-- Credential lifecycle
CREATE TYPE credential_status AS ENUM ('pending', 'issued', 'revoked', 'expired');

-- ============================================
-- Credentials table — off-chain cache of on-chain SBTs
-- Source of truth is the blockchain; this table enables fast queries
-- ============================================
CREATE TABLE credentials (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- On-chain references
    token_id        BIGINT UNIQUE,                -- SBT token ID on SkillCredential contract
    tx_hash         VARCHAR(66),                  -- Minting transaction hash (0x...)
    ipfs_cid        VARCHAR(128),                 -- IPFS Content Identifier for metadata

    -- Relationships (off-chain)
    student_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    issuer_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Core fields
    credential_type credential_type  NOT NULL,
    title           VARCHAR(500)     NOT NULL,
    description     TEXT,
    status          credential_status DEFAULT 'pending',

    -- Time bounds
    issued_at       TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,

    -- ============================================
    -- JSONB metadata — structure varies by type:
    --
    -- hackathon:
    --   { "event_name", "event_date", "team_name",
    --     "team_size", "placement", "tracks", "event_url" }
    --
    -- certification:
    --   { "platform", "cert_id", "cert_url",
    --     "skill_tags", "level" }
    --
    -- internship:
    --   { "company", "role", "start_date", "end_date",
    --     "tech_stack", "manager_name", "manager_email" }
    --
    -- project:
    --   { "repo_url", "live_url", "tech_stack",
    --     "contributors", "description" }
    -- ============================================
    metadata        JSONB NOT NULL DEFAULT '{}',

    -- Cryptographic verification
    content_hash    VARCHAR(128),       -- SHA-256 hash of canonical credential JSON (also stored on-chain)

    -- Timestamps
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_credentials_token_id ON credentials(token_id);
CREATE INDEX idx_credentials_tx_hash ON credentials(tx_hash);
CREATE INDEX idx_credentials_student ON credentials(student_id);
CREATE INDEX idx_credentials_issuer ON credentials(issuer_id);
CREATE INDEX idx_credentials_type ON credentials(credential_type);
CREATE INDEX idx_credentials_status ON credentials(status);
CREATE INDEX idx_credentials_hash ON credentials(content_hash);
CREATE INDEX idx_credentials_metadata ON credentials USING GIN (metadata);

-- Updated_at trigger
CREATE TRIGGER update_credentials_updated_at
    BEFORE UPDATE ON credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Shareable verification links
-- ============================================
CREATE TABLE credential_share_links (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_id   UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    share_token     VARCHAR(64) NOT NULL UNIQUE,
    is_active       BOOLEAN DEFAULT TRUE,
    views_count     INTEGER DEFAULT 0,

    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_share_links_token ON credential_share_links(share_token);
CREATE INDEX idx_share_links_credential ON credential_share_links(credential_id);
