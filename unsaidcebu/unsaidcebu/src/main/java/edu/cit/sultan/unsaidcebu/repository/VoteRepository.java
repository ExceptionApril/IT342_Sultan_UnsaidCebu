package edu.cit.sultan.unsaidcebu.repository;

import edu.cit.sultan.unsaidcebu.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByPostIdAndUserId(Long postId, Long userId);
    List<Vote> findByUserIdAndPostIdIn(Long userId, List<Long> postIds);
    long countByPostId(Long postId);
}
