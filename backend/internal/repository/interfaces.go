package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/student-skill-passport/backend/internal/domain"
)

// UserRepository defines the data access interface for user profiles.
type UserRepository interface {
	// Create inserts a new user profile.
	Create(ctx context.Context, user *domain.User) error

	// GetByID retrieves a user by their internal UUID.
	GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error)

	// GetByWallet retrieves a user by their blockchain wallet address.
	GetByWallet(ctx context.Context, walletAddress string) (*domain.User, error)

	// Update modifies an existing user profile.
	Update(ctx context.Context, user *domain.User) error

	// UpdateNonce regenerates the auth nonce for a wallet address.
	UpdateNonce(ctx context.Context, walletAddress string, newNonce string) error

	// List returns users matching the given role filter.
	List(ctx context.Context, role *domain.UserRole, limit, offset int) ([]*domain.User, error)

	// Delete removes a user profile.
	Delete(ctx context.Context, id uuid.UUID) error
}

// CredentialRepository defines the data access interface for credentials.
type CredentialRepository interface {
	// Create inserts a new credential record (off-chain cache).
	Create(ctx context.Context, cred *domain.Credential) error

	// GetByID retrieves a credential by its internal UUID.
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Credential, error)

	// GetByTokenID retrieves a credential by its on-chain SBT token ID.
	GetByTokenID(ctx context.Context, tokenID int64) (*domain.Credential, error)

	// Update modifies an existing credential (e.g., after minting completes).
	Update(ctx context.Context, cred *domain.Credential) error

	// UpdateOnChainData sets the token_id, tx_hash, ipfs_cid, and status after minting.
	UpdateOnChainData(ctx context.Context, id uuid.UUID, tokenID int64, txHash, ipfsCID, contentHash string) error

	// List returns credentials matching the given filters.
	List(ctx context.Context, filter domain.CredentialFilter) ([]*domain.Credential, error)

	// UpdateStatus changes the credential status (e.g., revoked).
	UpdateStatus(ctx context.Context, id uuid.UUID, status domain.CredentialStatus) error

	// Delete removes a credential record.
	Delete(ctx context.Context, id uuid.UUID) error
}

// ShareLinkRepository defines the data access interface for credential share links.
type ShareLinkRepository interface {
	// Create inserts a new share link.
	Create(ctx context.Context, link *domain.CredentialShareLink) error

	// GetByToken retrieves a share link by its public token.
	GetByToken(ctx context.Context, token string) (*domain.CredentialShareLink, error)

	// IncrementViews increments the view counter for a share link.
	IncrementViews(ctx context.Context, token string) error

	// Deactivate disables a share link.
	Deactivate(ctx context.Context, id uuid.UUID) error

	// ListByStudent returns all share links for a student.
	ListByStudent(ctx context.Context, studentID uuid.UUID) ([]*domain.CredentialShareLink, error)
}
