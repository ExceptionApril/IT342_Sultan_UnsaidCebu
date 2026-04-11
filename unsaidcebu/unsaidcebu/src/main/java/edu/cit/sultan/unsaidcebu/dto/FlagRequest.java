package edu.cit.sultan.unsaidcebu.dto;

import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FlagRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    private String reason = "INAPPROPRIATE";
}
