package domain

import (
	"time"

	"github.com/google/uuid"
)

// UserRole represents the type of user in the system.
type UserRole string

const (
	RoleStudent UserRole = "student"
	RoleIssuer  UserRole = "issuer"
)

// User represents a user profile in the system.
// Identity is anchored by a blockchain wallet address.
type User struct {
	ID            uuid.UUID `json:"id"`
	WalletAddress string    `json:"wallet_address"` // Ethereum/Polygon address (0x...)
	Role          UserRole  `json:"role"`
	FullName      string    `json:"full_name"`
	Email         *string   `json:"email,omitempty"`
	AvatarURL     *string   `json:"avatar_url,omitempty"`
	Bio           *string   `json:"bio,omitempty"`

	// Wallet auth nonce — client signs this to prove wallet ownership
	AuthNonce string `json:"-"`

	// Student-specific fields
	University     *string `json:"university,omitempty"`
	GraduationYear *int16  `json:"graduation_year,omitempty"`
	GithubURL      *string `json:"github_url,omitempty"`
	LinkedinURL    *string `json:"linkedin_url,omitempty"`
	PortfolioURL   *string `json:"portfolio_url,omitempty"`

	// Issuer-specific fields
	OrgName     *string `json:"org_name,omitempty"`
	OrgType     *string `json:"org_type,omitempty"`
	OrgWebsite  *string `json:"org_website,omitempty"`
	OrgVerified bool    `json:"org_verified"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ============================================
// Auth DTOs — Wallet-based authentication
// ============================================

// NonceRequest is the first step of wallet auth.
// Client sends wallet address, server returns a nonce to sign.
type NonceRequest struct {
	WalletAddress string `json:"wallet_address" validate:"required,len=42"`
}

// NonceResponse returns the nonce the client must sign.
type NonceResponse struct {
	Nonce   string `json:"nonce"`
	Message string `json:"message"` // Human-readable message to sign
}

// VerifySignatureRequest is the second step of wallet auth.
// Client sends the signed nonce; server verifies and issues JWT.
type VerifySignatureRequest struct {
	WalletAddress string `json:"wallet_address" validate:"required,len=42"`
	Signature     string `json:"signature" validate:"required"`
}

// AuthResponse is returned on successful wallet authentication.
type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// ============================================
// Registration & Update DTOs
// ============================================

// RegisterRequest creates a new profile linked to a wallet.
type RegisterRequest struct {
	WalletAddress string   `json:"wallet_address" validate:"required,len=42"`
	Role          UserRole `json:"role" validate:"required,oneof=student issuer"`
	FullName      string   `json:"full_name" validate:"required,min=2,max=255"`
	Email         *string  `json:"email,omitempty"`

	// Student fields
	University     *string `json:"university,omitempty"`
	GraduationYear *int16  `json:"graduation_year,omitempty"`
	GithubURL      *string `json:"github_url,omitempty"`
	LinkedinURL    *string `json:"linkedin_url,omitempty"`
	PortfolioURL   *string `json:"portfolio_url,omitempty"`

	// Issuer fields
	OrgName    *string `json:"org_name,omitempty"`
	OrgType    *string `json:"org_type,omitempty"`
	OrgWebsite *string `json:"org_website,omitempty"`
}

// UpdateProfileRequest contains fields that can be updated.
type UpdateProfileRequest struct {
	FullName       *string `json:"full_name,omitempty"`
	Email          *string `json:"email,omitempty"`
	AvatarURL      *string `json:"avatar_url,omitempty"`
	Bio            *string `json:"bio,omitempty"`
	University     *string `json:"university,omitempty"`
	GraduationYear *int16  `json:"graduation_year,omitempty"`
	GithubURL      *string `json:"github_url,omitempty"`
	LinkedinURL    *string `json:"linkedin_url,omitempty"`
	PortfolioURL   *string `json:"portfolio_url,omitempty"`
	OrgName        *string `json:"org_name,omitempty"`
	OrgType        *string `json:"org_type,omitempty"`
	OrgWebsite     *string `json:"org_website,omitempty"`
}
