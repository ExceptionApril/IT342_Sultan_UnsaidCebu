package edu.cit.sultan.unsaidcebu.service;

import edu.cit.sultan.unsaidcebu.dto.CreatePostRequest;
import edu.cit.sultan.unsaidcebu.dto.FlagRequest;
import edu.cit.sultan.unsaidcebu.dto.PostDTO;
import edu.cit.sultan.unsaidcebu.dto.VoteRequest;
import edu.cit.sultan.unsaidcebu.entity.Flag;
import edu.cit.sultan.unsaidcebu.entity.Post;
import edu.cit.sultan.unsaidcebu.entity.User;
import edu.cit.sultan.unsaidcebu.entity.Vote;
import edu.cit.sultan.unsaidcebu.repository.FlagRepository;
import edu.cit.sultan.unsaidcebu.repository.PostRepository;
import edu.cit.sultan.unsaidcebu.repository.UserRepository;
import edu.cit.sultan.unsaidcebu.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;
    private final FlagRepository flagRepository;

    private static final String[] ANON_WORDS = {
        "Wanderer", "Dreamer", "Whisperer", "Shadow", "Listener", "Stranger", "Ghost", "Voice"
    };

    private String buildAnonName(Long userId) {
        int idx = (int) (userId % ANON_WORDS.length);
        return "Anonymous " + ANON_WORDS[idx];
    }

    public List<PostDTO> getAllPosts(Long requestingUserId) {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        List<Long> postIds = posts.stream().map(Post::getId).collect(Collectors.toList());

        // Fetch user's votes and flags in bulk
        Map<Long, String> userVotes = Map.of();
        Map<Long, Boolean> userFlags = Map.of();

        if (requestingUserId != null && !postIds.isEmpty()) {
            userVotes = voteRepository.findByUserIdAndPostIdIn(requestingUserId, postIds)
                .stream().collect(Collectors.toMap(v -> v.getPost().getId(), Vote::getVoteType));
            userFlags = flagRepository.findByUserIdAndPostIdIn(requestingUserId, postIds)
                .stream().collect(Collectors.toMap(f -> f.getPost().getId(), f -> true));
        }

        final Map<Long, String> finalVotes = userVotes;
        final Map<Long, Boolean> finalFlags = userFlags;

        return posts.stream().map(p -> toDTO(p, finalVotes.get(p.getId()), finalFlags.getOrDefault(p.getId(), false))).collect(Collectors.toList());
    }

    @Transactional
    public PostDTO createPost(CreatePostRequest request) {
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Basic toxicity check (keyword-based)
        String lower = request.getContent().toLowerCase();
        String[] toxicWords = {"hate", "kill", "die", "stupid", "idiot", "loser", "ugly", "worthless"};
        long hits = 0;
        for (String w : toxicWords) {
            if (lower.contains(w)) hits++;
        }
        double score = (double) hits / toxicWords.length;
        if (score >= 0.70) {
            throw new RuntimeException("Post blocked due to inappropriate content (toxicity score too high).");
        }

        Post post = new Post();
        post.setUser(user);
        post.setContent(request.getContent());
        post.setLatitude(request.getLatitude());
        post.setLongitude(request.getLongitude());
        post.setUpvotes(0);
        post.setDownvotes(0);
        post.setFlagCount(0);
        post.setIsHidden(false);

        Post saved = postRepository.save(post);
        return toDTO(saved, null, false);
    }

    @Transactional
    public PostDTO vote(Long postId, VoteRequest request) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String newType = request.getVoteType();
        if (!newType.equals("UPVOTE") && !newType.equals("DOWNVOTE")) {
            throw new RuntimeException("Invalid vote type");
        }

        Optional<Vote> existing = voteRepository.findByPostIdAndUserId(postId, request.getUserId());

        if (existing.isPresent()) {
            Vote v = existing.get();
            if (v.getVoteType().equals(newType)) {
                // Toggle off: remove vote
                voteRepository.delete(v);
                if (newType.equals("UPVOTE")) post.setUpvotes(Math.max(0, post.getUpvotes() - 1));
                else post.setDownvotes(Math.max(0, post.getDownvotes() - 1));
                postRepository.save(post);
                return toDTO(post, null, flagRepository.findByPostIdAndUserId(postId, request.getUserId()).isPresent());
            } else {
                // Switch vote
                String old = v.getVoteType();
                v.setVoteType(newType);
                voteRepository.save(v);
                if (old.equals("UPVOTE")) post.setUpvotes(Math.max(0, post.getUpvotes() - 1));
                else post.setDownvotes(Math.max(0, post.getDownvotes() - 1));
                if (newType.equals("UPVOTE")) post.setUpvotes(post.getUpvotes() + 1);
                else post.setDownvotes(post.getDownvotes() + 1);
                postRepository.save(post);
                return toDTO(post, newType, flagRepository.findByPostIdAndUserId(postId, request.getUserId()).isPresent());
            }
        }

        // New vote
        Vote vote = new Vote();
        vote.setPost(post);
        vote.setUser(user);
        vote.setVoteType(newType);
        voteRepository.save(vote);
        if (newType.equals("UPVOTE")) post.setUpvotes(post.getUpvotes() + 1);
        else post.setDownvotes(post.getDownvotes() + 1);
        postRepository.save(post);
        return toDTO(post, newType, flagRepository.findByPostIdAndUserId(postId, request.getUserId()).isPresent());
    }

    @Transactional
    public PostDTO flag(Long postId, FlagRequest request) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (flagRepository.findByPostIdAndUserId(postId, request.getUserId()).isPresent()) {
            throw new RuntimeException("Already flagged");
        }

        Flag flag = new Flag();
        flag.setPost(post);
        flag.setUser(user);
        flag.setReason(request.getReason() != null ? request.getReason() : "INAPPROPRIATE");
        flagRepository.save(flag);

        post.setFlagCount(post.getFlagCount() + 1);
        if (post.getFlagCount() >= 5) post.setIsHidden(true);
        postRepository.save(post);

        return toDTO(post, voteRepository.findByPostIdAndUserId(postId, request.getUserId())
            .map(Vote::getVoteType).orElse(null), true);
    }

    private PostDTO toDTO(Post p, String userVote, boolean userFlagged) {
        PostDTO dto = new PostDTO();
        dto.setId(p.getId());
        dto.setUserId(p.getUser().getId());
        dto.setAnonName(buildAnonName(p.getUser().getId()));
        dto.setContent(p.getContent());
        dto.setLatitude(p.getLatitude());
        dto.setLongitude(p.getLongitude());
        dto.setUpvotes(p.getUpvotes());
        dto.setDownvotes(p.getDownvotes());
        dto.setFlagCount(p.getFlagCount());
        dto.setIsHidden(p.getIsHidden());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUserVote(userVote);
        dto.setUserFlagged(userFlagged);
        dto.setReplyCount(0); // extend later
        return dto;
    }
}
