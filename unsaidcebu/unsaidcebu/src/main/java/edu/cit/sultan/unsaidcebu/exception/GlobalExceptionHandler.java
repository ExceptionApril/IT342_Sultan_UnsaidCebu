package edu.cit.sultan.unsaidcebu.exception;

import edu.cit.sultan.unsaidcebu.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Centralised error mapping. Every exception leaves the server wrapped in the
 * SDD §5.1 envelope so the frontend can rely on a single shape.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(err -> {
            String field = err instanceof FieldError ? ((FieldError) err).getField() : "input";
            fieldErrors.put(field, err.getDefaultMessage());
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail("VALID-001", "Validation failed", fieldErrors));
    }

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuth(AuthException ex) {
        HttpStatus status;
        switch (ex.getCode()) {
            case "AUTH-001":
            case "AUTH-002":
                status = HttpStatus.UNAUTHORIZED;
                break;
            case "AUTH-007":
                status = HttpStatus.CONFLICT;
                break;
            default:
                status = HttpStatus.BAD_REQUEST;
        }
        return ResponseEntity.status(status)
                .body(ApiResponse.fail(ex.getCode(), ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.fail("AUTH-003", "Insufficient permissions"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntime(RuntimeException ex) {
        // Default — best effort: 400 with a generic code
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail("BIZ-000", ex.getMessage()));
    }
}
