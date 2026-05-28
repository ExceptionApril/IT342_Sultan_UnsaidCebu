package edu.cit.sultan.unsaidcebu.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Spring Security configuration — JWT stateless API.
 *
 * Hardening notes (SDD §3.2):
 *  - BCrypt strength = 12
 *  - CORS narrowed to known web + mobile origins (configurable)
 *  - CSRF disabled (we don't use cookies for auth)
 *  - Admin moderation endpoints require the ADMIN role
 *  - Method-level security enabled (@PreAuthorize)
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    /**
     * Comma-separated list of allowed origin patterns. Override per environment
     * via {@code app.cors.allowed-origins} in application.properties.
     */
    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:8080,capacitor://localhost,http://10.0.2.2:*}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        // SDD §3.2: bcrypt salt rounds = 12
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();
        config.setAllowedOriginPatterns(origins.isEmpty() ? List.of("*") : origins);
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept",
                "Origin", "X-Requested-With"));
        config.setExposedHeaders(Collections.singletonList("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors().configurationSource(corsConfigurationSource())
            .and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests()
                // Auth + health are always public
                .antMatchers("/api/auth/**", "/api/v1/auth/**").permitAll()
                .antMatchers("/actuator/health", "/error").permitAll()
                // Admin moderation endpoints require ADMIN role
                .antMatchers("/api/admin/**", "/api/v1/admin/**").hasAuthority("ROLE_ADMIN")
                // Reading posts is public (anyone can browse)
                .antMatchers(HttpMethod.GET, "/api/posts/**", "/api/v1/posts/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/feed", "/api/v1/feed").permitAll()
                // Mutations on posts require a valid JWT
                .antMatchers(HttpMethod.POST, "/api/posts/**", "/api/v1/posts/**").authenticated()
                .antMatchers(HttpMethod.DELETE, "/api/posts/**", "/api/v1/posts/**").authenticated()
                .anyRequest().permitAll()
            .and()
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .formLogin().disable()
            .httpBasic().disable();

        return http.build();
    }
}
