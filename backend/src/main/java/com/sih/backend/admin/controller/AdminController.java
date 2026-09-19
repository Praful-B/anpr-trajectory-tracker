package com.sih.backend.admin.controller;

import com.sih.backend.auth.entity.Role;
import com.sih.backend.auth.entity.User;
import com.sih.backend.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users")
    @Transactional
    public ResponseEntity<User> createUser(@RequestBody AdminUserRequest request) {
        User user = new User();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setPasswordHash(request.password()); // In production, encode this
        user.setRole(Role.valueOf(request.role()));
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PatchMapping("/users/{id}/role")
    @Transactional
    public ResponseEntity<User> updateUserRole(@PathVariable UUID id, @RequestBody AdminUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.valueOf(request.role()));
        return ResponseEntity.ok(userRepository.save(user));
    }
}

record AdminUserRequest(
        String email,
        String fullName,
        String password,
        String role
) {}
