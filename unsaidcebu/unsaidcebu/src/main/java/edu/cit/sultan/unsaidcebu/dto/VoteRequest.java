package edu.cit.sultan.unsaidcebu.dto;

import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VoteRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Vote type is required")
    private String voteType; // "UPVOTE" or "DOWNVOTE"
}
