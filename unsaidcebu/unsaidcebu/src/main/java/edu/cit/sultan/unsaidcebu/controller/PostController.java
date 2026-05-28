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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({ "/api/posts", "/api/v1/posts" })
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    /** GET /api/posts?userId={userId} — public, no auth required */
    @GetMapping
    public ResponseEntity<List<PostDTO>> getPosts(
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(postService.getAllPosts(userId));
    }

    /** POST /api/posts — requires JWT */
    @PostMapping
    public ResponseEntity<?> createPost(@Valid @RequestBody CreatePostRequest request,
                                        Authentication auth) {
        // JWT userId always takes precedence over body userId
        if (auth != null) request.setUserId((Long) auth.getPrincipal());
        try {
            PostDTO created = postService.createPost(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** POST /api/posts/{id}/vote — requires JWT */
    @PostMapping("/{id}/vote")
    public ResponseEntity<?> vote(@PathVariable Long id,
                                   @RequestBody VoteRequest request,
                                   Authentication auth) {
        if (auth != null) request.setUserId((Long) auth.getPrincipal());
        try {
            PostDTO updated = postService.vote(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** POST /api/posts/{id}/flag — requires JWT */
    @PostMapping("/{id}/flag")
    public ResponseEntity<?> flag(@PathVariable Long id,
                                   @RequestBody FlagRequest request,
                                   Authentication auth) {
        if (auth != null) request.setUserId((Long) auth.getPrincipal());
        try {
            PostDTO updated = postService.flag(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
