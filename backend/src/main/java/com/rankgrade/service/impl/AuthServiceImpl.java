package com.rankgrade.service.impl;

import com.rankgrade.dto.request.LoginRequest;
import com.rankgrade.dto.request.RegisterRequest;
import com.rankgrade.dto.response.AuthResponse;
import com.rankgrade.entity.User;
import com.rankgrade.exception.DuplicateResourceException;
import com.rankgrade.repository.UserRepository;
import com.rankgrade.security.JwtUtils;
import com.rankgrade.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already in use: " + request.getEmail());
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        }

        // IMPORTANT: Public registration always creates STUDENT role only
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(User.Role.STUDENT)  // Hardcoded – no admin self-registration
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtUtils.generateTokenFromUsername(savedUser.getEmail());

        return buildAuthResponse(savedUser, token);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Try login with email or username
        String principal = request.getUsernameOrEmail();

        // If not email format, look up by username to get email for auth
        if (!principal.contains("@")) {
            User user = userRepository.findByUsername(principal)
                    .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException(
                            "Invalid credentials"));
            principal = user.getEmail();
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(principal, request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtils.generateToken(authentication);

        User user = userRepository.findByEmail(principal)
                .orElseThrow();

        return buildAuthResponse(user, token);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
