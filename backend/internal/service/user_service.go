package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/student-skill-passport/backend/internal/domain"
	"github.com/student-skill-passport/backend/internal/repository"
)

// UserService handles business logic for user operations.
type UserService struct {
	repo      repository.UserRepository
	jwtSecret string
}

// NewUserService creates a new user service.
func NewUserService(repo repository.UserRepository, jwtSecret string) *UserService {
	return &UserService{repo: repo, jwtSecret: jwtSecret}
}

// GetNonce returns the auth nonce for a wallet address.
// If the user doesn't exist yet, it returns a message indicating registration is needed.
func (s *UserService) GetNonce(ctx context.Context, walletAddress string) (*domain.NonceResponse, error) {
	walletAddress = strings.ToLower(walletAddress)

	user, err := s.repo.GetByWallet(ctx, walletAddress)
	if err != nil {
		return nil, fmt.Errorf("failed to lookup wallet: %w", err)
	}
	if user == nil {
		return nil, fmt.Errorf("wallet not registered: %s", walletAddress)
	}

	message := fmt.Sprintf(
		"Sign this message to authenticate with Student Skill Passport.\n\nNonce: %s\nWallet: %s",
		user.AuthNonce,
		walletAddress,
	)

	return &domain.NonceResponse{
		Nonce:   user.AuthNonce,
		Message: message,
	}, nil
}

// VerifyWalletSignature verifies a signed nonce and returns a JWT.
func (s *UserService) VerifyWalletSignature(ctx context.Context, req domain.VerifySignatureRequest) (*domain.AuthResponse, error) {
	walletAddress := strings.ToLower(req.WalletAddress)

	user, err := s.repo.GetByWallet(ctx, walletAddress)
	if err != nil {
		return nil, fmt.Errorf("failed to lookup wallet: %w", err)
	}
	if user == nil {
		return nil, fmt.Errorf("wallet not registered: %s", walletAddress)
	}

	// Reconstruct the message that was signed
	message := fmt.Sprintf(
		"Sign this message to authenticate with Student Skill Passport.\n\nNonce: %s\nWallet: %s",
		user.AuthNonce,
		walletAddress,
	)

	// Verify EIP-191 signature
	valid, err := verifyEIP191Signature(walletAddress, message, req.Signature)
	if err != nil {
		return nil, fmt.Errorf("failed to verify signature: %w", err)
	}
	if !valid {
		return nil, fmt.Errorf("invalid signature")
	}

	// Rotate nonce after successful auth (prevents replay attacks)
	newNonce, err := generateNonce()
	if err != nil {
		return nil, fmt.Errorf("failed to generate new nonce: %w", err)
	}
	if err := s.repo.UpdateNonce(ctx, walletAddress, newNonce); err != nil {
		return nil, fmt.Errorf("failed to rotate nonce: %w", err)
	}

	// Generate JWT
	token, err := s.generateJWT(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate JWT: %w", err)
	}

	return &domain.AuthResponse{
		Token: token,
		User:  *user,
	}, nil
}

// verifyEIP191Signature validates a signature hash using Ecrecover.
func verifyEIP191Signature(walletAddress string, message string, sigHex string) (bool, error) {
	// Parse signature hex
	sig, err := hexutil.Decode(sigHex)
	if err != nil {
		return false, fmt.Errorf("failed to decode signature hex: %w", err)
	}

	if len(sig) != 65 {
		return false, fmt.Errorf("invalid signature length: %d bytes (expected 65)", len(sig))
	}

	// EVM signature recovery ID (v) is standardly 27 or 28, we normalize to 0 or 1.
	if sig[64] == 27 || sig[64] == 28 {
		sig[64] -= 27
	}

	// Construct prefixed message hash
	prefixedMsg := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message)
	hash := crypto.Keccak256([]byte(prefixedMsg))

	// Recover the public key
	pubKeyRaw, err := crypto.Ecrecover(hash, sig)
	if err != nil {
		return false, fmt.Errorf("failed to ecrecover public key: %w", err)
	}

	pubKey, err := crypto.UnmarshalPubkey(pubKeyRaw)
	if err != nil {
		return false, fmt.Errorf("failed to unmarshal public key: %w", err)
	}

	derivedAddr := crypto.PubkeyToAddress(*pubKey)

	return strings.ToLower(derivedAddr.Hex()) == strings.ToLower(walletAddress), nil
}

// Register creates a new user profile with a wallet address.
func (s *UserService) Register(ctx context.Context, req domain.RegisterRequest) (*domain.User, error) {
	walletAddress := strings.ToLower(req.WalletAddress)

	// Check if wallet already registered
	existing, err := s.repo.GetByWallet(ctx, walletAddress)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing wallet: %w", err)
	}
	if existing != nil {
		return nil, fmt.Errorf("wallet already registered: %s", walletAddress)
	}

	nonce, err := generateNonce()
	if err != nil {
		return nil, fmt.Errorf("failed to generate nonce: %w", err)
	}

	user := &domain.User{
		ID:            uuid.New(),
		WalletAddress: walletAddress,
		Role:          req.Role,
		FullName:      req.FullName,
		Email:         req.Email,
		AuthNonce:     nonce,

		University:     req.University,
		GraduationYear: req.GraduationYear,
		GithubURL:      req.GithubURL,
		LinkedinURL:    req.LinkedinURL,
		PortfolioURL:   req.PortfolioURL,

		OrgName:    req.OrgName,
		OrgType:    req.OrgType,
		OrgWebsite: req.OrgWebsite,
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// GetProfile retrieves a user by ID.
func (s *UserService) GetProfile(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	return s.repo.GetByID(ctx, id)
}

// GetProfileByWallet retrieves a user by wallet address.
func (s *UserService) GetProfileByWallet(ctx context.Context, walletAddress string) (*domain.User, error) {
	return s.repo.GetByWallet(ctx, strings.ToLower(walletAddress))
}

// UpdateProfile updates a user's profile.
func (s *UserService) UpdateProfile(ctx context.Context, id uuid.UUID, req domain.UpdateProfileRequest) (*domain.User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("user not found")
	}

	// Apply updates
	if req.FullName != nil {
		user.FullName = *req.FullName
	}
	if req.Email != nil {
		user.Email = req.Email
	}
	if req.AvatarURL != nil {
		user.AvatarURL = req.AvatarURL
	}
	if req.Bio != nil {
		user.Bio = req.Bio
	}
	if req.University != nil {
		user.University = req.University
	}
	if req.GraduationYear != nil {
		user.GraduationYear = req.GraduationYear
	}
	if req.GithubURL != nil {
		user.GithubURL = req.GithubURL
	}
	if req.LinkedinURL != nil {
		user.LinkedinURL = req.LinkedinURL
	}
	if req.PortfolioURL != nil {
		user.PortfolioURL = req.PortfolioURL
	}
	if req.OrgName != nil {
		user.OrgName = req.OrgName
	}
	if req.OrgType != nil {
		user.OrgType = req.OrgType
	}
	if req.OrgWebsite != nil {
		user.OrgWebsite = req.OrgWebsite
	}

	if err := s.repo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

// ListUsers lists users with optional role filter.
func (s *UserService) ListUsers(ctx context.Context, role *domain.UserRole, limit, offset int) ([]*domain.User, error) {
	return s.repo.List(ctx, role, limit, offset)
}

// generateJWT creates a JWT token for the authenticated user.
func (s *UserService) generateJWT(user *domain.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":            user.ID.String(),
		"wallet_address": user.WalletAddress,
		"role":           string(user.Role),
		"iat":            time.Now().Unix(),
		"exp":            time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

// generateNonce creates a cryptographically random hex nonce.
func generateNonce() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
