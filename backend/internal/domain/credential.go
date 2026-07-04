package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// CredentialType represents one of the Four Pillars.
type CredentialType string

const (
	CredentialHackathon     CredentialType = "hackathon"
	CredentialCertification CredentialType = "certification"
	CredentialInternship    CredentialType = "internship"
	CredentialProject       CredentialType = "project"
)

// CredentialStatus tracks the lifecycle of a credential.
type CredentialStatus string

const (
	StatusPending CredentialStatus = "pending"
	StatusIssued  CredentialStatus = "issued"
	StatusRevoked CredentialStatus = "revoked"
	StatusExpired CredentialStatus = "expired"
)

// Credential represents a verifiable credential in the student's wallet.
// Source of truth is the blockchain SBT; this struct is the off-chain cache.
type Credential struct {
	ID        uuid.UUID  `json:"id"`
	StudentID uuid.UUID  `json:"student_id"`
	IssuerID  *uuid.UUID `json:"issuer_id,omitempty"`

	// On-chain references
	TokenID *int64  `json:"token_id,omitempty"` // SBT token ID on SkillCredential contract
	TxHash  *string `json:"tx_hash,omitempty"`  // Minting transaction hash
	IPFSCID *string `json:"ipfs_cid,omitempty"` // IPFS Content Identifier

	// Core fields
	CredentialType CredentialType   `json:"credential_type"`
	Title          string           `json:"title"`
	Description    *string          `json:"description,omitempty"`
	Status         CredentialStatus `json:"status"`

	IssuedAt  *time.Time `json:"issued_at,omitempty"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`

	// Type-specific data stored as raw JSON
	Metadata json.RawMessage `json:"metadata"`

	// SHA-256 hash of canonical credential JSON (also stored on-chain)
	ContentHash *string `json:"content_hash,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ============================================
// Type-specific metadata structs
// ============================================

// HackathonMetadata stores hackathon-specific credential data.
type HackathonMetadata struct {
	EventName string   `json:"event_name"`
	EventDate string   `json:"event_date"`
	TeamName  string   `json:"team_name,omitempty"`
	TeamSize  int      `json:"team_size,omitempty"`
	Placement string   `json:"placement,omitempty"`
	Tracks    []string `json:"tracks,omitempty"`
	EventURL  string   `json:"event_url,omitempty"`
}

// CertificationMetadata stores certification-specific credential data.
type CertificationMetadata struct {
	Platform  string   `json:"platform"`
	CertID    string   `json:"cert_id"`
	CertURL   string   `json:"cert_url,omitempty"`
	SkillTags []string `json:"skill_tags,omitempty"`
	Level     string   `json:"level,omitempty"`
}

// InternshipMetadata stores internship-specific credential data.
type InternshipMetadata struct {
	Company      string   `json:"company"`
	Role         string   `json:"role"`
	StartDate    string   `json:"start_date"`
	EndDate      string   `json:"end_date"`
	TechStack    []string `json:"tech_stack,omitempty"`
	ManagerName  string   `json:"manager_name,omitempty"`
	ManagerEmail string   `json:"manager_email,omitempty"`
}

// ProjectMetadata stores project-specific credential data.
type ProjectMetadata struct {
	RepoURL      string   `json:"repo_url"`
	LiveURL      string   `json:"live_url,omitempty"`
	TechStack    []string `json:"tech_stack,omitempty"`
	Contributors []string `json:"contributors,omitempty"`
	Description  string   `json:"description,omitempty"`
}

// ============================================
// Request/Response DTOs
// ============================================

// IssueCredentialRequest is the input for issuing a new credential.
// This triggers: hash → IPFS upload → on-chain SBT mint → DB cache.
type IssueCredentialRequest struct {
	StudentWallet  string          `json:"student_wallet" validate:"required,len=42"`
	CredentialType CredentialType  `json:"credential_type" validate:"required"`
	Title          string          `json:"title" validate:"required,min=3,max=500"`
	Description    *string         `json:"description,omitempty"`
	ExpiresAt      *time.Time      `json:"expires_at,omitempty"`
	Metadata       json.RawMessage `json:"metadata" validate:"required"`
}

// CredentialFilter provides query filters for listing credentials.
type CredentialFilter struct {
	StudentID      *uuid.UUID       `json:"student_id,omitempty"`
	IssuerID       *uuid.UUID       `json:"issuer_id,omitempty"`
	WalletAddress  *string          `json:"wallet_address,omitempty"`
	CredentialType *CredentialType  `json:"credential_type,omitempty"`
	Status         *CredentialStatus `json:"status,omitempty"`
	Limit          int              `json:"limit,omitempty"`
	Offset         int              `json:"offset,omitempty"`
}

// CredentialShareLink represents a shareable verification link.
type CredentialShareLink struct {
	ID           uuid.UUID  `json:"id"`
	CredentialID uuid.UUID  `json:"credential_id"`
	StudentID    uuid.UUID  `json:"student_id"`
	ShareToken   string     `json:"share_token"`
	IsActive     bool       `json:"is_active"`
	ViewsCount   int        `json:"views_count"`
	ExpiresAt    *time.Time `json:"expires_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
}

// IssuedCredentialResponse is returned after successfully issuing a credential.
type IssuedCredentialResponse struct {
	Credential Credential `json:"credential"`
	TokenID    int64      `json:"token_id"`
	TxHash     string     `json:"tx_hash"`
	IPFSCID    string     `json:"ipfs_cid"`
	IPFSUrl    string     `json:"ipfs_url"`
}
