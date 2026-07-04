package domain

// Verification holds the result of verifying a credential on-chain.
type Verification struct {
	// On-chain data
	TokenID       int64  `json:"token_id"`
	IssuerWallet  string `json:"issuer_wallet"`
	StudentWallet string `json:"student_wallet"`
	ContentHash   string `json:"content_hash"`
	IPFSCID       string `json:"ipfs_cid"`

	// Verification results
	HashValid       bool `json:"hash_valid"`        // IPFS content hash matches on-chain hash
	IssuerVerified  bool `json:"issuer_verified"`    // Issuer is in IssuerRegistry
	NotRevoked      bool `json:"not_revoked"`        // Not in RevocationRegistry
	CredentialValid bool `json:"credential_valid"`   // All checks passed
}

// VerifyRequest is used to verify a credential's authenticity by token ID.
type VerifyRequest struct {
	TokenID int64 `json:"token_id" validate:"required"`
}

// VerifyByTokenRequest verifies via a share link token.
type VerifyByTokenRequest struct {
	ShareToken string `json:"share_token" validate:"required"`
}

// VerifyResponse is returned after verifying a credential on-chain.
type VerifyResponse struct {
	Credential   Credential   `json:"credential"`
	Verification Verification `json:"verification"`
	IssuerName   string       `json:"issuer_name,omitempty"`
}
