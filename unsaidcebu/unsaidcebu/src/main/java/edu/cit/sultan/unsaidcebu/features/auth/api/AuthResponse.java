package edu.cit.sultan.unsaidcebu.features.auth.api;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private Long userId;
    private String name;
    private String email;
    private String message;

    public AuthResponse(String message) {
        this.message = message;
    }
}
