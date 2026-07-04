package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application.
type Config struct {
	// Server
	APIPort string
	APIEnv  string

	// Database
	DatabaseURL string

	// JWT
	JWTSecret string

	// Blockchain (Polygon)
	PolygonRPCURL       string
	PolygonChainID      int64
	BackendWalletPK     string // Private key for sending TXs

	// Smart Contract Addresses
	IssuerRegistryAddr    string
	SkillCredentialAddr   string
	RevocationRegistryAddr string

	// IPFS (Pinata)
	PinataAPIKey    string
	PinataSecretKey string
	PinataGatewayURL string
}

// Load reads configuration from environment variables.
// It attempts to load a .env file first (for local dev).
func Load() (*Config, error) {
	// Best-effort .env load (ignore error if file doesn't exist)
	_ = godotenv.Load()

	chainID, _ := strconv.ParseInt(getEnv("POLYGON_CHAIN_ID", "80002"), 10, 64)

	cfg := &Config{
		APIPort:     getEnv("API_PORT", "8080"),
		APIEnv:      getEnv("API_ENV", "development"),
		DatabaseURL: getEnv("DATABASE_URL", ""),
		JWTSecret:   getEnv("JWT_SECRET", ""),

		PolygonRPCURL:   getEnv("POLYGON_RPC_URL", "https://rpc-amoy.polygon.technology/"),
		PolygonChainID:  chainID,
		BackendWalletPK: getEnv("BACKEND_WALLET_PRIVATE_KEY", ""),

		IssuerRegistryAddr:     getEnv("ISSUER_REGISTRY_ADDRESS", ""),
		SkillCredentialAddr:    getEnv("SKILL_CREDENTIAL_ADDRESS", ""),
		RevocationRegistryAddr: getEnv("REVOCATION_REGISTRY_ADDRESS", ""),

		PinataAPIKey:     getEnv("PINATA_API_KEY", ""),
		PinataSecretKey:  getEnv("PINATA_SECRET_KEY", ""),
		PinataGatewayURL: getEnv("PINATA_GATEWAY_URL", "https://gateway.pinata.cloud/ipfs"),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	return cfg, nil
}

// IsDevelopment returns true if running in development mode.
func (c *Config) IsDevelopment() bool {
	return c.APIEnv == "development"
}

// HasBlockchainConfig returns true if blockchain contracts are configured.
func (c *Config) HasBlockchainConfig() bool {
	return c.SkillCredentialAddr != "" && c.IssuerRegistryAddr != ""
}

// HasIPFSConfig returns true if Pinata IPFS is configured.
func (c *Config) HasIPFSConfig() bool {
	return c.PinataAPIKey != "" && c.PinataSecretKey != ""
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
