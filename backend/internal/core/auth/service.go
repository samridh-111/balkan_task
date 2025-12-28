package auth

import (
	"time"

	"github.com/google/uuid"
	"github.com/samridh-111/balkan_task/internal/core/users"
	"github.com/samridh-111/balkan_task/internal/pkg/errors"
)

type AuthService struct {
	userRepo *users.Repository
	jwt      *Service
}

func NewAuthService(userRepo *users.Repository, jwtService *Service) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		jwt:      jwtService,
	}
}

func (s *AuthService) Register(req *users.CreateUserRequest) (*users.AuthResponse, error) {
	existing, _ := s.userRepo.GetByEmail(req.Email)
	if existing != nil {
		return nil, errors.New(409, "user already exists")
	}

	passwordHash, err := HashPassword(req.Password)
	if err != nil {
		return nil, errors.Wrap(500, "failed to hash password", err)
	}

	user := &users.User{
		ID:           uuid.New(),
		Email:        req.Email,
		PasswordHash: passwordHash,
		Role:         "admin",
		StorageQuota: 1073741824,
		StorageUsed:  0,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	token, err := s.jwt.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, errors.Wrap(500, "failed to generate token", err)
	}

	return &users.AuthResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *AuthService) Login(req *users.LoginRequest) (*users.AuthResponse, error) {
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, errors.ErrUnauthorized
	}

	if !CheckPasswordHash(req.Password, user.PasswordHash) {
		return nil, errors.ErrUnauthorized
	}

	token, err := s.jwt.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, errors.Wrap(500, "failed to generate token", err)
	}

	return &users.AuthResponse{
		Token: token,
		User:  *user,
	}, nil
}

