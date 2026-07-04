package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/student-skill-passport/backend/internal/domain"
	"github.com/student-skill-passport/backend/internal/service"
)

// CredentialHandler handles HTTP requests for credential operations.
type CredentialHandler struct {
	svc *service.CredentialService
}

// NewCredentialHandler creates a new credential handler.
func NewCredentialHandler(svc *service.CredentialService) *CredentialHandler {
	return &CredentialHandler{svc: svc}
}

// RegisterRoutes registers credential-related routes on the given router.
func (h *CredentialHandler) RegisterRoutes(r chi.Router, authMw func(http.Handler) http.Handler) {
	// Public routes
	r.Get("/credentials/verify/{tokenId}", h.VerifyCredential)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(authMw)

		// Any authenticated user
		r.Get("/credentials/{id}", h.GetCredential)
		r.Get("/credentials", h.ListCredentials)

		// Student routes
		r.Get("/wallet/credentials", h.GetMyCredentials)
		r.Post("/credentials/pull", h.PullCredential)

		// Issuer-only routes
		r.Group(func(r chi.Router) {
			r.Use(RequireRole(domain.RoleIssuer))
			r.Post("/credentials/issue", h.IssueCredential)
			r.Post("/credentials/{id}/revoke", h.RevokeCredential)
		})
	})
}

// IssueCredential handles credential issuance by an authorized issuer.
func (h *CredentialHandler) IssueCredential(w http.ResponseWriter, r *http.Request) {
	issuerID, err := getUserIDFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	var req domain.IssueCredentialRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	cred, err := h.svc.IssueCredential(r.Context(), issuerID, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, cred)
}

// GetCredential retrieves a single credential by ID.
func (h *CredentialHandler) GetCredential(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid credential ID")
		return
	}

	cred, err := h.svc.GetCredential(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if cred == nil {
		writeError(w, http.StatusNotFound, "credential not found")
		return
	}

	writeJSON(w, http.StatusOK, cred)
}

// GetMyCredentials returns all credentials for the authenticated student.
func (h *CredentialHandler) GetMyCredentials(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	credentials, err := h.svc.ListStudentCredentials(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"credentials": credentials,
		"count":       len(credentials),
	})
}

// ListCredentials returns a filtered list of credentials.
func (h *CredentialHandler) ListCredentials(w http.ResponseWriter, r *http.Request) {
	filter := domain.CredentialFilter{}

	if studentID := r.URL.Query().Get("student_id"); studentID != "" {
		id, err := uuid.Parse(studentID)
		if err == nil {
			filter.StudentID = &id
		}
	}
	if issuerID := r.URL.Query().Get("issuer_id"); issuerID != "" {
		id, err := uuid.Parse(issuerID)
		if err == nil {
			filter.IssuerID = &id
		}
	}
	if credType := r.URL.Query().Get("type"); credType != "" {
		ct := domain.CredentialType(credType)
		filter.CredentialType = &ct
	}
	if status := r.URL.Query().Get("status"); status != "" {
		st := domain.CredentialStatus(status)
		filter.Status = &st
	}

	filter.Limit, _ = strconv.Atoi(r.URL.Query().Get("limit"))
	filter.Offset, _ = strconv.Atoi(r.URL.Query().Get("offset"))
	if filter.Limit <= 0 {
		filter.Limit = 20
	}

	credentials, err := h.svc.ListCredentials(r.Context(), filter)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"credentials": credentials,
		"count":       len(credentials),
	})
}

// RevokeCredential revokes a credential (issuer-only).
func (h *CredentialHandler) RevokeCredential(w http.ResponseWriter, r *http.Request) {
	issuerID, err := getUserIDFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	credIDStr := chi.URLParam(r, "id")
	credID, err := uuid.Parse(credIDStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid credential ID")
		return
	}

	if err := h.svc.RevokeCredential(r.Context(), issuerID, credID); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "credential revoked successfully",
	})
}

// VerifyCredential is a public endpoint to verify a credential by on-chain token ID.
// In Phase 3+, this will query the blockchain for full verification.
func (h *CredentialHandler) VerifyCredential(w http.ResponseWriter, r *http.Request) {
	tokenIDStr := chi.URLParam(r, "tokenId")
	tokenID, err := strconv.ParseInt(tokenIDStr, 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid token ID")
		return
	}

	cred, err := h.svc.GetCredentialByTokenID(r.Context(), tokenID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if cred == nil {
		writeError(w, http.StatusNotFound, "credential not found")
		return
	}

	// TODO Phase 3+: Query blockchain for full on-chain verification
	// verification := blockchainService.GetCredentialOnChain(tokenID)

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"credential": cred,
		"verified":   cred.Status == domain.StatusIssued,
		"message":    "off-chain verification only — on-chain verification coming in Phase 3",
	})
}

// PullCredential handles self-pull based credential issuance for students.
func (h *CredentialHandler) PullCredential(w http.ResponseWriter, r *http.Request) {
	studentID, err := getUserIDFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	var req domain.PullCredentialRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	cred, err := h.svc.PullCredential(r.Context(), studentID, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, cred)
}
