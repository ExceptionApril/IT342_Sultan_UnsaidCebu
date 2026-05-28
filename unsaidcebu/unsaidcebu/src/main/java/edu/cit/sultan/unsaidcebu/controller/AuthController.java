package edu.cit.sultan.unsaidcebu.controller;

import edu.cit.sultan.unsaidcebu.dto.ApiResponse;
import edu.cit.sultan.unsaidcebu.dto.AuthResponse;
import edu.cit.sultan.unsaidcebu.dto.LoginRequest;
import edu.cit.sultan.unsaidcebu.dto.RegisterRequest;
import edu.cit.sultan.unsaidcebu.service.AuthService;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication endpoints. Both /api/auth/** (legacy) and /api/v1/auth/**
 * (SDD-compliant) hit the same handlers via the dual mapping below.
 *
 * Successful responses are wrapped in {@link ApiResponse}; error responses are
 * produced by {@link edu.cit.sultan.unsaidcebu.exception.GlobalExceptionHandler}
 * so the envelope shape is uniform.
 */
@RestController
@RequestMapping({ "/api/auth", "/api/v1/auth" })
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.ok("Authentication API is running"));
    }
}
