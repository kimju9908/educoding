package com.kh.totalproject.repository;

import com.kh.totalproject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByUserId(String userId);
    Optional<User> findByEmail(String email);
    Optional<User> findByUserKey(Long userKey);
    List<User> findByUserKeyIn(List<Long> userKeys);
    Optional<User> findByGoogleemail(String googleemail);
    Optional<User> findByNickname(String nickname);
    Optional<User> findByUserIdAndEmail(String userId, String email);
    boolean existsByEmail(String email);
    boolean existsByUserId(String userId);
    boolean existsByNickname(String nickname);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByGoogleemail(String googleemail);
    boolean existsByNaveremail(String naveremail);
    boolean existsByKakaoemail(String kakaoemail);

}
