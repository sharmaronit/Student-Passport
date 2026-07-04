package crypto

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sort"
)

// HashCredentialJSON takes a credential's core data and produces a
// deterministic SHA-256 hex digest. This hash is stored both on-chain
// (in the SBT) and compared with IPFS content during verification.
//
// The JSON is canonicalized (sorted keys) to ensure the same data
// always produces the same hash regardless of field ordering.
func HashCredentialJSON(data interface{}) (string, error) {
	// Marshal to JSON
	jsonBytes, err := json.Marshal(data)
	if err != nil {
		return "", fmt.Errorf("failed to marshal credential data: %w", err)
	}

	// Canonicalize: unmarshal into map, sort keys, re-marshal
	var raw map[string]interface{}
	if err := json.Unmarshal(jsonBytes, &raw); err != nil {
		return "", fmt.Errorf("failed to unmarshal for canonicalization: %w", err)
	}

	canonical, err := canonicalJSON(raw)
	if err != nil {
		return "", fmt.Errorf("failed to produce canonical JSON: %w", err)
	}

	// SHA-256 hash
	hash := sha256.Sum256(canonical)
	return hex.EncodeToString(hash[:]), nil
}

// HashBytes produces a SHA-256 hex digest of raw bytes.
func HashBytes(data []byte) string {
	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:])
}

// canonicalJSON produces a deterministic JSON encoding with sorted keys.
func canonicalJSON(data interface{}) ([]byte, error) {
	switch v := data.(type) {
	case map[string]interface{}:
		// Sort keys
		keys := make([]string, 0, len(v))
		for k := range v {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		// Build ordered JSON manually
		result := []byte("{")
		for i, k := range keys {
			if i > 0 {
				result = append(result, ',')
			}
			keyJSON, _ := json.Marshal(k)
			result = append(result, keyJSON...)
			result = append(result, ':')

			valJSON, err := canonicalJSON(v[k])
			if err != nil {
				return nil, err
			}
			result = append(result, valJSON...)
		}
		result = append(result, '}')
		return result, nil

	case []interface{}:
		result := []byte("[")
		for i, item := range v {
			if i > 0 {
				result = append(result, ',')
			}
			itemJSON, err := canonicalJSON(item)
			if err != nil {
				return nil, err
			}
			result = append(result, itemJSON...)
		}
		result = append(result, ']')
		return result, nil

	default:
		return json.Marshal(v)
	}
}
