package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/student-skill-passport/backend/internal/blockchain"
	"github.com/student-skill-passport/backend/internal/config"
	"github.com/student-skill-passport/backend/internal/handler"
	"github.com/student-skill-passport/backend/internal/repository"
	"github.com/student-skill-passport/backend/internal/service"
)

func main() {
	// ── Logger Setup ──────────────────────────────────────────────
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	// ── Load Config ───────────────────────────────────────────────
	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load config")
	}

	log.Info().
		Str("env", cfg.APIEnv).
		Str("port", cfg.APIPort).
		Bool("blockchain_configured", cfg.HasBlockchainConfig()).
		Bool("ipfs_configured", cfg.HasIPFSConfig()).
		Msg("configuration loaded")

	// ── Database Connection ───────────────────────────────────────
	ctx := context.Background()

	dbPool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to database")
	}
	defer dbPool.Close()

	if err := dbPool.Ping(ctx); err != nil {
		log.Fatal().Err(err).Msg("failed to ping database")
	}
	log.Info().Msg("database connected")

	// ── Repositories ──────────────────────────────────────────────
	userRepo := repository.NewPostgresUserRepo(dbPool)
	credRepo := repository.NewPostgresCredentialRepo(dbPool)

	// ── Blockchain Client ──────────────────────────────────────────
	bcClient, err := blockchain.NewBlockchainClient(
		cfg.PolygonRPCURL,
		cfg.BackendWalletPK,
		cfg.IssuerRegistryAddr,
		cfg.SkillCredentialAddr,
		cfg.RevocationRegistryAddr,
		log.Logger,
	)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to initialize blockchain client")
	}

	// ── Services ──────────────────────────────────────────────────
	userSvc := service.NewUserService(userRepo, cfg.JWTSecret)
	credSvc := service.NewCredentialService(credRepo, userRepo, bcClient)

	// ── HTTP Router ───────────────────────────────────────────────
	r := chi.NewRouter()

	// Global middleware
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(handler.RequestLogger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.Timeout(30 * time.Second))

	// CORS — allow React frontend
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Requested-With"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// ── Routes ────────────────────────────────────────────────────
	// Health check
	r.Get("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{
			"success": true,
			"data": {
				"status": "healthy",
				"service": "student-skill-passport",
				"version": "0.1.0",
				"blockchain": {
					"network": "polygon-amoy",
					"chain_id": %d,
					"contracts_configured": %t
				}
			}
		}`, cfg.PolygonChainID, cfg.HasBlockchainConfig())
	})

	// Auth middleware factory
	authMw := handler.AuthMiddleware(cfg.JWTSecret)

	// Register route handlers under /api/v1
	r.Route("/api/v1", func(r chi.Router) {
		userHandler := handler.NewUserHandler(userSvc)
		userHandler.RegisterRoutes(r, authMw)

		credHandler := handler.NewCredentialHandler(credSvc)
		credHandler.RegisterRoutes(r, authMw)
	})

	// ── Start Server ──────────────────────────────────────────────
	addr := fmt.Sprintf(":%s", cfg.APIPort)
	srv := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		<-sigCh

		log.Info().Msg("shutting down server...")
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := srv.Shutdown(shutdownCtx); err != nil {
			log.Fatal().Err(err).Msg("server shutdown failed")
		}
	}()

	log.Info().
		Str("addr", addr).
		Msg("🚀 Student Skill Passport API starting")

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal().Err(err).Msg("server failed to start")
	}

	log.Info().Msg("server stopped")
}
