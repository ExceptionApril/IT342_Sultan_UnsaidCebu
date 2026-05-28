package edu.cit.sultan.unsaidcebu.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

/**
 * Standard API response envelope per SDD §5.1.
 * {
 *   "success": true|false,
 *   "data":    <T>,
 *   "error":   { "code", "message", "details" } | null,
 *   "timestamp": "ISO-8601 Z"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.ALWAYS)
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private ApiError error;
    private String timestamp;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null, Instant.now().toString());
    }

    public static <T> ApiResponse<T> fail(String code, String message) {
        return new ApiResponse<>(false, null,
                new ApiError(code, message, null), Instant.now().toString());
    }

    public static <T> ApiResponse<T> fail(String code, String message, Map<String, ?> details) {
        return new ApiResponse<>(false, null,
                new ApiError(code, message, details), Instant.now().toString());
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiError {
        private String code;
        private String message;
        private Object details;
    }
}
