package com.edutech.healthcare_appointment_management_system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.healthcare_appointment_management_system.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {


    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameAndRole(String username, String role);

 
    boolean existsByUsername(String username);


    List<User> findByRole(String role);

    List<User> findByRoleAndActiveTrue(String role);

    List<User> findByRoleAndActiveFalse(String role);

    List<User> findByActiveTrue();
}