package blockchain

import (
	"context"
	"crypto/ecdsa"
	"errors"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/rs/zerolog"
	"github.com/student-skill-passport/backend/internal/domain"
)

// BlockchainClient implements service.BlockchainService using go-ethereum.
type BlockchainClient struct {
	logger                  zerolog.Logger
	client                  *ethclient.Client
	privateKey              *ecdsa.PrivateKey
	authAddress             common.Address
	chainID                 *big.Int
	issuerRegistryAddr      common.Address
	skillCredentialAddr     common.Address
	revocationRegistryAddr  common.Address
	issuerRegistryContract  *bind.BoundContract
	skillCredentialContract *bind.BoundContract
	revocationContract      *bind.BoundContract
	isMockMode              bool
}

// NewBlockchainClient instantiates a new blockchain client.
func NewBlockchainClient(
	rpcURL string,
	privKeyHex string,
	issuerRegistry string,
	skillCredential string,
	revocationRegistry string,
	logger zerolog.Logger,
) (*BlockchainClient, error) {
	if rpcURL == "" || privKeyHex == "" {
		logger.Warn().Msg("Blockchain client: Missing RPC URL or Private Key. Running in simulation mode.")
		return &BlockchainClient{
			logger:     logger,
			isMockMode: true,
		}, nil
	}

	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		logger.Warn().Err(err).Msg("Failed to connect to RPC URL. Falling back to simulation mode.")
		return &BlockchainClient{
			logger:     logger,
			isMockMode: true,
		}, nil
	}

	// Load Private Key
	cleanKey := strings.TrimPrefix(privKeyHex, "0x")
	privateKey, err := crypto.HexToECDSA(cleanKey)
	if err != nil {
		logger.Warn().Err(err).Msg("Failed to parse private key. Falling back to simulation mode.")
		return &BlockchainClient{
			logger:     logger,
			isMockMode: true,
		}, nil
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, errors.New("cannot assert type: publicKey is not of type *ecdsa.PublicKey")
	}
	authAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	chainID, err := client.ChainID(ctx)
	if err != nil {
		logger.Warn().Err(err).Msg("Failed to fetch ChainID. Falling back to simulation mode.")
		return &BlockchainClient{
			logger:     logger,
			isMockMode: true,
		}, nil
	}

	// Parse ABIs
	parsedIssuerABI, err := abi.JSON(strings.NewReader(IssuerRegistryABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse IssuerRegistry ABI: %w", err)
	}
	parsedSkillABI, err := abi.JSON(strings.NewReader(SkillCredentialABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse SkillCredential ABI: %w", err)
	}
	parsedRevocationABI, err := abi.JSON(strings.NewReader(RevocationRegistryABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse RevocationRegistry ABI: %w", err)
	}

	// Check if contract addresses are valid hex
	if !common.IsHexAddress(issuerRegistry) || !common.IsHexAddress(skillCredential) || !common.IsHexAddress(revocationRegistry) {
		logger.Warn().Msg("Invalid contract addresses in configuration. Running in simulation mode.")
		return &BlockchainClient{
			logger:     logger,
			isMockMode: true,
		}, nil
	}

	issuerAddr := common.HexToAddress(issuerRegistry)
	skillAddr := common.HexToAddress(skillCredential)
	revocationAddr := common.HexToAddress(revocationRegistry)

	// Create Bound Contracts
	issuerContract := bind.NewBoundContract(issuerAddr, parsedIssuerABI, client, client, client)
	skillContract := bind.NewBoundContract(skillAddr, parsedSkillABI, client, client, client)
	revocationContract := bind.NewBoundContract(revocationAddr, parsedRevocationABI, client, client, client)

	logger.Info().
		Str("issuer_registry", issuerAddr.Hex()).
		Str("skill_credential", skillAddr.Hex()).
		Str("revocation_registry", revocationAddr.Hex()).
		Str("signer_address", authAddress.Hex()).
		Msg("Successfully connected to Polygon EVM client")

	return &BlockchainClient{
		logger:                  logger,
		client:                  client,
		privateKey:              privateKey,
		authAddress:             authAddress,
		chainID:                 chainID,
		issuerRegistryAddr:      issuerAddr,
		skillCredentialAddr:     skillAddr,
		revocationRegistryAddr:  revocationAddr,
		issuerRegistryContract:  issuerContract,
		skillCredentialContract: skillContract,
		revocationContract:      revocationContract,
		isMockMode:              false,
	}, nil
}

// IsAuthorizedIssuer checks if a wallet is registered in the IssuerRegistry.
func (c *BlockchainClient) IsAuthorizedIssuer(walletAddress string) (bool, error) {
	if c.isMockMode {
		// Mock logic: return true for any address that is a valid address format
		return strings.HasPrefix(walletAddress, "0x") && len(walletAddress) == 42, nil
	}

	if !common.IsHexAddress(walletAddress) {
		return false, fmt.Errorf("invalid wallet address: %s", walletAddress)
	}

	var out []interface{}
	var result bool
	out = append(out, &result)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := &bind.CallOpts{
		Context: ctx,
	}

	addr := common.HexToAddress(walletAddress)
	err := c.issuerRegistryContract.Call(opts, &out, "isAuthorizedIssuer", addr)
	if err != nil {
		return false, fmt.Errorf("failed to check if authorized issuer: %w", err)
	}

	return result, nil
}

// IsRevoked checks if a credential has been revoked on-chain.
func (c *BlockchainClient) IsRevoked(tokenID int64) (bool, error) {
	if c.isMockMode {
		return false, nil
	}

	var out []interface{}
	var result bool
	out = append(out, &result)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := &bind.CallOpts{
		Context: ctx,
	}

	bigTokenID := big.NewInt(tokenID)
	err := c.skillCredentialContract.Call(opts, &out, "isRevoked", bigTokenID)
	if err != nil {
		return false, fmt.Errorf("failed to check revocation status: %w", err)
	}

	return result, nil
}

// GetCredentialOnChain reads credential data from the blockchain.
func (c *BlockchainClient) GetCredentialOnChain(tokenID int64) (*domain.Verification, error) {
	if c.isMockMode {
		return &domain.Verification{
			TokenID:         tokenID,
			IssuerWallet:    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
			StudentWallet:   "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
			ContentHash:     "35f5e9d8c0b7a6e5f4d3c2b1a0e9f8d7c6b5a4e3f2d1c0b9a8e7f6d5c4b3a2e1f",
			IPFSCID:         "QmPvc8L71nSwT6r6mE4RkQz5WnQyA3LzNn7kM3yB1o2p3q",
			HashValid:       true,
			IssuerVerified:  true,
			NotRevoked:      true,
			CredentialValid: true,
		}, nil
	}

	var out []interface{}
	var data struct {
		Issuer         common.Address
		Student        common.Address
		CredentialType string
		ContentHash    string
		IpfsCID        string
		IssuedAt       *big.Int
		Revoked        bool
	}
	out = append(out, &data)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := &bind.CallOpts{
		Context: ctx,
	}

	bigTokenID := big.NewInt(tokenID)
	err := c.skillCredentialContract.Call(opts, &out, "getCredential", bigTokenID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch credential from contract: %w", err)
	}

	// Verify Issuer registry status
	issuerVerified, err := c.IsAuthorizedIssuer(data.Issuer.Hex())
	if err != nil {
		c.logger.Error().Err(err).Msg("failed to verify issuer status during verification")
		issuerVerified = false
	}

	return &domain.Verification{
		TokenID:         tokenID,
		IssuerWallet:    data.Issuer.Hex(),
		StudentWallet:   data.Student.Hex(),
		ContentHash:     data.ContentHash,
		IPFSCID:         data.IpfsCID,
		HashValid:       true, // Checked by service layer against DB
		IssuerVerified:  issuerVerified,
		NotRevoked:      !data.Revoked,
		CredentialValid: issuerVerified && !data.Revoked,
	}, nil
}

// RevokeOnChain calls the SkillCredential contract to revoke a credential.
func (c *BlockchainClient) RevokeOnChain(tokenID int64) (txHash string, err error) {
	if c.isMockMode {
		return "0xmockrevocationtxhash1234567890abcdef1234567890abcdef1234567890ab", nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	auth, err := bind.NewKeyedTransactorWithChainID(c.privateKey, c.chainID)
	if err != nil {
		return "", err
	}

	nonce, err := c.client.PendingNonceAt(ctx, c.authAddress)
	if err != nil {
		return "", err
	}
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)

	gasPrice, err := c.client.SuggestGasPrice(ctx)
	if err != nil {
		return "", err
	}
	auth.GasPrice = gasPrice
	auth.GasLimit = 0
	auth.Context = ctx

	bigTokenID := big.NewInt(tokenID)
	tx, err := c.skillCredentialContract.Transact(auth, "revokeCredential", bigTokenID)
	if err != nil {
		return "", fmt.Errorf("failed to send revocation transaction: %w", err)
	}

	c.logger.Info().Str("tx_hash", tx.Hash().Hex()).Msg("Sent revoke transaction, waiting for block confirmation")

	// Wait for receipt
	receipt, err := bind.WaitMined(ctx, c.client, tx)
	if err != nil {
		return tx.Hash().Hex(), fmt.Errorf("failed to wait for revocation transaction receipt: %w", err)
	}

	if receipt.Status == types.ReceiptStatusFailed {
		return tx.Hash().Hex(), errors.New("revocation transaction failed on-chain")
	}

	return tx.Hash().Hex(), nil
}

// MintSBT mints a Soulbound Token on the SkillCredential contract.
func (c *BlockchainClient) MintSBT(
	studentWallet string,
	credentialType string,
	contentHash string,
	ipfsCID string,
) (tokenID int64, txHash string, err error) {
	if c.isMockMode {
		mockTokenID := time.Now().Unix() % 100000
		mockTx := "0xmockminttxhash" + fmt.Sprintf("%d", mockTokenID) + "abcdefabcdefabcdefabcdefabcdef"
		return mockTokenID, mockTx, nil
	}

	if !common.IsHexAddress(studentWallet) {
		return 0, "", fmt.Errorf("invalid student wallet address: %s", studentWallet)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	auth, err := bind.NewKeyedTransactorWithChainID(c.privateKey, c.chainID)
	if err != nil {
		return 0, "", err
	}

	nonce, err := c.client.PendingNonceAt(ctx, c.authAddress)
	if err != nil {
		return 0, "", err
	}
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)

	gasPrice, err := c.client.SuggestGasPrice(ctx)
	if err != nil {
		return 0, "", err
	}
	auth.GasPrice = gasPrice
	auth.GasLimit = 0
	auth.Context = ctx

	studentAddr := common.HexToAddress(studentWallet)
	metadataURI := fmt.Sprintf("ipfs://%s", ipfsCID)

	tx, err := c.skillCredentialContract.Transact(auth, "issueCredential", studentAddr, credentialType, contentHash, ipfsCID, metadataURI)
	if err != nil {
		return 0, "", fmt.Errorf("failed to send mint transaction: %w", err)
	}

	txHashHex := tx.Hash().Hex()
	c.logger.Info().Str("tx_hash", txHashHex).Msg("Sent mint transaction, waiting for block confirmation")

	// Wait for receipt
	receipt, err := bind.WaitMined(ctx, c.client, tx)
	if err != nil {
		return 0, txHashHex, fmt.Errorf("failed to wait for transaction receipt: %w", err)
	}

	if receipt.Status == types.ReceiptStatusFailed {
		return 0, txHashHex, errors.New("transaction failed on-chain")
	}

	// Parse logs to extract TokenID
	credentialIssuedEventSig := crypto.Keccak256Hash([]byte("CredentialIssued(uint256,address,address,string,string,string)"))

	for _, log := range receipt.Logs {
		if len(log.Topics) > 1 && log.Topics[0] == credentialIssuedEventSig {
			parsedTokenID := new(big.Int).SetBytes(log.Topics[1].Bytes())
			c.logger.Info().Int64("token_id", parsedTokenID.Int64()).Msg("Extracted token ID from transaction logs")
			return parsedTokenID.Int64(), txHashHex, nil
		}
	}

	c.logger.Warn().Msg("transaction succeeded but CredentialIssued event log not found")
	return 0, txHashHex, nil
}
