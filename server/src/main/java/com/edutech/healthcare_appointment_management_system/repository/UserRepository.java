package com.edutech.healthcare_appointment_management_system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.healthcare_appointment_management_system.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ✅ Login / JWT
    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameAndRole(String username, String role);

    // ✅ Registration validations
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // ✅ Admin lists by role
    List<User> findByRole(String role);

    // ✅ Admin lists by role + active status
    List<User> findByRoleAndActiveTrue(String role);

    List<User> findByRoleAndActiveFalse(String role);

    // ✅ Optional: global active users list
    List<User> findByActiveTrue();
}