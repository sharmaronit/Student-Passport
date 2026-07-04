-- ============================================
-- Migration 000001: Create user profiles (Web3)
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User roles enum
CREATE TYPE user_role AS ENUM ('student', 'issuer');

-- Profiles table with Web3 wallet-based identity
CREATE TABLE profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address  VARCHAR(42) NOT NULL UNIQUE,  -- Ethereum/Polygon wallet (0x...)
    role            user_role       NOT NULL,
    full_name       VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    UNIQUE,        -- Optional, for notifications
    avatar_url      TEXT,
    bio             TEXT,

    -- Auth: nonce for wallet signature verification
    -- Client signs this nonce with MetaMask to prove wallet ownership
    auth_nonce      VARCHAR(64) NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),

    -- Student-specific fields (NULL for issuers)
    university      VARCHAR(255),
    graduation_year SMALLINT,
    github_url      TEXT,
    linkedin_url    TEXT,
    portfolio_url   TEXT,

    -- Issuer-specific fields (NULL for students)
    org_name        VARCHAR(255),
    org_type        VARCHAR(100),       -- 'university', 'company', 'hackathon_org', 'cert_platform'
    org_website     TEXT,
    org_verified    BOOLEAN DEFAULT FALSE,  -- On-chain verified via IssuerRegistry

    -- Timestamps
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_wallet ON profiles(wallet_address);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_org_name ON profiles(org_name) WHERE role = 'issuer';

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
