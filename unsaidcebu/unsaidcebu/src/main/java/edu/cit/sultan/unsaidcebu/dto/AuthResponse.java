package edu.cit.sultan.unsaidcebu.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Auth response payload — shaped to satisfy SDD §5.2 (firstname / lastname /
 * accessToken / refreshToken / role) while staying backward-compatible with the
 * legacy mobile client (token / name / userId).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    // ── Legacy flat fields (kept so old Android Retrofit DTO still parses) ──
    private Long userId;
    private String name;
    private String email;
    private String message;
    private String token;

    // ── SDD-compliant fields ──
    private String firstname;
    private String lastname;
    private String role;
    private String accessToken;
    private String refreshToken;

    /** Error-only constructor. */
    public AuthResponse(String message) {
        this.message = message;
    }
}
