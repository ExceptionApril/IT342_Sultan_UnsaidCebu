package edu.cit.sultan.unsaidcebu.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Arrays;
import java.util.Date;

@Component
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration.ms:86400000}")
    private long expirationMs;

    /** Refresh tokens live longer than access tokens. Defaults to 14 days. */
    @Value("${jwt.refresh.expiration.ms:1209600000}")
    private long refreshExpirationMs;

    private Key signingKey() {
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        // Ensure exactly 32 bytes for HS256
        byte[] key = new byte[32];
        Arrays.fill(key, (byte) 0);
        System.arraycopy(raw, 0, key, 0, Math.min(raw.length, 32));
        return Keys.hmacShaKeyFor(key);
    }

    public String generateToken(Long userId, String email) {
        return generateToken(userId, email, "USER");
    }

    public String generateToken(Long userId, String email, String role) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role == null ? "USER" : role)
                .claim("typ", "access")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(signingKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(Long userId, String email) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("email", email)
                .claim("typ", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
                .signWith(signingKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractRole(String token) {
        Object r = parseClaims(token).get("role");
        return r == null ? "USER" : String.valueOf(r);
    }

    public Long extractUserId(String token) {
        return Long.parseLong(parseClaims(token).getSubject());
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
