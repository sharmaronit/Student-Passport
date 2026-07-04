-- Rollback: Drop credentials tables and related objects
DROP TRIGGER IF EXISTS update_credentials_updated_at ON credentials;
DROP TABLE IF EXISTS credential_share_links;
DROP TABLE IF EXISTS credentials;
DROP TYPE IF EXISTS credential_status;
DROP TYPE IF EXISTS credential_type;
