package com.sih.backend.auth.service;

import com.sih.backend.auth.entity.Role;
import com.sih.backend.auth.entity.User;
import com.sih.backend.auth.repository.UserRepository;
import com.sih.backend.auth.token.JwtUtil;
import com.sih.backend.common.dto.AuthResponse;
import com.sih.backend.common.dto.LoginRequest;
import com.sih.backend.common.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BadCredentialsException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(request.role() != null ? Role.valueOf(request.role()) : Role.CITIZEN);

        User saved = userRepository.save(user);
        String accessToken = jwtUtil.generateAccessToken(saved.getId(), saved.getEmail(), saved.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(saved.getId());

        return new AuthResponse(accessToken, refreshToken, saved.getEmail(), saved.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        return new AuthResponse(accessToken, refreshToken, user.getEmail(), user.getRole().name());
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        UUID userId = jwtUtil.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getId());

        return new AuthResponse(newAccessToken, newRefreshToken, user.getEmail(), user.getRole().name());
    }
}
