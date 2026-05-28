package edu.cit.sultan.unsaidcebu.exception;

/**
 * Domain exception for authentication failures. The {@code code} maps to an
 * SDD §5.3 internal error code (AUTH-001, AUTH-002, AUTH-007, …) so the
 * frontend can trigger specific UI logic (auto-logout, etc.).
 */
public class AuthException extends RuntimeException {

    private final String code;

    public AuthException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
