package service

import "github.com/student-skill-passport/backend/internal/domain"

// BlockchainService handles all interactions with smart contracts on Polygon.
type BlockchainService interface {
	// MintSBT mints a Soulbound Token on the SkillCredential contract.
	// Returns the token ID and transaction hash.
	MintSBT(studentWallet string, credentialType string, contentHash string, ipfsCID string) (tokenID int64, txHash string, err error)

	// GetCredentialOnChain reads credential data from the blockchain.
	GetCredentialOnChain(tokenID int64) (*domain.Verification, error)

	// IsAuthorizedIssuer checks if a wallet is registered in the IssuerRegistry.
	IsAuthorizedIssuer(walletAddress string) (bool, error)

	// RevokeOnChain calls the RevocationRegistry to revoke a credential.
	RevokeOnChain(tokenID int64) (txHash string, err error)

	// IsRevoked checks if a credential has been revoked on-chain.
	IsRevoked(tokenID int64) (bool, error)
}

// NOTE: The actual implementation will live in internal/blockchain/client.go
// and will use go-ethereum's ethclient + abigen-generated contract bindings.
//
// Phase 3 implementation steps:
// 1. Connect to Polygon Amoy via ethclient.Dial(rpcURL)
// 2. Load abigen-generated Go bindings for each contract
// 3. Implement each method above with proper TX management:
//    - Nonce management
//    - Gas estimation
//    - Transaction signing with backend wallet
//    - Receipt polling
