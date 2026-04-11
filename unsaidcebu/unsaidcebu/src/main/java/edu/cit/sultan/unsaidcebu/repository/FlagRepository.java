package edu.cit.sultan.unsaidcebu.repository;

import edu.cit.sultan.unsaidcebu.entity.Flag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlagRepository extends JpaRepository<Flag, Long> {
    Optional<Flag> findByPostIdAndUserId(Long postId, Long userId);
    List<Flag> findByUserIdAndPostIdIn(Long userId, List<Long> postIds);
    long countByPostId(Long postId);
}
