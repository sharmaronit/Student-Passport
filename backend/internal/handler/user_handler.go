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

// UserHandler handles HTTP requests for user operations.
type UserHandler struct {
	svc *service.UserService
}

// NewUserHandler creates a new user handler.
func NewUserHandler(svc *service.UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

// RegisterRoutes registers user-related routes on the given router.
func (h *UserHandler) RegisterRoutes(r chi.Router, authMw func(http.Handler) http.Handler) {
	// Public routes (no auth required)
	r.Post("/auth/nonce", h.GetNonce)
	r.Post("/auth/verify", h.VerifySignature)
	r.Post("/auth/register", h.Register)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(authMw)
		r.Get("/users/me", h.GetMyProfile)
		r.Put("/users/me", h.UpdateMyProfile)
		r.Get("/users/{id}", h.GetProfile)
		r.Get("/users", h.ListUsers)
	})
}

// GetNonce returns the nonce a wallet must sign to authenticate.
func (h *UserHandler) GetNonce(w http.ResponseWriter, r *http.Request) {
	var req domain.NonceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	resp, err := h.svc.GetNonce(r.Context(), req.WalletAddress)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// VerifySignature verifies a wallet's signed nonce and returns a JWT.
func (h *UserHandler) VerifySignature(w http.ResponseWriter, r *http.Request) {
	var req domain.VerifySignatureRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	resp, err := h.svc.VerifyWalletSignature(r.Context(), req)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// Register creates a new user profile.
func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req domain.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user, err := h.svc.Register(r.Context(), req)
	if err != nil {
		writeError(w, http.StatusConflict, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, user)
}

// GetMyProfile returns the authenticated user's profile.
func (h *UserHandler) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	user, err := h.svc.GetProfile(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if user == nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

// UpdateMyProfile updates the authenticated user's profile.
func (h *UserHandler) UpdateMyProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	var req domain.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user, err := h.svc.UpdateProfile(r.Context(), userID, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, user)
}

// GetProfile returns a user's public profile by ID.
func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid user ID")
		return
	}

	user, err := h.svc.GetProfile(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if user == nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

// ListUsers returns a paginated list of users.
func (h *UserHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	var role *domain.UserRole
	if roleStr := r.URL.Query().Get("role"); roleStr != "" {
		r := domain.UserRole(roleStr)
		role = &r
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit <= 0 {
		limit = 20
	}

	users, err := h.svc.ListUsers(r.Context(), role, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"users": users,
		"count": len(users),
	})
}
