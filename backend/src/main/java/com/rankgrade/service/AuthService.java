package com.rankgrade.service;

import com.rankgrade.dto.request.LoginRequest;
import com.rankgrade.dto.request.RegisterRequest;
import com.rankgrade.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
