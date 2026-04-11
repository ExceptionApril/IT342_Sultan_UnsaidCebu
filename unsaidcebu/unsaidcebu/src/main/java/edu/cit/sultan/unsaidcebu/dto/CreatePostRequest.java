package edu.cit.sultan.unsaidcebu.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePostRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Content is required")
    @Size(max = 500, message = "Post must be 500 characters or fewer")
    private String content;

    private Double latitude;
    private Double longitude;
}
