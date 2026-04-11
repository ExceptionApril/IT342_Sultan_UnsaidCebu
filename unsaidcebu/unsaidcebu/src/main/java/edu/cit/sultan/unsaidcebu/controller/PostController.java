package edu.cit.sultan.unsaidcebu.controller;

import edu.cit.sultan.unsaidcebu.dto.CreatePostRequest;
import edu.cit.sultan.unsaidcebu.dto.FlagRequest;
import edu.cit.sultan.unsaidcebu.dto.PostDTO;
import edu.cit.sultan.unsaidcebu.dto.VoteRequest;
import edu.cit.sultan.unsaidcebu.service.PostService;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    /**
     * GET /api/posts?userId={userId}
     * Returns all posts (nearest-first filtering is done client-side).
     * Pass userId to enrich with voting/flagging data.
     */
    @GetMapping
    public ResponseEntity<List<PostDTO>> getPosts(
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(postService.getAllPosts(userId));
    }

    /**
     * POST /api/posts
     * Create a new anonymous post.
     */
    @PostMapping
    public ResponseEntity<?> createPost(@Valid @RequestBody CreatePostRequest request) {
        try {
            PostDTO created = postService.createPost(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * POST /api/posts/{id}/vote
     * Upvote or downvote a post (toggles off if same vote).
     */
    @PostMapping("/{id}/vote")
    public ResponseEntity<?> vote(@PathVariable Long id,
                                   @Valid @RequestBody VoteRequest request) {
        try {
            PostDTO updated = postService.vote(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * POST /api/posts/{id}/flag
     * Flag a post as inappropriate.
     */
    @PostMapping("/{id}/flag")
    public ResponseEntity<?> flag(@PathVariable Long id,
                                   @Valid @RequestBody FlagRequest request) {
        try {
            PostDTO updated = postService.flag(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
