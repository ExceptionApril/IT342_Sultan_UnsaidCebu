package edu.cit.sultan.unsaidcebu.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Accepts both the legacy {name} payload from older mobile clients
 * AND the SDD §5.2 {firstname, lastname} shape from web/v2 clients.
 *
 * Validation rule: either `name` OR (`firstname` + `lastname`) must be provided.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    /** Legacy field — full name. Optional if firstname/lastname provided. */
    @Size(max = 100)
    private String name;

    /** SDD-compliant first name. */
    @Size(max = 50)
    private String firstname;

    /** SDD-compliant last name. */
    @Size(max = 50)
    private String lastname;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    /** Convenience accessor — resolves which name field the client sent. */
    public String resolvedFullName() {
        if (name != null && !name.isBlank()) return name.trim();
        String f = firstname == null ? "" : firstname.trim();
        String l = lastname == null ? "" : lastname.trim();
        String full = (f + " " + l).trim();
        return full.isBlank() ? "Anonymous" : full;
    }
}
