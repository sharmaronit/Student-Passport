package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/student-skill-passport/backend/internal/domain"
)

// PostgresUserRepo implements UserRepository using PostgreSQL.
type PostgresUserRepo struct {
	db *pgxpool.Pool
}

// NewPostgresUserRepo creates a new PostgreSQL-backed user repository.
func NewPostgresUserRepo(db *pgxpool.Pool) *PostgresUserRepo {
	return &PostgresUserRepo{db: db}
}

func (r *PostgresUserRepo) Create(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO profiles (
			id, wallet_address, role, full_name, email, avatar_url, bio,
			auth_nonce, university, graduation_year, github_url, linkedin_url, portfolio_url,
			org_name, org_type, org_website, org_verified
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7,
			$8, $9, $10, $11, $12, $13,
			$14, $15, $16, $17
		)`

	_, err := r.db.Exec(ctx, query,
		user.ID, user.WalletAddress, user.Role, user.FullName, user.Email,
		user.AvatarURL, user.Bio, user.AuthNonce,
		user.University, user.GraduationYear, user.GithubURL, user.LinkedinURL, user.PortfolioURL,
		user.OrgName, user.OrgType, user.OrgWebsite, user.OrgVerified,
	)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

func (r *PostgresUserRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	query := `
		SELECT id, wallet_address, role, full_name, email, avatar_url, bio,
			auth_nonce, university, graduation_year, github_url, linkedin_url, portfolio_url,
			org_name, org_type, org_website, org_verified, created_at, updated_at
		FROM profiles WHERE id = $1`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.WalletAddress, &user.Role, &user.FullName, &user.Email,
		&user.AvatarURL, &user.Bio, &user.AuthNonce,
		&user.University, &user.GraduationYear, &user.GithubURL, &user.LinkedinURL, &user.PortfolioURL,
		&user.OrgName, &user.OrgType, &user.OrgWebsite, &user.OrgVerified,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}
	return user, nil
}

func (r *PostgresUserRepo) GetByWallet(ctx context.Context, walletAddress string) (*domain.User, error) {
	query := `
		SELECT id, wallet_address, role, full_name, email, avatar_url, bio,
			auth_nonce, university, graduation_year, github_url, linkedin_url, portfolio_url,
			org_name, org_type, org_website, org_verified, created_at, updated_at
		FROM profiles WHERE wallet_address = $1`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, walletAddress).Scan(
		&user.ID, &user.WalletAddress, &user.Role, &user.FullName, &user.Email,
		&user.AvatarURL, &user.Bio, &user.AuthNonce,
		&user.University, &user.GraduationYear, &user.GithubURL, &user.LinkedinURL, &user.PortfolioURL,
		&user.OrgName, &user.OrgType, &user.OrgWebsite, &user.OrgVerified,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user by wallet: %w", err)
	}
	return user, nil
}

func (r *PostgresUserRepo) Update(ctx context.Context, user *domain.User) error {
	query := `
		UPDATE profiles SET
			full_name = $2, email = $3, avatar_url = $4, bio = $5,
			university = $6, graduation_year = $7, github_url = $8,
			linkedin_url = $9, portfolio_url = $10,
			org_name = $11, org_type = $12, org_website = $13
		WHERE id = $1`

	_, err := r.db.Exec(ctx, query,
		user.ID, user.FullName, user.Email, user.AvatarURL, user.Bio,
		user.University, user.GraduationYear, user.GithubURL,
		user.LinkedinURL, user.PortfolioURL,
		user.OrgName, user.OrgType, user.OrgWebsite,
	)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	return nil
}

func (r *PostgresUserRepo) UpdateNonce(ctx context.Context, walletAddress string, newNonce string) error {
	query := `UPDATE profiles SET auth_nonce = $2 WHERE wallet_address = $1`
	_, err := r.db.Exec(ctx, query, walletAddress, newNonce)
	if err != nil {
		return fmt.Errorf("failed to update nonce: %w", err)
	}
	return nil
}

func (r *PostgresUserRepo) List(ctx context.Context, role *domain.UserRole, limit, offset int) ([]*domain.User, error) {
	if limit <= 0 {
		limit = 20
	}

	var query string
	var args []interface{}

	if role != nil {
		query = `
			SELECT id, wallet_address, role, full_name, email, avatar_url, bio,
				auth_nonce, university, graduation_year, github_url, linkedin_url, portfolio_url,
				org_name, org_type, org_website, org_verified, created_at, updated_at
			FROM profiles WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`
		args = []interface{}{*role, limit, offset}
	} else {
		query = `
			SELECT id, wallet_address, role, full_name, email, avatar_url, bio,
				auth_nonce, university, graduation_year, github_url, linkedin_url, portfolio_url,
				org_name, org_type, org_website, org_verified, created_at, updated_at
			FROM profiles ORDER BY created_at DESC LIMIT $1 OFFSET $2`
		args = []interface{}{limit, offset}
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}
	defer rows.Close()

	var users []*domain.User
	for rows.Next() {
		user := &domain.User{}
		if err := rows.Scan(
			&user.ID, &user.WalletAddress, &user.Role, &user.FullName, &user.Email,
			&user.AvatarURL, &user.Bio, &user.AuthNonce,
			&user.University, &user.GraduationYear, &user.GithubURL, &user.LinkedinURL, &user.PortfolioURL,
			&user.OrgName, &user.OrgType, &user.OrgWebsite, &user.OrgVerified,
			&user.CreatedAt, &user.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}
	return users, nil
}

func (r *PostgresUserRepo) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM profiles WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	return nil
}
