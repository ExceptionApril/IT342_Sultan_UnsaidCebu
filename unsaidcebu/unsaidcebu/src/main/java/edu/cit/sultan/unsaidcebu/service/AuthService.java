package edu.cit.sultan.unsaidcebu.service;

import edu.cit.sultan.unsaidcebu.dto.AuthResponse;
import edu.cit.sultan.unsaidcebu.dto.LoginRequest;
import edu.cit.sultan.unsaidcebu.dto.RegisterRequest;
import edu.cit.sultan.unsaidcebu.entity.User;
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
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        // Hash the password using BCrypt
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Save user to database
        User savedUser = userRepository.save(user);
        
        // Return response
        return new AuthResponse(
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail(),
            "User registered successfully"
        );
    }
    
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        // Return response
        return new AuthResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            "Login successful"
        );
    }
}
