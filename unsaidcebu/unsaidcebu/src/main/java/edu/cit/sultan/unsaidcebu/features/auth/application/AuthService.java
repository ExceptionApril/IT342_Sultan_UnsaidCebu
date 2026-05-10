package edu.cit.sultan.unsaidcebu.features.auth.application;

import edu.cit.sultan.unsaidcebu.features.auth.api.AuthResponse;
import edu.cit.sultan.unsaidcebu.features.auth.api.LoginRequest;
import edu.cit.sultan.unsaidcebu.features.auth.api.RegisterRequest;
import edu.cit.sultan.unsaidcebu.features.auth.domain.User;
import edu.cit.sultan.unsaidcebu.features.auth.infrastructure.UserRepository;
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
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyRegisteredException(request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        return new AuthResponse(
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail(),
            "User registered successfully"
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        return new AuthResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            "Login successful"
        );
    }
}
