# Stellar Network Integration Guide
## Student Skill Passport

This document outlines how the **Student Skill Passport** architecture can be adapted, migrated, or related to the **Stellar Network** using **Soroban Smart Contracts** (Rust/WASM) and Stellar Ecosystem Proposals (SEPs).

---

## 1. Why Stellar for Skill Passports?

Stellar is an open-source, decentralized network optimized for tracking assets, identities, and value. For a digital credential wallet like the Student Skill Passport, Stellar offers key advantages:

* **Predictable, Nano-Fees**: Transaction costs on Stellar are a fraction of a cent (typically 0.00001 XLM), making bulk issuance by universities highly economical compared to EVM chains.
* **Fast Finality**: Stellar ledger consensus closes in **3 to 5 seconds**, offering real-time credentials.
* **Native Primitives & SEPs**: Standardized protocols like **SEP-10** (Web Authentication) and **SEP-12** (Identity/KYC) simplify onboarding.
* **Soroban Smart Contracts**: Stellar's Rust-based WASM runtime provides a secure, modern execution environment for Soulbound Tokens (SBTs) with state-of-the-art sandboxing.

---

## 2. Platform Comparison: Polygon vs. Stellar

| Component | Current EVM (Polygon) | Proposed Stellar (Soroban) |
|---|---|---|
| **Smart Contract Language** | Solidity (0.8.24) | Rust (compiling to WASM) |
| **Token Standard** | EIP-721 / EIP-5192 (Soulbound) | Soroban Token Interface (Non-transferable) |
| **User Wallets** | MetaMask / WalletConnect | Freighter / Albedo / RWallet |
| **Auth Protocol** | EIP-191 Signatures | **SEP-10** Web Authentication |
| **API Client** | `go-ethereum` / `ethclient` | `github.com/stellar/go` (Stellar SDK) |
| **Testnet** | Amoy | Stellar Testnet |

---

## 3. Soroban Soulbound Token (SBT) Contract

Below is a reference Rust implementation for a **Soroban Soulbound Token** representing verifiable student credentials. By omitting the `transfer` and `approve` methods from the standard token interface, tokens are locked to the recipient's public key (holder account).

```rust
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Credential(u128),
}

#[contracttype]
#[derive(Clone)]
pub struct Credential {
    pub recipient: Address,
    pub category: String,
    pub title: String,
    pub ipfs_cid: String,
    pub issued_at: u64,
}

#[contract]
pub struct SkillPassportContract;

#[contractimpl]
impl SkillPassportContract {
    // Initialize the contract with an administrator address (e.g. University/Org Registry)
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    // Mint a new Soulbound Credential. Only the Admin can call this.
    pub fn issue_credential(
        env: Env,
        recipient: Address,
        category: String,
        title: String,
        ipfs_cid: String,
        token_id: u128,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let credential = Credential {
            recipient: recipient.clone(),
            category,
            title,
            ipfs_cid,
            issued_at: env.ledger().timestamp(),
        };

        let key = DataKey::Credential(token_id);
        if env.storage().persistent().has(&key) {
            panic!("credential token_id already exists");
        }

        env.storage().persistent().set(&key, &credential);

        // Emit mint event
        env.events().publish(
            (Symbol::new(&env, "credential_issued"), recipient, token_id),
            env.ledger().timestamp(),
        );
    }

    // Retrieve credential details
    pub fn get_credential(env: Env, token_id: u128) -> Credential {
        let key = DataKey::Credential(token_id);
        env.storage()
            .persistent()
            .get(&key)
            .expect("credential not found")
    }
}
```

---

## 4. Go Backend Integration (using Stellar SDK)

In the Go backend, you can replace the Ethereum client with the official **Stellar Go SDK**. Below is a sample snippet showing how the backend can submit a transaction to issue a credential or query account records on Stellar:

```go
package stellar

import (
	"context"
	"fmt"

	"github.com/stellar/go/clients/horizonclient"
	"github.com/stellar/go/keypair"
	"github.com/stellar/go/network"
	"github.com/stellar/go/txnbuild"
)

type StellarClient struct {
	client     *horizonclient.Client
	issuerSeed string
}

func NewStellarClient(seed string) *StellarClient {
	return &StellarClient{
		client:     horizonclient.DefaultTestNetClient,
		issuerSeed: seed,
	}
}

// CheckAccountExists verifies if a student's public address is active on Horizon.
func (s *StellarClient) CheckAccountExists(publicKey string) (bool, error) {
	request := horizonclient.AccountRequest{AccountID: publicKey}
	_, err := s.client.AccountDetail(request)
	if err != nil {
		return false, fmt.Errorf("failed to fetch account details: %w", err)
	}
	return true, nil
}

// SubmitAnchorMemo demonstrates sending a transaction anchor with an IPFS CID
// as a transaction memo.
func (s *StellarClient) AnchorCredential(studentPub string, ipfsCID string) (string, error) {
	// Load issuer keypair
	kp, err := keypair.ParseFull(s.issuerSeed)
	if err != nil {
		return "", err
	}

	// Fetch sequence number
	accountRequest := horizonclient.AccountRequest{AccountID: kp.Address()}
	issuerAccount, err := s.client.AccountDetail(accountRequest)
	if err != nil {
		return "", err
	}

	// Build Payment Transaction with Memo containing IPFS hash
	tx, err := txnbuild.NewTransaction(
		txnbuild.TransactionParams{
			SourceAccount:        &issuerAccount,
			IncrementSequenceNum: true,
			Operations: []txnbuild.Operation{
				&txnbuild.Payment{
					Destination: studentPub,
					Amount:      "0.00001", // Send minimum dust
					Asset:       txnbuild.NativeAsset{},
				},
			},
			BaseFee:    txnbuild.MinBaseFee,
			Memo:       txnbuild.MemoText(ipfsCID[:28]), // Memo limit is 28 bytes
			Timebounds: txnbuild.NewInfiniteTimeout(),
		},
	)
	if err != nil {
		return "", err
	}

	// Sign transaction
	signedTx, err := tx.Sign(network.TestNetworkPassphrase, kp)
	if err != nil {
		return "", err
	}

	txeB64, err := signedTx.Base64()
	if err != nil {
		return "", err
	}

	// Submit transaction
	resp, err := s.client.SubmitTransactionXDR(txeB64)
	if err != nil {
		return "", err
	}

	return resp.Hash, nil
}
```

---

## 5. Web Frontend Integration (Freighter Wallet)

On the React frontend, instead of `wagmi` and MetaMask, Freighter is used to request user account addresses and sign transactions:

```javascript
import { requestAccess, signTransaction } from "@stellar/freighter-api";

async function connectStellarWallet() {
  try {
    // Request access to the user's Freighter account
    const publicKey = await requestAccess();
    console.log("Connected Stellar Account:", publicKey);
    return publicKey;
  } catch (error) {
    console.error("User rejected Stellar Freighter connection:", error);
  }
}
```
