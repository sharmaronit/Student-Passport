package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/student-skill-passport/backend/internal/domain"
)

// PostgresCredentialRepo implements CredentialRepository using PostgreSQL.
type PostgresCredentialRepo struct {
	db *pgxpool.Pool
}

// NewPostgresCredentialRepo creates a new PostgreSQL-backed credential repository.
func NewPostgresCredentialRepo(db *pgxpool.Pool) *PostgresCredentialRepo {
	return &PostgresCredentialRepo{db: db}
}

func (r *PostgresCredentialRepo) Create(ctx context.Context, cred *domain.Credential) error {
	query := `
		INSERT INTO credentials (
			id, token_id, tx_hash, ipfs_cid, student_id, issuer_id,
			credential_type, title, description, status,
			issued_at, expires_at, metadata, content_hash
		) VALUES (
			$1, $2, $3, $4, $5, $6,
			$7, $8, $9, $10,
			$11, $12, $13, $14
		)`

	_, err := r.db.Exec(ctx, query,
		cred.ID, cred.TokenID, cred.TxHash, cred.IPFSCID, cred.StudentID, cred.IssuerID,
		cred.CredentialType, cred.Title, cred.Description, cred.Status,
		cred.IssuedAt, cred.ExpiresAt, cred.Metadata, cred.ContentHash,
	)
	if err != nil {
		return fmt.Errorf("failed to create credential: %w", err)
	}
	return nil
}

func (r *PostgresCredentialRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Credential, error) {
	query := `
		SELECT id, token_id, tx_hash, ipfs_cid, student_id, issuer_id,
			credential_type, title, description, status,
			issued_at, expires_at, metadata, content_hash,
			created_at, updated_at
		FROM credentials WHERE id = $1`

	return r.scanCredential(ctx, query, id)
}

func (r *PostgresCredentialRepo) GetByTokenID(ctx context.Context, tokenID int64) (*domain.Credential, error) {
	query := `
		SELECT id, token_id, tx_hash, ipfs_cid, student_id, issuer_id,
			credential_type, title, description, status,
			issued_at, expires_at, metadata, content_hash,
			created_at, updated_at
		FROM credentials WHERE token_id = $1`

	return r.scanCredential(ctx, query, tokenID)
}

func (r *PostgresCredentialRepo) Update(ctx context.Context, cred *domain.Credential) error {
	query := `
		UPDATE credentials SET
			token_id = $2, tx_hash = $3, ipfs_cid = $4,
			title = $5, description = $6, status = $7,
			issued_at = $8, expires_at = $9, metadata = $10, content_hash = $11
		WHERE id = $1`

	_, err := r.db.Exec(ctx, query,
		cred.ID, cred.TokenID, cred.TxHash, cred.IPFSCID,
		cred.Title, cred.Description, cred.Status,
		cred.IssuedAt, cred.ExpiresAt, cred.Metadata, cred.ContentHash,
	)
	if err != nil {
		return fmt.Errorf("failed to update credential: %w", err)
	}
	return nil
}

func (r *PostgresCredentialRepo) UpdateOnChainData(ctx context.Context, id uuid.UUID, tokenID int64, txHash, ipfsCID, contentHash string) error {
	query := `
		UPDATE credentials SET
			token_id = $2, tx_hash = $3, ipfs_cid = $4,
			content_hash = $5, status = 'issued', issued_at = NOW()
		WHERE id = $1`

	_, err := r.db.Exec(ctx, query, id, tokenID, txHash, ipfsCID, contentHash)
	if err != nil {
		return fmt.Errorf("failed to update on-chain data: %w", err)
	}
	return nil
}

func (r *PostgresCredentialRepo) List(ctx context.Context, filter domain.CredentialFilter) ([]*domain.Credential, error) {
	query := `
		SELECT id, token_id, tx_hash, ipfs_cid, student_id, issuer_id,
			credential_type, title, description, status,
			issued_at, expires_at, metadata, content_hash,
			created_at, updated_at
		FROM credentials`

	var conditions []string
	var args []interface{}
	argIdx := 1

	if filter.StudentID != nil {
		conditions = append(conditions, fmt.Sprintf("student_id = $%d", argIdx))
		args = append(args, *filter.StudentID)
		argIdx++
	}
	if filter.IssuerID != nil {
		conditions = append(conditions, fmt.Sprintf("issuer_id = $%d", argIdx))
		args = append(args, *filter.IssuerID)
		argIdx++
	}
	if filter.CredentialType != nil {
		conditions = append(conditions, fmt.Sprintf("credential_type = $%d", argIdx))
		args = append(args, *filter.CredentialType)
		argIdx++
	}
	if filter.Status != nil {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, *filter.Status)
		argIdx++
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	query += " ORDER BY created_at DESC"

	limit := filter.Limit
	if limit <= 0 {
		limit = 20
	}
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
	args = append(args, limit, filter.Offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list credentials: %w", err)
	}
	defer rows.Close()

	var credentials []*domain.Credential
	for rows.Next() {
		cred := &domain.Credential{}
		if err := rows.Scan(
			&cred.ID, &cred.TokenID, &cred.TxHash, &cred.IPFSCID,
			&cred.StudentID, &cred.IssuerID,
			&cred.CredentialType, &cred.Title, &cred.Description, &cred.Status,
			&cred.IssuedAt, &cred.ExpiresAt, &cred.Metadata, &cred.ContentHash,
			&cred.CreatedAt, &cred.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan credential: %w", err)
		}
		credentials = append(credentials, cred)
	}
	return credentials, nil
}

func (r *PostgresCredentialRepo) UpdateStatus(ctx context.Context, id uuid.UUID, status domain.CredentialStatus) error {
	query := `UPDATE credentials SET status = $2 WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id, status)
	if err != nil {
		return fmt.Errorf("failed to update credential status: %w", err)
	}
	return nil
}

func (r *PostgresCredentialRepo) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM credentials WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete credential: %w", err)
	}
	return nil
}

// scanCredential is a helper to scan a single credential row.
func (r *PostgresCredentialRepo) scanCredential(ctx context.Context, query string, arg interface{}) (*domain.Credential, error) {
	cred := &domain.Credential{}
	err := r.db.QueryRow(ctx, query, arg).Scan(
		&cred.ID, &cred.TokenID, &cred.TxHash, &cred.IPFSCID,
		&cred.StudentID, &cred.IssuerID,
		&cred.CredentialType, &cred.Title, &cred.Description, &cred.Status,
		&cred.IssuedAt, &cred.ExpiresAt, &cred.Metadata, &cred.ContentHash,
		&cred.CreatedAt, &cred.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get credential: %w", err)
	}
	return cred, nil
}
