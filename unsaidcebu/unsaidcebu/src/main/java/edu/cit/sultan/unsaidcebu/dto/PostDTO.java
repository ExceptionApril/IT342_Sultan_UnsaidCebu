package edu.cit.sultan.unsaidcebu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Long id;
    private Long userId;
    private String anonName;    // generated anon display name
    private String content;
    private Double latitude;
    private Double longitude;
    private Integer upvotes;
    private Integer downvotes;
    private Integer flagCount;
    private Boolean isHidden;
    private LocalDateTime createdAt;
    private String userVote;    // "UPVOTE", "DOWNVOTE", or null
    private Boolean userFlagged;
    private Integer replyCount;
}
