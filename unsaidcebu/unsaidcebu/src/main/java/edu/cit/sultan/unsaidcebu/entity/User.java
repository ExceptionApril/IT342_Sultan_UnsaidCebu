package edu.cit.sultan.unsaidcebu.entity;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Display name — kept for backward compatibility with older mobile clients. */
    @Size(max = 100)
    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "firstname", length = 100)
    private String firstname;

    @Column(name = "lastname", length = 100)
    private String lastname;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;

    /** USER (default) or ADMIN — enforced via Spring Security. */
    @Column(name = "role", length = 20)
    private String role;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (role == null || role.isBlank()) role = "USER";
        // Keep `name` in sync so existing UI components keep working
        if ((name == null || name.isBlank())
                && (firstname != null || lastname != null)) {
            name = ((firstname == null ? "" : firstname) + " " +
                    (lastname  == null ? "" : lastname)).trim();
        }
    }
}
