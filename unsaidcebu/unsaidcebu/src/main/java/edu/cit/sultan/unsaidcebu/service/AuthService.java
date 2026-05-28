package edu.cit.sultan.unsaidcebu.service;

import edu.cit.sultan.unsaidcebu.dto.AuthResponse;
import edu.cit.sultan.unsaidcebu.dto.LoginRequest;
import edu.cit.sultan.unsaidcebu.dto.RegisterRequest;
import edu.cit.sultan.unsaidcebu.entity.User;
import edu.cit.sultan.unsaidcebu.exception.AuthException;
import edu.cit.sultan.unsaidcebu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("AUTH-007", "Email already registered");
        }

        User user = new User();
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setName(request.resolvedFullName());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        User saved = userRepository.save(user);
        String access = jwtService.generateToken(saved.getId(), saved.getEmail(), saved.getRole());
        String refresh = jwtService.generateRefreshToken(saved.getId(), saved.getEmail());

        return buildResponse(saved, "User registered successfully", access, refresh);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("AUTH-001", "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException("AUTH-001", "Invalid email or password");
        }

        String role = user.getRole() == null ? "USER" : user.getRole();
        String access = jwtService.generateToken(user.getId(), user.getEmail(), role);
        String refresh = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        return buildResponse(user, "Login successful", access, refresh);
    }

    private AuthResponse buildResponse(User u, String message, String access, String refresh) {
        AuthResponse r = new AuthResponse();
        // Legacy flat shape (mobile / older web)
        r.setUserId(u.getId());
        r.setName(u.getName());
        r.setEmail(u.getEmail());
        r.setMessage(message);
        r.setToken(access);
        // SDD §5.2 shape
        r.setFirstname(u.getFirstname());
        r.setLastname(u.getLastname());
        r.setRole(u.getRole() == null ? "USER" : u.getRole());
        r.setAccessToken(access);
        r.setRefreshToken(refresh);
        return r;
    }
}
