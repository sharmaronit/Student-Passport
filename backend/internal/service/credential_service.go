package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/student-skill-passport/backend/internal/domain"
	"github.com/student-skill-passport/backend/internal/repository"
	"github.com/student-skill-passport/backend/pkg/crypto"
)

// CredentialService handles business logic for credential operations.
type CredentialService struct {
	credRepo          repository.CredentialRepository
	userRepo          repository.UserRepository
	blockchainService BlockchainService
}

// NewCredentialService creates a new credential service.
func NewCredentialService(
	credRepo repository.CredentialRepository,
	userRepo repository.UserRepository,
	blockchainService BlockchainService,
) *CredentialService {
	return &CredentialService{
		credRepo:          credRepo,
		userRepo:          userRepo,
		blockchainService: blockchainService,
	}
}

// IssueCredential creates a new credential and prepares it for on-chain minting.
// In Phase 1, this creates the off-chain record with a content hash.
// In Phase 3+, this will also upload to IPFS and mint the SBT.
func (s *CredentialService) IssueCredential(ctx context.Context, issuerID uuid.UUID, req domain.IssueCredentialRequest) (*domain.Credential, error) {
	// Verify issuer exists and has the right role
	issuer, err := s.userRepo.GetByID(ctx, issuerID)
	if err != nil {
		return nil, fmt.Errorf("failed to lookup issuer: %w", err)
	}
	if issuer == nil {
		return nil, fmt.Errorf("issuer not found")
	}
	if issuer.Role != domain.RoleIssuer {
		return nil, fmt.Errorf("only issuers can issue credentials")
	}

	// Find student by wallet address
	student, err := s.userRepo.GetByWallet(ctx, req.StudentWallet)
	if err != nil {
		return nil, fmt.Errorf("failed to lookup student: %w", err)
	}
	if student == nil {
		return nil, fmt.Errorf("student wallet not found: %s", req.StudentWallet)
	}
	if student.Role != domain.RoleStudent {
		return nil, fmt.Errorf("target wallet is not a student")
	}

	// Build the credential payload for hashing
	hashPayload := map[string]interface{}{
		"credential_type": req.CredentialType,
		"title":           req.Title,
		"student_wallet":  req.StudentWallet,
		"issuer_wallet":   issuer.WalletAddress,
		"metadata":        json.RawMessage(req.Metadata),
	}

	contentHash, err := crypto.HashCredentialJSON(hashPayload)
	if err != nil {
		return nil, fmt.Errorf("failed to hash credential: %w", err)
	}

	cred := &domain.Credential{
		ID:             uuid.New(),
		StudentID:      student.ID,
		IssuerID:       &issuer.ID,
		CredentialType: req.CredentialType,
		Title:          req.Title,
		Description:    req.Description,
		Status:         domain.StatusPending, // Will become 'issued' after on-chain mint
		ExpiresAt:      req.ExpiresAt,
		Metadata:       req.Metadata,
		ContentHash:    &contentHash,
	}

	if err := s.credRepo.Create(ctx, cred); err != nil {
		return nil, fmt.Errorf("failed to save credential: %w", err)
	}

	log.Info().
		Str("credential_id", cred.ID.String()).
		Str("type", string(cred.CredentialType)).
		Str("student", req.StudentWallet).
		Str("hash", contentHash).
		Msg("credential created (pending on-chain mint)")

	// Mint SBT on-chain
	// For Phase 3, we generate a mock or placeholder IPFS CID since IPFS is in Phase 4
	ipfsCID := "Qm" + contentHash[:44]
	tokenID, txHash, err := s.blockchainService.MintSBT(req.StudentWallet, string(cred.CredentialType), contentHash, ipfsCID)
	if err != nil {
		return nil, fmt.Errorf("failed to mint SBT on-chain: %w", err)
	}

	// Update database cache with on-chain details and transition status to Issued
	if err := s.credRepo.UpdateOnChainData(ctx, cred.ID, tokenID, txHash, ipfsCID, contentHash); err != nil {
		return nil, fmt.Errorf("failed to update credential on-chain data in database: %w", err)
	}

	cred.TokenID = &tokenID
	cred.TxHash = &txHash
	cred.IPFSCID = &ipfsCID
	cred.Status = domain.StatusIssued

	return cred, nil
}

// GetCredential retrieves a credential by ID.
func (s *CredentialService) GetCredential(ctx context.Context, id uuid.UUID) (*domain.Credential, error) {
	return s.credRepo.GetByID(ctx, id)
}

// GetCredentialByTokenID retrieves a credential by its on-chain SBT token ID.
func (s *CredentialService) GetCredentialByTokenID(ctx context.Context, tokenID int64) (*domain.Credential, error) {
	return s.credRepo.GetByTokenID(ctx, tokenID)
}

// ListCredentials returns credentials matching the given filter.
func (s *CredentialService) ListCredentials(ctx context.Context, filter domain.CredentialFilter) ([]*domain.Credential, error) {
	return s.credRepo.List(ctx, filter)
}

// ListStudentCredentials returns all credentials for a specific student.
func (s *CredentialService) ListStudentCredentials(ctx context.Context, studentID uuid.UUID) ([]*domain.Credential, error) {
	return s.credRepo.List(ctx, domain.CredentialFilter{
		StudentID: &studentID,
		Limit:     100,
	})
}

// RevokeCredential marks a credential as revoked.
// In Phase 3+, this will also call RevocationRegistry.sol on-chain.
func (s *CredentialService) RevokeCredential(ctx context.Context, issuerID, credentialID uuid.UUID) error {
	cred, err := s.credRepo.GetByID(ctx, credentialID)
	if err != nil {
		return fmt.Errorf("failed to get credential: %w", err)
	}
	if cred == nil {
		return fmt.Errorf("credential not found")
	}
	if cred.IssuerID == nil || *cred.IssuerID != issuerID {
		return fmt.Errorf("only the original issuer can revoke this credential")
	}
	if cred.Status == domain.StatusRevoked {
		return fmt.Errorf("credential already revoked")
	}

	// Call SkillCredential contract to revoke the token on-chain
	if cred.TokenID != nil {
		txHash, err := s.blockchainService.RevokeOnChain(*cred.TokenID)
		if err != nil {
			return fmt.Errorf("failed to revoke credential on-chain: %w", err)
		}
		log.Info().Str("tx_hash", txHash).Int64("token_id", *cred.TokenID).Msg("Revoked credential on-chain")
	}

	if err := s.credRepo.UpdateStatus(ctx, credentialID, domain.StatusRevoked); err != nil {
		return fmt.Errorf("failed to revoke credential: %w", err)
	}

	log.Info().
		Str("credential_id", credentialID.String()).
		Msg("credential revoked")

	return nil
}
